/**
 * Type definitions for the Exercise Plugin system
 */

import type { RenderContext } from '$lib/core/CanvasManager';
import type { SpeechRequest } from '$lib/core/SpeechEngine';

// Re-export for convenience
export type { SpeechRequest };

// ===== EXERCISE TYPES =====

export type ExerciseType =
  // Phonology
  | 'rhyme'
  | 'wordlength'
  | 'syllables'
  | 'initial'
  // Math
  | 'quantity'
  | 'dice'
  | 'counting'
  | 'missing'
  // Memory
  | 'memory'
  // Visual
  | 'discrimination'
  // Motor
  | 'trace'
  | 'trace_path'
  | 'line_tracing'
  | 'maze'
  // Logic
  | 'pattern'
  // Spatial
  | 'preposition'
  // Tablet/Stylus (Drawing)
  | 'drawing'
  | 'connect_dots'
  | 'handwriting'
  // Language / Storytelling
  | 'storytelling'
  // Bonus
  | 'truefalse';

// ===== EXERCISE CONFIG =====

export interface ExerciseConfig {
  type: ExerciseType;
  [key: string]: any;  // Exercise-specific configuration
}

// ===== EXERCISE RESULTS =====

export interface ExerciseResult {
  correct: boolean;
  responseTime?: number;
  metadata?: Record<string, any>;
}

// ===== INPUT EVENTS =====

export interface InputEvent {
  x: number;
  y: number;
  type: 'start' | 'move' | 'end';
}

// ===== EXERCISE STATE =====

export interface ExerciseState {
  started: boolean;
  completed: boolean;
  locked: boolean;
  customState?: Record<string, any>;
}

// ===== GEOMETRY HELPERS =====

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BoxStyle {
  borderRadius?: number;
  strokeStyle?: string;
  fillStyle?: string;
  lineWidth?: number;
}

// ===== PLUGIN INTERFACE =====

/**
 * Core interface that all exercise plugins must implement
 */
export interface IExercisePlugin {
  // ===== METADATA =====

  /** Unique type identifier for this exercise */
  readonly type: ExerciseType;

  /** Configuration for this exercise instance */
  readonly config: ExerciseConfig;

  // ===== LIFECYCLE HOOKS =====

  /**
   * Initialize the exercise with configuration
   * Called once when the exercise is created
   */
  initialize(config: ExerciseConfig): void;

  /**
   * Called when the exercise starts
   * Returns speech requests to be spoken
   */
  onStart(): SpeechRequest[];

  /**
   * Called when the exercise completes
   * @param result The result of the exercise
   */
  onComplete(result: ExerciseResult): void;

  /**
   * Clean up resources
   */
  cleanup(): void;

  // ===== CORE FUNCTIONALITY =====

  /**
   * Render the exercise to canvas
   * Called every frame
   */
  render(ctx: RenderContext): void;

  /**
   * Handle user input
   * @param event Input event (pointer/touch)
   * @returns ExerciseResult if exercise is complete, null otherwise
   */
  handleInput(event: InputEvent): ExerciseResult | null;

  // ===== STATE MANAGEMENT =====

  /**
   * Get current exercise state
   */
  getState(): ExerciseState;

  /**
   * Update exercise state
   */
  setState(state: Partial<ExerciseState>): void;

  /**
   * Reset exercise to initial state
   */
  reset(): void;

  // ===== OPTIONAL FEATURES =====

  /**
   * Get instruction text for speech synthesis
   */
  getInstruction?(): string;

  /**
   * Get hint text (optional)
   */
  getHint?(): string;

  /**
   * Whether this exercise supports replay
   */
  supportsReplay?(): boolean;
}

// ===== PLUGIN CONSTRUCTOR TYPE =====

export type ExercisePluginConstructor = new (config: any) => IExercisePlugin;
