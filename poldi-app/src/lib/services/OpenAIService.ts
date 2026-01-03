/**
 * OpenAI Service - Handles Whisper transcription and GPT story scoring
 * for the storytelling feature in Flinki App
 */

export interface StoryScore {
  coherence: number;      // 0-3: Does story make sense?
  vocabulary: number;     // 0-3: Age-appropriate word variety
  structure: number;      // 0-3: Beginning/middle/end present
  creativity: number;     // 0-3: Original ideas
  total: number;          // 0-12 total score
  feedback: string;       // Encouraging feedback message
  transcription: string;  // The transcribed text
}

export interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

class OpenAIServiceClass {
  private apiKey: string | undefined;

  constructor() {
    // Get API key from environment variable
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      return { text: '', success: false, error: 'OpenAI API key not configured' };
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'de'); // German

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { text: '', success: false, error: error.error?.message || 'Transcription failed' };
      }

      const result = await response.json();
      return { text: result.text, success: true };
    } catch (error) {
      return { text: '', success: false, error: `Network error: ${error}` };
    }
  }

  /**
   * Score a story using GPT-4
   */
  async scoreStory(transcription: string, prompt: string): Promise<StoryScore> {
    if (!this.apiKey) {
      return this.getDefaultScore(transcription, 'API nicht konfiguriert');
    }

    if (!transcription || transcription.trim().length < 10) {
      return this.getDefaultScore(transcription, 'Die Geschichte war zu kurz. Erzähl mir mehr!');
    }

    try {
      const systemPrompt = `Du bist ein freundlicher Lehrer, der Geschichten von Vorschulkindern (5-7 Jahre) bewertet.
Bewerte die folgende Geschichte auf einer Skala von 0-3 für jede Kategorie:

1. Kohärenz (coherence): Ergibt die Geschichte Sinn? Sind die Ereignisse logisch verbunden?
2. Wortschatz (vocabulary): Verwendet das Kind altersgerechte und vielfältige Wörter?
3. Struktur (structure): Hat die Geschichte einen Anfang, eine Mitte und ein Ende?
4. Kreativität (creativity): Zeigt die Geschichte originelle Ideen?

Die Bildaufforderung war: "${prompt}"

Antworte NUR im folgenden JSON-Format:
{
  "coherence": <0-3>,
  "vocabulary": <0-3>,
  "structure": <0-3>,
  "creativity": <0-3>,
  "feedback": "<ermutigende Rückmeldung auf Deutsch, 1-2 Sätze, kindgerecht>"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Die Geschichte des Kindes:\n\n"${transcription}"` }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return this.getDefaultScore(transcription, error.error?.message || 'Bewertung fehlgeschlagen');
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content || '';

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const scores = JSON.parse(jsonMatch[0]);
        return {
          coherence: Math.min(3, Math.max(0, scores.coherence || 0)),
          vocabulary: Math.min(3, Math.max(0, scores.vocabulary || 0)),
          structure: Math.min(3, Math.max(0, scores.structure || 0)),
          creativity: Math.min(3, Math.max(0, scores.creativity || 0)),
          total: (scores.coherence || 0) + (scores.vocabulary || 0) + (scores.structure || 0) + (scores.creativity || 0),
          feedback: scores.feedback || 'Super gemacht!',
          transcription,
        };
      }

      return this.getDefaultScore(transcription, 'Super gemacht!');
    } catch (error) {
      return this.getDefaultScore(transcription, `Fehler: ${error}`);
    }
  }

  private getDefaultScore(transcription: string, feedback: string): StoryScore {
    return {
      coherence: 0,
      vocabulary: 0,
      structure: 0,
      creativity: 0,
      total: 0,
      feedback,
      transcription,
    };
  }
}

// Singleton instance
export const openAIService = new OpenAIServiceClass();
