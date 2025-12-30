import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechEngine } from '$lib/core/SpeechEngine';

describe('SpeechEngine', () => {
  let engine: SpeechEngine;

  beforeEach(() => {
    engine = new SpeechEngine();
    vi.clearAllMocks();
  });

  describe('Voice Loading', () => {
    it('should initialize voices on construction', async () => {
      expect(engine).toBeDefined();
      const voices = engine.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
    });

    it('should not throw when voices are not yet loaded', async () => {
      await expect(engine.speak('Test')).resolves.not.toThrow();
    });
  });

  describe('Speaking', () => {
    it('should speak text', async () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

      await engine.speak('Hallo');

      expect(speakSpy).toHaveBeenCalled();
      const utterance = speakSpy.mock.calls[0][0];
      expect(utterance.text).toBe('Hallo');
    });

    it('should use German language by default', async () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

      await engine.speak('Test');

      const utterance = speakSpy.mock.calls[0][0];
      expect(utterance.lang).toBe('de-DE');
    });

    it('should use custom speech options', async () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

      await engine.speak('Test', {
        rate: 1.0,
        pitch: 1.5,
        lang: 'en-US'
      });

      const utterance = speakSpy.mock.calls[0][0];
      expect(utterance.rate).toBe(1.0);
      expect(utterance.pitch).toBe(1.5);
      expect(utterance.lang).toBe('en-US');
    });

    it('should cancel previous speech before starting new', async () => {
      const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');

      await engine.speak('First');
      await engine.speak('Second');

      expect(cancelSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Number Sequences', () => {
    it('should speak numbers with pauses', async () => {
      const speakSpy = vi.spyOn(engine, 'speak');

      await engine.speakNumbers([1, 2, 3], 100);

      expect(speakSpy).toHaveBeenCalledTimes(3);
      expect(speakSpy).toHaveBeenNthCalledWith(1, '1');
      expect(speakSpy).toHaveBeenNthCalledWith(2, '2');
      expect(speakSpy).toHaveBeenNthCalledWith(3, '3');
    });

    it('should handle empty number array', async () => {
      await expect(engine.speakNumbers([])).resolves.not.toThrow();
    });
  });

  describe('Sequential Speech', () => {
    it('should speak sequence of requests', async () => {
      const speakSpy = vi.spyOn(engine, 'speak');

      await engine.speakSequence([
        { text: 'First' },
        { text: 'Second', delay: 100 },
        { text: 'Third' }
      ]);

      expect(speakSpy).toHaveBeenCalledTimes(3);
      expect(speakSpy).toHaveBeenNthCalledWith(1, 'First');
      expect(speakSpy).toHaveBeenNthCalledWith(2, 'Second');
      expect(speakSpy).toHaveBeenNthCalledWith(3, 'Third');
    });

    it('should execute callbacks in sequence', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      await engine.speakSequence([
        { text: 'First', callback: callback1 },
        { text: 'Second', callback: callback2 }
      ]);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Cancellation', () => {
    it('should cancel ongoing speech', () => {
      const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');

      engine.cancel();

      expect(cancelSpy).toHaveBeenCalled();
      expect(engine.getIsSpeaking()).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should track speaking state', async () => {
      expect(engine.getIsSpeaking()).toBe(false);

      // Note: In tests, speech completes immediately due to mocking
      await engine.speak('Test');

      // After completion, should be false again
      expect(engine.getIsSpeaking()).toBe(false);
    });
  });
});
