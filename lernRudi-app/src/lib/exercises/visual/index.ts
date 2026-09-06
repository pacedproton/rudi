/**
 * Visual/Attention exercises - Visual discrimination and patterns
 */

import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { DiscriminationExercise } from './DiscriminationExercise';
import { PatternExercise } from './PatternExercise';

// Register exercises
ExerciseRegistry.register('discrimination', DiscriminationExercise);
ExerciseRegistry.register('pattern', PatternExercise);

// Exports
export { DiscriminationExercise, PatternExercise };
