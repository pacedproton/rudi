/**
 * Client-only mastery for the Schreiben track.
 * Unlocks the next letter family when recent accuracy is high.
 */

import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { LETTER_FAMILIES, getFamilyById } from '$lib/data/letter-forms';

export type WordStage = 'copy' | 'memory' | 'dictation';

export interface LetterMastery {
  attempts: number;
  recent: boolean[];
}

export interface WordMastery {
  stage: WordStage;
  attempts: number;
  recent: boolean[];
}

export interface WritingMasteryState {
  letters: Record<string, LetterMastery>;
  words: Record<string, WordMastery>;
}

const STORAGE_KEY = 'lernrudi-writing-mastery';
const RECENT_WINDOW = 5;
const UNLOCK_ACCURACY = 0.7;
const MIN_ATTEMPTS = 2;

export function createEmptyMastery(): WritingMasteryState {
  return { letters: {}, words: {} };
}

export function recentAccuracy(recent: boolean[]): number {
  if (recent.length === 0) return 0;
  return recent.filter(Boolean).length / recent.length;
}

function pushRecent(recent: boolean[], correct: boolean): boolean[] {
  return [...recent, correct].slice(-RECENT_WINDOW);
}

export function applyLetterAttempt(
  state: WritingMasteryState,
  glyph: string,
  correct: boolean
): WritingMasteryState {
  const current = state.letters[glyph] ?? { attempts: 0, recent: [] };
  return {
    ...state,
    letters: {
      ...state.letters,
      [glyph]: {
        attempts: current.attempts + 1,
        recent: pushRecent(current.recent, correct)
      }
    }
  };
}

export function applyWordAttempt(
  state: WritingMasteryState,
  word: string,
  stage: WordStage,
  correct: boolean
): WritingMasteryState {
  const current = state.words[word] ?? { stage, attempts: 0, recent: [] };
  const nextStage: WordStage =
    correct && stage === 'copy' ? 'memory' : correct && stage === 'memory' ? 'dictation' : current.stage;
  return {
    ...state,
    words: {
      ...state.words,
      [word]: {
        stage: nextStage,
        attempts: current.attempts + 1,
        recent: pushRecent(current.recent, correct)
      }
    }
  };
}

export function isFamilyUnlocked(state: WritingMasteryState, familyId: number): boolean {
  if (familyId <= 1) return true;
  const previous = getFamilyById(familyId - 1);
  if (!previous) return false;

  return previous.letters.every((glyph) => {
    const entry = state.letters[glyph];
    if (!entry || entry.attempts < MIN_ATTEMPTS) return false;
    return recentAccuracy(entry.recent) >= UNLOCK_ACCURACY;
  });
}

export function getUnlockedFamilyIds(state: WritingMasteryState): number[] {
  return LETTER_FAMILIES.map((family) => family.id).filter((id) => isFamilyUnlocked(state, id));
}

export function highestUnlockedFamily(state: WritingMasteryState): number {
  const unlocked = getUnlockedFamilyIds(state);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : 1;
}

function loadMastery(): WritingMasteryState {
  if (!browser) return createEmptyMastery();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WritingMasteryState;
      return {
        letters: parsed.letters ?? {},
        words: parsed.words ?? {}
      };
    }
  } catch (error) {
    console.error('Failed to load writing mastery:', error);
  }
  return createEmptyMastery();
}

function saveMastery(state: WritingMasteryState): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save writing mastery:', error);
  }
}

function createWritingMasteryStore() {
  const { subscribe, set, update }: Writable<WritingMasteryState> = writable(loadMastery());

  return {
    subscribe,
    recordLetter(glyph: string, correct: boolean) {
      update((state) => {
        const next = applyLetterAttempt(state, glyph, correct);
        saveMastery(next);
        return next;
      });
    },
    recordWord(word: string, stage: WordStage, correct: boolean) {
      update((state) => {
        const next = applyWordAttempt(state, word, stage, correct);
        saveMastery(next);
        return next;
      });
    },
    reset() {
      const empty = createEmptyMastery();
      saveMastery(empty);
      set(empty);
    }
  };
}

export const writingMastery = createWritingMasteryStore();

export const unlockedFamilyIds = derived(writingMastery, ($state) => getUnlockedFamilyIds($state));
export const currentWritingFamily = derived(writingMastery, ($state) => highestUnlockedFamily($state));
