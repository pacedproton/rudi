/**
 * Drawing/Tablet exercises - Stylus-optimized exercises
 */

import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { DrawingExercise } from './DrawingExercise';
import { ConnectDotsExercise } from './ConnectDotsExercise';
import { HandwritingExercise } from './HandwritingExercise';

// Register exercises
ExerciseRegistry.register('drawing', DrawingExercise);
ExerciseRegistry.register('connect_dots', ConnectDotsExercise);
ExerciseRegistry.register('handwriting', HandwritingExercise);

// Export for direct use
export { DrawingExercise, ConnectDotsExercise, HandwritingExercise };
export { generateDotPattern } from './ConnectDotsExercise';
export type { DrawingConfig } from './DrawingExercise';
export type { ConnectDotsConfig } from './ConnectDotsExercise';
export type { HandwritingConfig } from './HandwritingExercise';
