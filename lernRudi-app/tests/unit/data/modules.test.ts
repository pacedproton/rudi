import { describe, it, expect } from 'vitest';
import { flinkiModules, poldiModules, demoModule, shortTestModule, getShuffledModules } from '$lib/data/modules';
import { writingModules } from '$lib/data/writing-modules';

describe('flinkiModules', () => {
  it('has 11 SES modules', () => {
    expect(flinkiModules).toHaveLength(11);
    expect(poldiModules).toBe(flinkiModules);
  });

  it('keeps the current SES ids in order', () => {
    expect(flinkiModules.map((module) => module.id)).toEqual([
      'phonology',
      'lettersounds',
      'quantities',
      'counting',
      'memory',
      'visual',
      'motor',
      'spatial',
      'drawing',
      'storytelling',
      'syllables'
    ]);
  });

  it('does not put Schreiben modules in the SES list', () => {
    const sesIds = new Set(flinkiModules.map((module) => module.id));
    for (const module of writingModules) {
      expect(sesIds.has(module.id)).toBe(false);
    }
  });

  it('has titles, intros, and at least one task per module', () => {
    flinkiModules.forEach((module) => {
      expect(module.title.length).toBeGreaterThan(0);
      expect(module.intro.length).toBeGreaterThan(0);
      expect(module.tasks.length).toBeGreaterThan(0);
    });
  });

  it('does not require 36 tasks in every module', () => {
    const motor = flinkiModules.find((module) => module.id === 'motor');
    const storytelling = flinkiModules.find((module) => module.id === 'storytelling');
    expect(motor?.tasks.length).not.toBe(36);
    expect(storytelling?.tasks.length).toBeLessThan(36);
  });
});

describe('Exercise Types', () => {
  it('phonology has rhymes and syllables', () => {
    const types = new Set(flinkiModules[0].tasks.map((t) => t.type));
    expect(types.has('rhyme')).toBe(true);
    expect(types.has('syllables')).toBe(true);
  });

  it('letter sounds uses initial tasks', () => {
    expect(flinkiModules[1].tasks.some((t) => t.type === 'initial')).toBe(true);
  });

  it('quantities uses quantity and dice', () => {
    const types = new Set(flinkiModules[2].tasks.map((t) => t.type));
    expect(types.has('quantity')).toBe(true);
    expect(types.has('dice')).toBe(true);
  });

  it('counting uses counting and missing', () => {
    const types = new Set(flinkiModules[3].tasks.map((t) => t.type));
    expect(types.has('counting')).toBe(true);
    expect(types.has('missing')).toBe(true);
  });

  it('memory uses memory sequences', () => {
    expect(flinkiModules[4].tasks.every((t) => t.type === 'memory')).toBe(true);
  });

  it('visual uses discrimination and pattern', () => {
    const types = new Set(flinkiModules[5].tasks.map((t) => t.type));
    expect(types.has('discrimination')).toBe(true);
    expect(types.has('pattern')).toBe(true);
  });

  it('motor uses trace and trace_path', () => {
    const types = new Set(flinkiModules[6].tasks.map((t) => t.type));
    expect(types.has('trace')).toBe(true);
    expect(types.has('trace_path')).toBe(true);
  });

  it('spatial uses preposition', () => {
    expect(flinkiModules[7].tasks.every((t) => t.type === 'preposition')).toBe(true);
  });

  it('drawing uses drawing, handwriting, and connect_dots', () => {
    const types = new Set(flinkiModules[8].tasks.map((t) => t.type));
    expect(types.has('drawing')).toBe(true);
    expect(types.has('handwriting')).toBe(true);
    expect(types.has('connect_dots')).toBe(true);
  });
});

describe('Demo Module', () => {
  it('has 3 mixed tasks as defined on demoModule', () => {
    expect(demoModule.id).toBe('demo');
    expect(demoModule.tasks).toHaveLength(3);
    expect(new Set(demoModule.tasks.map((t) => t.type)).size).toBe(3);
  });
});

describe('Short Test Module', () => {
  it('has 8 mixed types, not phonology-only', () => {
    expect(shortTestModule.id).toBe('short_test');
    expect(shortTestModule.tasks).toHaveLength(8);
    const types = new Set(shortTestModule.tasks.map((t) => t.type));
    expect(types.size).toBe(8);
    expect(shortTestModule.tasks.every((t) => t.type === 'rhyme' || t.type === 'syllables')).toBe(false);
  });
});

describe('Shuffle Functionality', () => {
  it('returns one shuffled copy per SES module', () => {
    const shuffled = getShuffledModules();
    expect(shuffled).toHaveLength(flinkiModules.length);
    shuffled.forEach((module, index) => {
      expect(module.tasks).toHaveLength(flinkiModules[index].tasks.length);
    });
  });

  it('does not modify original modules', () => {
    const originalFirst = flinkiModules[0].tasks[0];
    getShuffledModules();
    expect(flinkiModules[0].tasks[0]).toEqual(originalFirst);
  });

  it('shuffles tasks differently on multiple calls', () => {
    const shuffle1 = getShuffledModules();
    const shuffle2 = getShuffledModules();
    const foundDifference = shuffle1.some((module, index) => {
      const a = module.tasks.map((t) => JSON.stringify(t)).join('|');
      const b = shuffle2[index].tasks.map((t) => JSON.stringify(t)).join('|');
      return a !== b;
    });
    expect(foundDifference).toBe(true);
  });
});

describe('Exercise Configuration Validation', () => {
  it('rhyme tasks have word, target, and distractors', () => {
    flinkiModules[0].tasks
      .filter((t) => t.type === 'rhyme')
      .forEach((exercise) => {
        expect(exercise.word).toBeDefined();
        expect(exercise.target).toBeDefined();
        expect(Array.isArray(exercise.distractors)).toBe(true);
      });
  });

  it('syllable tasks have word, icon, and a 1-5 count', () => {
    flinkiModules[0].tasks
      .filter((t) => t.type === 'syllables')
      .forEach((exercise) => {
        expect(exercise.word).toBeDefined();
        expect(exercise.icon).toBeDefined();
        expect(exercise.count).toBeGreaterThan(0);
        expect(exercise.count).toBeLessThanOrEqual(5);
      });
  });

  it('memory sequences stay between 1 and 5 digits', () => {
    flinkiModules[4].tasks.forEach((exercise) => {
      expect(Array.isArray(exercise.seq)).toBe(true);
      expect(exercise.seq.length).toBeGreaterThan(0);
      expect(exercise.seq.length).toBeLessThanOrEqual(5);
    });
  });

  it('quantity sides stay in 1-6', () => {
    flinkiModules[2].tasks
      .filter((t) => t.type === 'quantity')
      .forEach((exercise) => {
        expect(exercise.l).toBeGreaterThanOrEqual(1);
        expect(exercise.r).toBeGreaterThanOrEqual(1);
        expect(exercise.l).toBeLessThanOrEqual(6);
        expect(exercise.r).toBeLessThanOrEqual(6);
      });
  });

  it('memory difficulty increases', () => {
    const memory = flinkiModules[4];
    expect(memory.tasks[0].seq.length).toBe(2);
    expect(memory.tasks[memory.tasks.length - 1].seq.length).toBeGreaterThanOrEqual(4);
  });
});
