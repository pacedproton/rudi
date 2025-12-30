/**
 * AudioEngine - Web Audio API sound effects for Poldi
 *
 * Provides procedural sound generation for:
 * - Success feedback (rising tone)
 * - Wrong answer (falling tone)
 * - Button clicks (pop sound)
 */

export type SoundType = 'success' | 'wrong' | 'pop';

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private initialized = false;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Ensure audio context is running
   * Required for browsers that suspend audio context by default
   */
  private async ensureAudioContext(): Promise<void> {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    this.initialized = true;
  }

  /**
   * Play a sound effect
   */
  async playSound(type: SoundType): Promise<void> {
    await this.ensureAudioContext();
    if (!this.audioCtx) return;  // Guard against null

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;

    switch (type) {
      case 'success':
        // Rising cheerful tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'wrong':
        // Falling disappointed tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'pop':
        // Quick pop for button clicks
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
  }

  /**
   * Close the audio context
   */
  async close(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      await this.audioCtx.close();
    }
  }

  /**
   * Get audio context state (for debugging)
   */
  getState(): AudioContextState | 'not-initialized' {
    return this.audioCtx ? this.audioCtx.state : 'not-initialized';
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
