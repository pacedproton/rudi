import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('$lib/core/AudioEngine', () => ({
  audioEngine: { playSound: vi.fn() }
}));

vi.mock('$lib/core/SpeechEngine', () => ({
  speechEngine: { speak: vi.fn() }
}));

vi.mock('$lib/stores/writingMastery', async () => {
  const actual = await vi.importActual<typeof import('$lib/stores/writingMastery')>(
    '$lib/stores/writingMastery'
  );
  return {
    ...actual,
    writingMastery: {
      recordLetter: vi.fn(),
      recordWord: vi.fn(),
      reset: vi.fn(),
      subscribe: vi.fn()
    }
  };
});

import { LetterWriteExercise } from '$lib/exercises/writing/LetterWriteExercise';
import { LetterTraceExercise } from '$lib/exercises/writing/LetterTraceExercise';
import { requireLetterForm } from '$lib/data/letter-forms';
import { getLetterSlot, getPaperLayout, transformLetterStrokes } from '$lib/exercises/writing/paper';

function createMockContext() {
  return {
    ctx: {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
      arc: vi.fn(),
      roundRect: vi.fn()
    } as any,
    width: 800,
    height: 600,
    scale: 1,
    time: 0
  };
}

function traceExpected(exercise: LetterWriteExercise | LetterTraceExercise, glyph: string) {
  const ctx = createMockContext();
  exercise.render(ctx);
  const layout = getPaperLayout(800, 600, 1, 1);
  const expected = transformLetterStrokes(requireLetterForm(glyph), getLetterSlot(layout, 0));
  for (const stroke of expected) {
    exercise.handleInput({ x: stroke[0].x, y: stroke[0].y, type: 'start' });
    for (const point of stroke.slice(1)) {
      exercise.handleInput({ x: point.x, y: point.y, type: 'move' });
    }
    exercise.handleInput({ x: stroke[stroke.length - 1].x, y: stroke[stroke.length - 1].y, type: 'end' });
  }
}

describe('LetterWriteExercise', () => {
  let exercise: LetterWriteExercise;

  beforeEach(() => {
    exercise = new LetterWriteExercise({
      type: 'letter_write',
      character: 'a',
      instruction: 'Schreibe ein a',
      guide: 'faded'
    });
  });

  it('has the writing type and German instruction', () => {
    expect(exercise.type).toBe('letter_write');
    expect(exercise.getInstruction()).toMatch(/Schreibe/);
  });

  it('renders without throwing', () => {
    expect(() => exercise.render(createMockContext())).not.toThrow();
  });

  it('rejects a scribble and stays on the exercise', () => {
    exercise.render(createMockContext());
    exercise.handleInput({ x: 40, y: 40, type: 'start' });
    exercise.handleInput({ x: 50, y: 48, type: 'move' });
    exercise.handleInput({ x: 55, y: 42, type: 'end' });
    exercise.render(createMockContext());
    const result = exercise.handleInput({ x: 80, y: 550, type: 'end' });
    expect(result).toBeNull();
  });

  it('accepts a careful trace of the letter form', () => {
    traceExpected(exercise, 'a');
    exercise.render(createMockContext());
    const result = exercise.handleInput({ x: 80, y: 550, type: 'end' });
    expect(result?.correct).toBe(true);
    expect(result?.metadata?.character).toBe('a');
  });
});

describe('LetterTraceExercise', () => {
  it('registers as letter_trace', () => {
    const exercise = new LetterTraceExercise({
      type: 'letter_trace',
      character: 'c',
      instruction: 'Zeichne den Buchstaben c'
    });
    expect(exercise.type).toBe('letter_trace');
    expect(() => exercise.render(createMockContext())).not.toThrow();
  });
});
