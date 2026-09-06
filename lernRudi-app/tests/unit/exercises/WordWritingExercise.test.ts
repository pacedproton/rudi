import { describe, it, expect, vi } from 'vitest';

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

import { WordCopyExercise } from '$lib/exercises/writing/WordCopyExercise';
import { WordMemoryExercise } from '$lib/exercises/writing/WordMemoryExercise';
import { WordDictationExercise } from '$lib/exercises/writing/WordDictationExercise';

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

describe('word writing exercises', () => {
  it('copies a readable word onto lined paper', () => {
    const exercise = new WordCopyExercise({
      type: 'word_copy',
      word: 'da',
      instruction: 'Schreibe das Wort da'
    });
    expect(exercise.type).toBe('word_copy');
    expect(exercise.getInstruction()).toContain('da');
    expect(() => exercise.render(createMockContext())).not.toThrow();
  });

  it('starts look-cover-write in the show phase', () => {
    const exercise = new WordMemoryExercise({
      type: 'word_memory',
      word: 'oma',
      instruction: 'Schreibe oma aus dem Kopf'
    });
    expect(exercise.type).toBe('word_memory');
    expect(exercise.getInstruction()).toMatch(/Lies das Wort/);
    exercise.render(createMockContext());
    exercise.handleInput({ x: 400, y: 550, type: 'end' });
    expect(exercise.getInstruction()).toMatch(/aus dem Kopf/);
  });

  it('speaks the dictated word on start', () => {
    const exercise = new WordDictationExercise({
      type: 'word_dictation',
      word: 'hund',
      instruction: 'Schreibe das Wort, das du hörst',
      icon: 'dog'
    });
    const speech = exercise.onStart();
    expect(exercise.type).toBe('word_dictation');
    expect(speech.some((request) => request.text === 'hund')).toBe(true);
    expect(() => exercise.render(createMockContext())).not.toThrow();
  });
});
