/**
 * Post-reading Schreiben track. Kept separate from SES modules.
 */

import type { Module } from '$lib/core/StateManager';
import type { ExerciseConfig } from '$lib/exercises/base/types';
import { LETTER_FAMILIES, listLetterGlyphs } from './letter-forms';
import {
  highestUnlockedFamily,
  type WritingMasteryState,
  createEmptyMastery
} from '$lib/stores/writingMastery';

export interface WritingWord {
  word: string;
  minFamily: number;
  icon?: string;
}

export const WRITING_WORDS: WritingWord[] = [
  { word: 'da', minFamily: 1 },
  { word: 'tag', minFamily: 2 },
  { word: 'gut', minFamily: 2 },
  { word: 'alt', minFamily: 2 },
  { word: 'tal', minFamily: 2 },
  { word: 'gold', minFamily: 2 },
  { word: 'laut', minFamily: 2 },
  { word: 'oma', minFamily: 3 },
  { word: 'mama', minFamily: 3 },
  { word: 'mal', minFamily: 3 },
  { word: 'und', minFamily: 3 },
  { word: 'hut', minFamily: 3, icon: 'hat' },
  { word: 'hand', minFamily: 3, icon: 'hand' },
  { word: 'hund', minFamily: 3, icon: 'dog' },
  { word: 'mund', minFamily: 3, icon: 'mouth' },
  { word: 'mond', minFamily: 3, icon: 'moon' },
  { word: 'halt', minFamily: 3 },
  { word: 'land', minFamily: 3 }
];

export const WRITING_MODULE_IDS = {
  letters: 'writing-letters',
  copy: 'writing-copy',
  recall: 'writing-dictation'
} as const;

function letterTasks(maxFamily: number): ExerciseConfig[] {
  const tasks: ExerciseConfig[] = [];
  for (const family of LETTER_FAMILIES) {
    if (family.id > maxFamily) continue;
    for (const character of family.letters) {
      tasks.push({
        type: 'letter_trace',
        character,
        instruction: `Zeichne den Buchstaben ${character}`
      });
      tasks.push({
        type: 'letter_write',
        character,
        guide: 'faded',
        instruction: `Schreibe ein ${character}`
      });
      tasks.push({
        type: 'letter_write',
        character,
        guide: 'hidden',
        instruction: `Schreibe ein ${character} ohne Hilfe`
      });
    }
  }
  return tasks;
}

function wordsForFamily(maxFamily: number): WritingWord[] {
  const available = WRITING_WORDS.filter((item) => item.minFamily <= maxFamily);
  return available.length > 0 ? available : WRITING_WORDS.filter((item) => item.minFamily === 1);
}

function copyTasks(maxFamily: number): ExerciseConfig[] {
  return wordsForFamily(maxFamily).map((item) => ({
    type: 'word_copy',
    word: item.word,
    icon: item.icon,
    instruction: `Schreibe das Wort ${item.word}`
  }));
}

function recallTasks(maxFamily: number): ExerciseConfig[] {
  const words = wordsForFamily(maxFamily);
  const tasks: ExerciseConfig[] = [];
  for (const item of words) {
    tasks.push({
      type: 'word_memory',
      word: item.word,
      icon: item.icon,
      instruction: `Schreibe ${item.word} aus dem Kopf`
    });
    tasks.push({
      type: 'word_dictation',
      word: item.word,
      icon: item.icon,
      instruction: `Schreibe das Wort, das du hörst`
    });
  }
  return tasks;
}

function buildModules(maxFamily: number): Module[] {
  return [
    {
      id: WRITING_MODULE_IDS.letters,
      title: 'Buchstabenfamilien',
      intro: 'Wir schreiben Druckschrift. Folge zuerst den Linien, dann schreibe allein.',
      category: 'schriftsprachlich',
      tasks: letterTasks(maxFamily)
    },
    {
      id: WRITING_MODULE_IDS.copy,
      title: 'Wörter abschreiben',
      intro: 'Lies das Wort und schreibe es auf die Linien.',
      category: 'schriftsprachlich',
      tasks: copyTasks(maxFamily)
    },
    {
      id: WRITING_MODULE_IDS.recall,
      title: 'Wörter aus dem Kopf',
      intro: 'Erst merken, dann hören, dann schreiben.',
      category: 'schriftsprachlich',
      tasks: recallTasks(maxFamily)
    }
  ];
}

/** Full track with all three families (tests and content authoring). */
export const writingModules: Module[] = buildModules(LETTER_FAMILIES.length);

export function getWritingModulesForLearner(state: WritingMasteryState = createEmptyMastery()): Module[] {
  return buildModules(highestUnlockedFamily(state));
}

export function resolveWritingModule(
  moduleId: string,
  state: WritingMasteryState = createEmptyMastery()
): Module | undefined {
  return getWritingModulesForLearner(state).find((module) => module.id === moduleId);
}

export function isWritingModuleId(moduleId: string): boolean {
  return Object.values(WRITING_MODULE_IDS).includes(moduleId as (typeof WRITING_MODULE_IDS)[keyof typeof WRITING_MODULE_IDS]);
}

export function writingLetterCount(): number {
  return listLetterGlyphs().length;
}
