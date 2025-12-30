/**
 * StateManager - Svelte stores for game state management
 *
 * Replaces the global `game` object from prototype.html with reactive Svelte stores
 */

import { writable, derived, get, type Readable, type Writable } from 'svelte/store';
import type { ExerciseType } from '$lib/exercises/base/types';

// ===== TYPES =====

export type GameState = 'MENU' | 'EXTRAS_MENU' | 'MODULE_INTRO' | 'TASK' | 'RESULTS';

export interface Module {
  id: string;
  title: string;
  intro: string;
  tasks: ExerciseConfig[];
  icon?: string;
}

export interface ExerciseConfig {
  type: ExerciseType;
  [key: string]: any;
}

export interface Feedback {
  active: boolean;
  success: boolean;
}

export interface CanvasSize {
  width: number;
  height: number;
  scale: number;
}

// ===== CORE STATE =====

/** Current game state (menu, task, results, etc.) */
export const gameState: Writable<GameState> = writable('MENU');

/** All loaded modules */
export const modules: Writable<Module[]> = writable([]);

/** Current module index */
export const currentModuleIndex: Writable<number> = writable(0);

/** Current task index within module */
export const currentTaskIndex: Writable<number> = writable(0);

/** Scores per module (module id => score) */
export const scores: Writable<Record<string, number>> = writable({});

/** Total keys collected across all modules */
export const totalKeys: Writable<number> = writable(0);

// ===== UI STATE =====

/** Whether input is currently locked */
export const inputLocked: Writable<boolean> = writable(false);

/** Whether speech synthesis is currently active */
export const isSpeaking: Writable<boolean> = writable(false);

/** Feedback overlay state */
export const feedback: Writable<Feedback> = writable({
  active: false,
  success: false
});

/** Canvas dimensions and scale */
export const canvasSize: Writable<CanvasSize> = writable({
  width: 800,
  height: 600,
  scale: 1
});

// ===== EXERCISE-SPECIFIC STATE =====

/** State specific to current exercise (drawing paths, memory input, etc.) */
export const exerciseState: Writable<Record<string, any>> = writable({});

// ===== DERIVED STORES =====

/** Current module (derived from modules and currentModuleIndex) */
export const currentModule: Readable<Module | undefined> = derived(
  [modules, currentModuleIndex],
  ([$modules, $index]) => $modules[$index]
);

/** Current task (derived from currentModule and currentTaskIndex) */
export const currentTask: Readable<ExerciseConfig | undefined> = derived(
  [currentModule, currentTaskIndex],
  ([$module, $index]) => $module?.tasks[$index]
);

/** Total number of tasks in current module */
export const totalTasksInModule: Readable<number> = derived(
  currentModule,
  ($module) => $module?.tasks.length || 0
);

/** Progress within current module (e.g., "2/5") */
export const moduleProgress: Readable<string> = derived(
  [currentTaskIndex, totalTasksInModule],
  ([$taskIndex, $total]) => `${$taskIndex + 1}/${$total}`
);

// ===== ACTIONS =====

/**
 * Start a new exam sequence with given modules
 */
export function startExamSequence(newModules: Module[]): void {
  modules.set(newModules);
  scores.set({});
  totalKeys.set(0);
  currentModuleIndex.set(0);
  currentTaskIndex.set(0);

  // Initialize scores for all modules
  const initialScores: Record<string, number> = {};
  newModules.forEach(m => {
    initialScores[m.id] = 0;
  });
  scores.set(initialScores);

  // Start first module
  startModule(0);
}

/**
 * Start a module by index
 */
export function startModule(index: number): void {
  currentModuleIndex.set(index);
  currentTaskIndex.set(0);
  gameState.set('MODULE_INTRO');
  exerciseState.set({});
}

/**
 * Start the current task
 */
export function startTask(): void {
  gameState.set('TASK');
  exerciseState.set({});
  inputLocked.set(false);
  feedback.set({ active: false, success: false });
}

/**
 * Move to next task or module
 */
export function nextTask(): void {
  const module = get(currentModule);
  const taskIndex = get(currentTaskIndex);

  if (!module) {
    console.error('No current module');
    return;
  }

  // Check if there are more tasks in this module
  if (taskIndex + 1 < module.tasks.length) {
    currentTaskIndex.update(i => i + 1);
    startTask();
    return;
  }

  // Move to next module
  const moduleIndex = get(currentModuleIndex);
  const allModules = get(modules);

  if (moduleIndex + 1 < allModules.length) {
    startModule(moduleIndex + 1);
  } else {
    // All modules complete
    gameState.set('RESULTS');
    inputLocked.set(false);
  }
}

/**
 * Record a score for the current module
 */
export function recordScore(correct: boolean): void {
  const module = get(currentModule);
  if (!module) return;

  if (correct) {
    scores.update(s => ({
      ...s,
      [module.id]: (s[module.id] || 0) + 1
    }));
    totalKeys.update(k => k + 1);
  }
}

/**
 * Show feedback overlay
 */
export function showFeedback(success: boolean, durationMs = 1500): void {
  feedback.set({ active: true, success });
  inputLocked.set(true);

  setTimeout(() => {
    feedback.set({ active: false, success: false });
    nextTask();
  }, durationMs);
}

/**
 * Reset to menu
 */
export function resetToMenu(): void {
  gameState.set('MENU');
  currentModuleIndex.set(0);
  currentTaskIndex.set(0);
  modules.set([]);
  scores.set({});
  totalKeys.set(0);
  exerciseState.set({});
  inputLocked.set(false);
  feedback.set({ active: false, success: false });
}

/**
 * Update canvas size (called on window resize)
 */
export function updateCanvasSize(width: number, height: number): void {
  const scale = Math.min(width / 800, height / 600);
  canvasSize.set({ width, height, scale });
}
