/**
 * StateManager - Svelte stores for game state management
 *
 * Replaces the global `game` object from prototype.html with reactive Svelte stores
 */

import { writable, derived, get, type Readable, type Writable } from 'svelte/store';
import type { ExerciseType } from '$lib/exercises/base/types';
import { errorReporter } from '$lib/utils/errorReporting';

// ===== TYPES =====

export type GameState = 'MENU' | 'EXTRAS_MENU' | 'MODULE_INTRO' | 'TASK' | 'RESULTS';

export interface Module {
  id: string;
  title: string;
  intro: string;
  tasks: ExerciseConfig[];
  icon?: string;
  category?: 'schriftsprachlich' | 'mathematisch' | 'exekutiv' | 'grafomotorik' | 'bonus';
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

export interface ModuleStats {
  moduleId: string;
  moduleTitle: string;
  correct: number;
  incorrect: number;
  total: number;
  accuracy: number;
  exerciseTypeStats: Record<string, { correct: number; incorrect: number; total: number; accuracy: number }>;
}

export interface OverallStats {
  totalCorrect: number;
  totalIncorrect: number;
  totalTasks: number;
  overallAccuracy: number;
  modulesCompleted: number;
  timeSpent?: number; // in seconds
  exerciseTypeBreakdown: Record<string, { correct: number; incorrect: number; total: number; accuracy: number }>;
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

/** Detailed stats per module */
export const moduleStats: Writable<Record<string, ModuleStats>> = writable({});

/** Overall session statistics */
export const overallStats: Writable<OverallStats> = writable({
  totalCorrect: 0,
  totalIncorrect: 0,
  totalTasks: 0,
  overallAccuracy: 0,
  modulesCompleted: 0,
  exerciseTypeBreakdown: {}
});

/** Legacy scores store for backwards compatibility */
export const scores: Readable<Record<string, number>> = derived(
  moduleStats,
  ($moduleStats) => Object.fromEntries(
    Object.entries($moduleStats).map(([id, stats]) => [id, stats.correct])
  )
);

/** Legacy totalKeys for backwards compatibility */
export const totalKeys: Readable<number> = derived(
  overallStats,
  ($overallStats) => $overallStats.totalCorrect
);

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
  currentModuleIndex.set(0);
  currentTaskIndex.set(0);

  // Initialize detailed stats for all modules
  const initialModuleStats: Record<string, ModuleStats> = {};
  const exerciseTypes: Set<string> = new Set();

  newModules.forEach(module => {
    initialModuleStats[module.id] = {
      moduleId: module.id,
      moduleTitle: module.title,
      correct: 0,
      incorrect: 0,
      total: 0,
      accuracy: 0,
      exerciseTypeStats: {}
    };

    // Collect all exercise types for overall stats
    module.tasks.forEach(task => {
      exerciseTypes.add(task.type);
    });
  });

  moduleStats.set(initialModuleStats);

  // Initialize overall stats
  const initialOverallStats: OverallStats = {
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTasks: newModules.reduce((sum, module) => sum + module.tasks.length, 0),
    overallAccuracy: 0,
    modulesCompleted: 0,
    exerciseTypeBreakdown: {}
  };

  // Initialize exercise type breakdown
  exerciseTypes.forEach(type => {
    initialOverallStats.exerciseTypeBreakdown[type] = {
      correct: 0,
      incorrect: 0,
      total: 0,
      accuracy: 0
    };
  });

  overallStats.set(initialOverallStats);

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
    errorReporter.reportExerciseError('nextTask called without current module', undefined, undefined);
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
    // Mark current module as completed
    overallStats.update(stats => ({
      ...stats,
      modulesCompleted: stats.modulesCompleted + 1
    }));
    startModule(moduleIndex + 1);
  } else {
    // All modules complete - mark final module as completed
    overallStats.update(stats => ({
      ...stats,
      modulesCompleted: stats.modulesCompleted + 1
    }));
    gameState.set('RESULTS');
    inputLocked.set(false);
  }
}

/**
 * Record a score for the current module and update overall statistics
 */
export function recordScore(correct: boolean): void {
  const module = get(currentModule);
  const task = get(currentTask);
  if (!module || !task) {
    errorReporter.reportExerciseError('recordScore called without valid module or task', module?.id, task?.type);
    return;
  }

  // Update module stats
  moduleStats.update(stats => {
    const moduleStat = stats[module.id];
    if (!moduleStat) return stats;

    // Update basic counts
    if (correct) {
      moduleStat.correct += 1;
    } else {
      moduleStat.incorrect += 1;
    }
    moduleStat.total += 1;
    moduleStat.accuracy = moduleStat.total > 0 ? (moduleStat.correct / moduleStat.total) * 100 : 0;

    // Update exercise type stats within module
    if (!moduleStat.exerciseTypeStats[task.type]) {
      moduleStat.exerciseTypeStats[task.type] = {
        correct: 0,
        incorrect: 0,
        total: 0,
        accuracy: 0
      };
    }

    const exerciseStats = moduleStat.exerciseTypeStats[task.type];
    if (correct) {
      exerciseStats.correct += 1;
    } else {
      exerciseStats.incorrect += 1;
    }
    exerciseStats.total += 1;
    exerciseStats.accuracy = exerciseStats.total > 0 ? (exerciseStats.correct / exerciseStats.total) * 100 : 0;

    return { ...stats, [module.id]: moduleStat };
  });

  // Update overall stats
  overallStats.update(stats => {
    if (correct) {
      stats.totalCorrect += 1;
    } else {
      stats.totalIncorrect += 1;
    }

    stats.overallAccuracy = (stats.totalCorrect + stats.totalIncorrect) > 0
      ? (stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect)) * 100
      : 0;

    // Update exercise type breakdown
    if (!stats.exerciseTypeBreakdown[task.type]) {
      stats.exerciseTypeBreakdown[task.type] = {
        correct: 0,
        incorrect: 0,
        total: 0,
        accuracy: 0
      };
    }

    const exerciseStats = stats.exerciseTypeBreakdown[task.type];
    if (correct) {
      exerciseStats.correct += 1;
    } else {
      exerciseStats.incorrect += 1;
    }
    exerciseStats.total += 1;
    exerciseStats.accuracy = exerciseStats.total > 0 ? (exerciseStats.correct / exerciseStats.total) * 100 : 0;

    return stats;
  });
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
  moduleStats.set({});
  overallStats.set({
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTasks: 0,
    overallAccuracy: 0,
    modulesCompleted: 0,
    exerciseTypeBreakdown: {}
  });
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
