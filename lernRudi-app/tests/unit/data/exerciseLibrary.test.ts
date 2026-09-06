import { describe, it, expect } from 'vitest';
import { flinkiModules } from '$lib/data/modules';
import { icons, labels } from '$lib/data/assets';
import { PrepositionExercise } from '$lib/exercises/spatial/PrepositionExercise';
import { writingModules } from '$lib/data/writing-modules';
import {
  wordsRhyme,
  onsetsMatch,
  countSyllables
} from './contentInvariants';

const iconKeys = new Set(Object.keys(icons));

function collectIconKeys(task: Record<string, any>): string[] {
  const keys: string[] = [];
  const maybePush = (value: unknown) => {
    if (typeof value === 'string' && /^[a-z][a-z0-9_-]*$/i.test(value)) keys.push(value);
  };

  if (task.type === 'preposition') {
    maybePush(task.object);
    maybePush(task.container);
    return keys;
  }

  maybePush(task.target);
  maybePush(task.match);
  maybePush(task.distractor);
  maybePush(task.icon);
  maybePush(task.image);

  if (Array.isArray(task.distractors)) {
    for (const item of task.distractors) maybePush(item);
  }
  if (Array.isArray(task.sequence)) {
    for (const item of task.sequence) maybePush(item);
  }
  if (Array.isArray(task.options) && typeof task.options[0] === 'string') {
    for (const item of task.options) maybePush(item);
  }

  return keys.filter((key) => !['null', 'circle', 'square', 'triangle', 'red', 'blue', 'green', 'yellow'].includes(key));
}

describe('content invariants', () => {
  it('known rhymes pass and false pairs fail', () => {
    expect(wordsRhyme('Maus', 'Haus')).toBe(true);
    expect(wordsRhyme('Hund', 'Mund')).toBe(true);
    expect(wordsRhyme('Fisch', 'Tisch')).toBe(true);
    expect(wordsRhyme('Krone', 'Zitrone')).toBe(true);
    expect(wordsRhyme('Schuh', 'Kuh')).toBe(true);
    expect(wordsRhyme('Boot', 'Brot')).toBe(true);

    expect(wordsRhyme('Katze', 'Ball')).toBe(false);
    expect(wordsRhyme('Stern', 'Berg')).toBe(false);
    expect(wordsRhyme('Baum', 'Baum')).toBe(false);
    expect(wordsRhyme('Ball', 'Banane')).toBe(false);
    expect(wordsRhyme('Boot', 'Kuchen')).toBe(false);
    expect(wordsRhyme('Schuh', 'Banane')).toBe(false);
  });

  it('German onsets treat sch/sp/st/pf as clusters', () => {
    expect(onsetsMatch('Schlange', 'Schere')).toBe(true);
    expect(onsetsMatch('Spinne', 'Schere')).toBe(false);
    expect(onsetsMatch('Schlüssel', 'Schuh')).toBe(true);
  });

  it('pins syllable counts', () => {
    expect(countSyllables('Marienkäfer')).toBe(5);
    expect(countSyllables('Weihnachtsbaum')).toBe(3);
    expect(countSyllables('Banane')).toBe(3);
    expect(countSyllables('Schmetterling')).toBe(3);
    expect(countSyllables('Feuerwehrauto')).toBe(5);
    expect(countSyllables('Schokolade')).toBe(4);
  });
});

describe('exercise library', () => {
  const allTasks = flinkiModules.flatMap((module) =>
    module.tasks.map((task) => ({ moduleId: module.id, task: task as Record<string, any> }))
  );

  it('every pictured key exists in assets', () => {
    const missing: string[] = [];
    for (const { moduleId, task } of allTasks) {
      for (const key of collectIconKeys(task)) {
        if (!iconKeys.has(key)) {
          missing.push(`${moduleId}:${task.type}:${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('every rhyme pairs the spoken word with a rhyming label', () => {
    const rhymes = allTasks.filter(({ task }) => task.type === 'rhyme');
    expect(rhymes.length).toBeGreaterThan(0);

    for (const { task } of rhymes) {
      const targetLabel = labels[task.target as keyof typeof labels];
      expect(targetLabel).toBeDefined();
      expect(wordsRhyme(task.word, targetLabel)).toBe(true);
    }
  });

  it('Anfangslaute pairs share a German onset', () => {
    const initials = allTasks.filter(({ task }) => task.type === 'initial');
    expect(initials.length).toBeGreaterThan(0);

    for (const { task } of initials) {
      const targetLabel = labels[task.target as keyof typeof labels];
      const matchLabel = labels[task.match as keyof typeof labels];
      expect(onsetsMatch(targetLabel, matchLabel)).toBe(true);
    }
  });

  it('syllable counts match the helper', () => {
    const syllables = allTasks.filter(({ task }) => task.type === 'syllables');
    expect(syllables.length).toBeGreaterThan(0);

    for (const { task } of syllables) {
      expect(task.count).toBe(countSyllables(task.word));
    }
  });

  it('spatial speech uses German labels', () => {
    const exercise = new PrepositionExercise({
      type: 'preposition',
      targetRelation: 'auf',
      object: 'cat',
      container: 'car',
      distractors: ['unter', 'neben']
    });
    exercise.initialize(exercise.config as any);
    const instruction = exercise.getInstruction();
    expect(instruction).toContain('Katze');
    expect(instruction).toContain('Auto');
    expect(instruction).not.toMatch(/\bcat\b/);
    expect(instruction).not.toMatch(/\bcar\b/);
  });

  it('bus icon and label agree on a locomotive', () => {
    expect(icons.bus).toBe('🚂');
    expect(labels.bus).toBe('Lokomotive');
  });

  it('does not use Die erste Schultag', () => {
    for (const { task } of allTasks) {
      expect(task.prompt).not.toBe('Die erste Schultag');
    }
  });

  it('keeps Schreiben ids out of the SES list', () => {
    const sesIds = flinkiModules.map((module) => module.id);
    for (const module of writingModules) {
      expect(sesIds).not.toContain(module.id);
    }
  });
});
