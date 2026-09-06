import { describe, it, expect } from 'vitest';
import {
  applyLetterAttempt,
  applyWordAttempt,
  createEmptyMastery,
  isFamilyUnlocked,
  recentAccuracy,
  highestUnlockedFamily
} from '$lib/stores/writingMastery';
import { LETTER_FAMILIES } from '$lib/data/letter-forms';

describe('writingMastery', () => {
  it('keeps family 1 unlocked and later families locked at first', () => {
    const state = createEmptyMastery();
    expect(isFamilyUnlocked(state, 1)).toBe(true);
    expect(isFamilyUnlocked(state, 2)).toBe(false);
    expect(highestUnlockedFamily(state)).toBe(1);
  });

  it('unlocks the next family after solid recent accuracy', () => {
    let state = createEmptyMastery();
    for (const glyph of LETTER_FAMILIES[0].letters) {
      state = applyLetterAttempt(state, glyph, true);
      state = applyLetterAttempt(state, glyph, true);
    }
    expect(isFamilyUnlocked(state, 2)).toBe(true);
    expect(highestUnlockedFamily(state)).toBe(2);
  });

  it('does not unlock after a single attempt', () => {
    let state = createEmptyMastery();
    for (const glyph of LETTER_FAMILIES[0].letters) {
      state = applyLetterAttempt(state, glyph, true);
    }
    expect(isFamilyUnlocked(state, 2)).toBe(false);
  });

  it('tracks word stages from copy to dictation', () => {
    let state = createEmptyMastery();
    state = applyWordAttempt(state, 'hund', 'copy', true);
    expect(state.words.hund.stage).toBe('memory');
    state = applyWordAttempt(state, 'hund', 'memory', true);
    expect(state.words.hund.stage).toBe('dictation');
  });

  it('computes recent accuracy from the last results', () => {
    expect(recentAccuracy([true, true, false, true, true])).toBeCloseTo(0.8);
    expect(recentAccuracy([])).toBe(0);
  });
});
