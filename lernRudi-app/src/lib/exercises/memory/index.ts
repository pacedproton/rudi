/**
 * Memory exercises
 */

import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { MemoryExercise } from './MemoryExercise';

// Register exercises
ExerciseRegistry.register('memory', MemoryExercise);

// Exports
export { MemoryExercise };
