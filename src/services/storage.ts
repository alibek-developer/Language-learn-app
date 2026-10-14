/**
 * ReadScribe Storage Service
 * Robust persistence layer using AsyncStorage with local memory fallback.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingItem, VocabularyWord, WritingNote, ReaderSettings, DEFAULT_READER_SETTINGS, ReadingHistoryEntry } from '../types';
import { INITIAL_READINGS } from '../data/initialReadings';
import { INITIAL_VOCABULARY } from '../data/initialVocab';
import { INITIAL_NOTES } from '../data/initialNotes';

const KEYS = {
  READINGS: '@readscribe_readings',
  VOCABULARY: '@readscribe_vocab',
  NOTES: '@readscribe_notes',
  SETTINGS: '@readscribe_settings',
  HISTORY: '@readscribe_history',
  USER_PROFILE: '@readscribe_user_profile',
  GEMINI_KEY: '@readscribe_gemini_api_key',
};

export interface UserProfile {
  name: string;
  avatarSeed: string;
  dailyGoalMinutes: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalMinutesRead: number;
  level?: string;
  levelName?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alibek',
  avatarSeed: '🎓',
  dailyGoalMinutes: 15,
  streakDays: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalMinutesRead: 120,
  level: 'B1',
  levelName: 'O‘rta daraja',
};

// Memory fallback cache in case AsyncStorage is initializing or encounters issues
const memoryCache: Record<string, any> = {};

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      memoryCache[key] = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
  }
  return memoryCache[key] !== undefined ? memoryCache[key] : defaultValue;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  memoryCache[key] = value;
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to write ${key}:`, err);
  }
}

export const StorageService = {
  // Readings
  async getReadings(): Promise<ReadingItem[]> {
    return getItem<ReadingItem[]>(KEYS.READINGS, INITIAL_READINGS);
  },
  async saveReadings(items: ReadingItem[]): Promise<void> {
    return setItem(KEYS.READINGS, items);
  },

  // Vocabulary
  async getVocabulary(): Promise<VocabularyWord[]> {
    return getItem<VocabularyWord[]>(KEYS.VOCABULARY, INITIAL_VOCABULARY);
  },
  async saveVocabulary(items: VocabularyWord[]): Promise<void> {
    return setItem(KEYS.VOCABULARY, items);
  },

  // Notes
  async getNotes(): Promise<WritingNote[]> {
    return getItem<WritingNote[]>(KEYS.NOTES, INITIAL_NOTES);
  },
  async saveNotes(items: WritingNote[]): Promise<void> {
    return setItem(KEYS.NOTES, items);
  },

  // Settings
  async getSettings(): Promise<ReaderSettings> {
    return getItem<ReaderSettings>(KEYS.SETTINGS, DEFAULT_READER_SETTINGS);
  },
  async saveSettings(settings: ReaderSettings): Promise<void> {
    return setItem(KEYS.SETTINGS, settings);
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    const profile = await getItem<UserProfile>(KEYS.USER_PROFILE, DEFAULT_PROFILE);
    // Check and update streak
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastActiveDate === yesterday) {
        profile.streakDays += 1;
      } else {
        // missed more than 1 day
        profile.streakDays = 1;
      }
      profile.lastActiveDate = today;
      await setItem(KEYS.USER_PROFILE, profile);
    }
    return profile;
  },
  async saveUserProfile(profile: UserProfile): Promise<void> {
    return setItem(KEYS.USER_PROFILE, profile);
  },

  // Reading History
  async getHistory(): Promise<ReadingHistoryEntry[]> {
    return getItem<ReadingHistoryEntry[]>(KEYS.HISTORY, []);
  },
  async addHistoryEntry(entry: ReadingHistoryEntry): Promise<void> {
    const list = await this.getHistory();
    list.unshift(entry);
    // Keep max 50 entries
    if (list.length > 50) list.length = 50;
    return setItem(KEYS.HISTORY, list);
  },

  // Gemini API Key
  async getApiKey(): Promise<string> {
    return getItem<string>(KEYS.GEMINI_KEY, '');
  },
  async saveApiKey(key: string): Promise<void> {
    return setItem(KEYS.GEMINI_KEY, key);
  },
};
