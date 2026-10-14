/**
 * ReadScribe AI Service
 * Powered by Gemini API with smart offline fallback for English -> Uzbek learning.
 */

import { StorageService } from './storage';
import { SentenceAnalysisState } from '../types';

export const AiService = {
  /**
   * Analyzes an English sentence or phrase, providing Uzbek translation, grammatical breakdown, and nuances.
   */
  async analyzeSentence(sentence: string): Promise<Omit<SentenceAnalysisState, 'originalText' | 'isLoading'>> {
    const trimmed = sentence.trim();
    if (!trimmed) {
      return {
        translation: '',
        explanation: 'Iltimos, tahlil qilish uchun matn tanlang.',
        isFromAi: false,
      };
    }

    const apiKey = await StorageService.getApiKey();

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are a helpful and expert English teacher for Uzbek speakers.
Analyze this English sentence:
"${trimmed}"

Respond strictly in valid JSON format with this structure:
{
  "translation": "<Natural, fluent Uzbek translation>",
  "explanation": "<Grammar explanation, idioms, difficult words, and contextual usage explained clearly in Uzbek language>"
}
Only output the JSON object, nothing else.`;

        // Valid model name: gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean JSON markdown tags if present
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          
          return {
            translation: parsed.translation || "Tarjima olinmadi",
            explanation: parsed.explanation || "Tahlil tayyorlandi.",
            isFromAi: true,
          };
        }
      } catch (err) {
        console.warn('[AI Service] API request failed, switching to offline fallback:', err);
      }
    }

    // Smart Offline Rule-Based Fallback
    return generateOfflineAnalysis(trimmed);
  },
};

/**
 * High-quality offline explanation generator for when the user is offline or hasn't added an API key.
 */
function generateOfflineAnalysis(text: string): { translation: string; explanation: string; isFromAi: boolean } {
  const lower = text.toLowerCase();
  let explanationParts: string[] = [];
  
  if (lower.includes('would') || lower.includes('could') || lower.includes('should')) {
    explanationParts.push("• Modal fe'llar (would/could/should): Ehtimollik, maslahat yoki shart maylini bildiradi.");
  }
  if (lower.includes('have been') || lower.includes('has been') || lower.includes('had been')) {
    explanationParts.push("• Perfect zamonlar: Ish-harakat o'tmishda boshlangan va hozirga ta'siri bor yoki davom etmoqda.");
  }
  if (lower.includes('if ') || lower.includes('unless')) {
    explanationParts.push("• Shart ergash gap (Conditionals): Muayyan shart bajarilganda sodir bo'ladigan holat.");
  }
  if (lower.includes('because') || lower.includes('since') || lower.includes('as ')) {
    explanationParts.push("• Sabab-oqibat bog'lovchilari: Natija va uning sababini ifodalaydi.");
  }
  if (lower.includes('although') || lower.includes('however') || lower.includes('despite')) {
    explanationParts.push("• Zidlovchi bog'lovchilar: Qarama-qarshi fikrlarni bog'lash uchun xizmat qiladi.");
  }

  const defaultExplanation = explanationParts.length > 0
    ? explanationParts.join('\n\n')
    : "Ushbu gapning tuzilishi o'rganuvchilar uchun foydali grammatik qoliplarni o'z ichiga olgan. Bosh va ergash gaplarning mantiqiy ketma-ketligiga e'tibor qarating.";

  return {
    translation: "(Offline rejim: To'liq sun'iy intellekt tahlili uchun Sozlamalardan Gemini API kalitingizni kiriting)",
    explanation: defaultExplanation,
    isFromAi: false,
  };
}
