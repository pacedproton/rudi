/**
 * SpeechEngine - Fixed Text-to-Speech system for Poldi
 *
 * Fixes from prototype.html:
 * 1. Voice loading race condition - uses Promise-based initialization
 * 2. Dynamic timeout calculation - based on word count, not character count
 * 3. Sequential speech support - for multi-part instructions
 * 4. Number sequence support - for memory exercises
 */

export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export interface SpeechRequest {
  text: string;
  delay?: number;  // ms delay before speaking
  callback?: () => void;
}

export class SpeechEngine {
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private isSpeaking = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initPromise = this.initializeVoices();
    }
  }

  /**
   * FIX 1: Proper voice loading with Promise
   * Waits for voices to be available before proceeding
   */
  private initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      // Guard against SSR
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Try to load voices immediately
      this.voices = window.speechSynthesis.getVoices();

      if (this.voices.length > 0) {
        this.voicesLoaded = true;
        resolve();
        return;
      }

      // Wait for voices to load
      const handleVoicesChanged = () => {
        this.voices = window.speechSynthesis.getVoices();
        if (this.voices.length > 0) {
          this.voicesLoaded = true;
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Safety timeout: if voices don't load in 5s, proceed anyway
      setTimeout(() => {
        if (!this.voicesLoaded) {
          this.voices = window.speechSynthesis.getVoices();
          this.voicesLoaded = true;
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * FIX 2: Ensure voices are loaded before speaking
   * Returns a Promise that resolves when speech is complete
   */
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    // Guard against SSR
    if (typeof window === 'undefined') {
      console.warn('SpeechEngine: Cannot speak in SSR environment');
      return Promise.resolve();
    }

    console.log('SpeechEngine: speak() called with text:', text);
    console.log('SpeechEngine: voicesLoaded:', this.voicesLoaded);

    // Wait for voices to be loaded
    if (!this.voicesLoaded && this.initPromise) {
      console.log('SpeechEngine: Waiting for voices to load...');
      await this.initPromise;
      console.log('SpeechEngine: Voices loaded, count:', this.voices.length);
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech and clear the queue
      window.speechSynthesis.cancel();

      // Small delay to ensure cancel completes
      setTimeout(() => {
        this.speakImmediate(text, options, resolve);
      }, 50);
    });
  }

  /**
   * Internal immediate speak method
   */
  private speakImmediate(text: string, options: SpeechOptions | undefined, resolve: () => void): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'de-DE';
    utterance.rate = options?.rate || 0.85;
    utterance.pitch = options?.pitch || 1.1;

    // Select best German voice
    const germanVoice = this.selectGermanVoice();
    console.log('SpeechEngine: Selected voice:', germanVoice?.name || 'default');
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    // FIX 3: Dynamic safety timeout based on text length
    const estimatedDuration = this.estimateDuration(text, utterance.rate);
    let safetyTimer: ReturnType<typeof setTimeout>;
    let checkInterval: ReturnType<typeof setInterval>;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      this.isSpeaking = false;
      if (checkInterval) clearInterval(checkInterval);
      if (safetyTimer) clearTimeout(safetyTimer);
      resolve();
    };

    utterance.onend = () => {
      console.log('SpeechEngine: utterance ended');
      finish();
    };
    utterance.onerror = (error) => {
      console.error('SpeechEngine: Speech synthesis error:', error);
      finish();
    };
    utterance.onstart = () => {
      console.log('SpeechEngine: utterance started');
    };

    this.isSpeaking = true;
    console.log('SpeechEngine: Calling window.speechSynthesis.speak()');

    // Chrome/Safari workaround: resume speechSynthesis before speaking
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    console.log('SpeechEngine: speak() called, speaking:', window.speechSynthesis.speaking);

    // Chrome workaround: manually check if still speaking
    checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        console.log('SpeechEngine: Detected speech ended via polling');
        finish();
      }
    }, 100);

    // Safety timeout with 50% buffer
    safetyTimer = setTimeout(() => {
      console.warn('Speech synthesis timed out');
      finish();
    }, estimatedDuration * 1.5);
  }

  /**
   * FIX 4: Better duration estimation
   * Uses word count rather than character count
   */
  private estimateDuration(text: string, rate: number): number {
    // Average: 150 words per minute at rate 1.0
    const wordsPerMinute = 150 * rate;
    const words = text.trim().split(/\s+/).length;
    const minutes = words / wordsPerMinute;
    const milliseconds = minutes * 60 * 1000;

    // Minimum duration of 1 second for very short text
    return Math.max(milliseconds, 1000);
  }

  /**
   * Select the best German voice
   */
  private selectGermanVoice(): SpeechSynthesisVoice | null {
    // Prefer exact de-DE match
    const exactMatch = this.voices.find(v => v.lang === 'de-DE');
    if (exactMatch) return exactMatch;

    // Fall back to any German variant
    const germanMatch = this.voices.find(v => v.lang.startsWith('de'));
    if (germanMatch) return germanMatch;

    // Last resort: first available voice
    return this.voices[0] || null;
  }

  /**
   * FIX 5: Sequential speech with delays
   * For multi-part instructions
   */
  async speakSequence(requests: SpeechRequest[]): Promise<void> {
    for (const request of requests) {
      if (request.delay) {
        await this.delay(request.delay);
      }

      if (request.text) {
        await this.speak(request.text);
      }

      if (request.callback) {
        request.callback();
      }
    }
  }

  /**
   * FIX 6: Speak numbers with pauses
   * Specifically for memory exercises
   */
  async speakNumbers(numbers: number[], pauseMs = 600): Promise<void> {
    for (const num of numbers) {
      await this.speak(num.toString());
      await this.delay(pauseMs);
    }
  }

  /**
   * Cancel ongoing speech
   */
  cancel(): void {
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Wait for a specified duration
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get available voices (for debugging)
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }
}

// Singleton instance
export const speechEngine = new SpeechEngine();
