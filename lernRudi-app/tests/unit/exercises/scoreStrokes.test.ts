import { describe, it, expect } from 'vitest';
import { requireLetterForm } from '$lib/data/letter-forms';
import { scoreStrokes } from '$lib/exercises/writing/scoreStrokes';
import type { StrokePoint } from '$lib/exercises/writing/scoreStrokes';

function toPixels(glyph: string): StrokePoint[][] {
  const form = requireLetterForm(glyph);
  return form.strokes.map((stroke) =>
    stroke.points.map((point) => ({ x: point.x * 200, y: point.y * 300 }))
  );
}

const options = { hitRadius: 18 };

describe('scoreStrokes', () => {
  it('passes when the user follows the expected path', () => {
    const expected = toPixels('a');
    const score = scoreStrokes(expected, expected, options);
    expect(score.passed).toBe(true);
    expect(score.overall).toBeGreaterThan(0.8);
  });

  it('fails when there are no user strokes', () => {
    const expected = toPixels('c');
    const score = scoreStrokes([], expected, options);
    expect(score.passed).toBe(false);
    expect(score.overall).toBe(0);
  });

  it('fails a scribble far from the letter', () => {
    const expected = toPixels('o');
    const scribble = [[{ x: 10, y: 10 }, { x: 12, y: 14 }, { x: 16, y: 11 }, { x: 20, y: 18 }]];
    const score = scoreStrokes(scribble, expected, options);
    expect(score.passed).toBe(false);
    expect(score.waypointHitRate).toBeLessThan(0.3);
  });

  it('gives d a weak placement score when the stem is missing', () => {
    const expected = toPixels('d');
    const bowlOnly = toPixels('a').slice(0, 1);
    const score = scoreStrokes(bowlOnly, expected, options);
    expect(score.placement).toBeLessThan(0.75);
    expect(score.passed).toBe(false);
  });
});
