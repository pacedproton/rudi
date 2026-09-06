import { describe, it, expect } from 'vitest';
import { flinkiModules } from '$lib/data/modules';
import {
  writingModules,
  getWritingModulesForLearner,
  resolveWritingModule,
  isWritingModuleId,
  WRITING_WORDS,
  WRITING_MODULE_IDS
} from '$lib/data/writing-modules';
import { applyLetterAttempt, createEmptyMastery } from '$lib/stores/writingMastery';
import { LETTER_FAMILIES } from '$lib/data/letter-forms';

describe('writing modules', () => {
  it('is a separate track from SES modules', () => {
    const sesIds = flinkiModules.map((module) => module.id);
    expect(sesIds).not.toContain(WRITING_MODULE_IDS.letters);
    expect(sesIds).not.toContain(WRITING_MODULE_IDS.copy);
    expect(sesIds).not.toContain(WRITING_MODULE_IDS.recall);
    expect(writingModules).toHaveLength(3);
  });

  it('does not change SES module counts', () => {
    expect(flinkiModules.length).toBeGreaterThanOrEqual(11);
    expect(flinkiModules.every((module) => !isWritingModuleId(module.id))).toBe(true);
  });

  it('starts learners with family 1 letters only', () => {
    const modules = getWritingModulesForLearner(createEmptyMastery());
    const letters = modules.find((module) => module.id === WRITING_MODULE_IDS.letters);
    const glyphs = new Set(letters?.tasks.map((task) => task.character));
    expect([...glyphs]).toEqual(LETTER_FAMILIES[0].letters);
  });

  it('adds family 2 after mastery', () => {
    let state = createEmptyMastery();
    for (const glyph of LETTER_FAMILIES[0].letters) {
      state = applyLetterAttempt(state, glyph, true);
      state = applyLetterAttempt(state, glyph, true);
    }
    const letters = resolveWritingModule(WRITING_MODULE_IDS.letters, state);
    const glyphs = new Set(letters?.tasks.map((task) => task.character));
    expect(glyphs.has('i')).toBe(true);
    expect(glyphs.has('t')).toBe(true);
  });

  it('only copies words from unlocked families', () => {
    const copy = resolveWritingModule(WRITING_MODULE_IDS.copy, createEmptyMastery());
    expect(copy?.tasks.every((task) => task.word === 'da')).toBe(true);
  });

  it('uses only letters that exist in the catalog for words', () => {
    const allowed = new Set(LETTER_FAMILIES.flatMap((family) => family.letters));
    WRITING_WORDS.forEach((item) => {
      item.word.split('').forEach((glyph) => {
        expect(allowed.has(glyph)).toBe(true);
      });
    });
  });
});
