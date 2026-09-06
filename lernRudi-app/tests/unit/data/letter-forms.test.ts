import { describe, it, expect } from 'vitest';
import {
  LETTER_FAMILIES,
  getLetterForm,
  requireLetterForm,
  listLetterGlyphs,
  getFamilyForLetter,
  LINE
} from '$lib/data/letter-forms';

describe('letter-forms catalog', () => {
  it('covers families 1-3 with 13 letters', () => {
    expect(LETTER_FAMILIES).toHaveLength(3);
    expect(listLetterGlyphs()).toEqual(['c', 'o', 'a', 'd', 'g', 'i', 'u', 'l', 't', 'n', 'm', 'h']);
  });

  it('gives every letter at least one stroke with enough points', () => {
    for (const glyph of listLetterGlyphs()) {
      const form = requireLetterForm(glyph);
      expect(form.strokes.length).toBeGreaterThan(0);
      form.strokes.forEach((stroke) => {
        expect(stroke.points.length).toBeGreaterThanOrEqual(2);
        stroke.points.forEach((point) => {
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.x).toBeLessThanOrEqual(1);
          expect(point.y).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeLessThanOrEqual(1);
        });
      });
    }
  });

  it('places d in the ascender box and g in the descender box', () => {
    expect(requireLetterForm('d').box).toBe('ascender');
    expect(requireLetterForm('g').box).toBe('descender');
    expect(requireLetterForm('a').box).toBe('x-height');
  });

  it('uses four-line proportions', () => {
    expect(LINE.X_HEIGHT).toBeCloseTo(1 / 3);
    expect(LINE.BASELINE).toBeCloseTo(2 / 3);
  });

  it('returns undefined for unknown glyphs', () => {
    expect(getLetterForm('z')).toBeUndefined();
    expect(getFamilyForLetter('q')).toBeUndefined();
  });

  it('throws when a required form is missing', () => {
    expect(() => requireLetterForm('z')).toThrow(/No letter form/);
  });
});
