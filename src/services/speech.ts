/**
 * ReadScribe Speech / Pronunciation Service
 * Cross-platform speech utility supporting Expo Speech and Web SpeechSynthesis.
 */

import { Platform } from 'react-native';

let ExpoSpeech: any = null;
try {
  ExpoSpeech = require('expo-speech');
} catch {
  // Not installed or web fallback
}

export const SpeechService = {
  /**
   * Speak English text with standard British or American accent
   */
  async speak(text: string, rate: number = 0.9): Promise<void> {
    if (!text || !text.trim()) return;
    const clean = text.trim();

    try {
      if (ExpoSpeech && typeof ExpoSpeech.speak === 'function') {
        ExpoSpeech.stop();
        ExpoSpeech.speak(clean, {
          language: 'en-US',
          pitch: 1.0,
          rate,
        });
        return;
      }
    } catch (e) {
      console.warn('ExpoSpeech error:', e);
    }

    // Web SpeechSynthesis fallback
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  },

  stop(): void {
    try {
      if (ExpoSpeech && typeof ExpoSpeech.stop === 'function') {
        ExpoSpeech.stop();
      }
    } catch {}

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};
