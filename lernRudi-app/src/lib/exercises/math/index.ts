/**
 * Math exercises - Quantities, counting, and number sense
 */

import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { QuantityExercise } from './QuantityExercise';
import { DiceExercise } from './DiceExercise';
import { CountingExercise } from './CountingExercise';
import { MissingExercise } from './MissingExercise';

// Register exercises
ExerciseRegistry.register('quantity', QuantityExercise);
ExerciseRegistry.register('dice', DiceExercise);
ExerciseRegistry.register('counting', CountingExercise);
ExerciseRegistry.register('missing', MissingExercise);

// Exports
export { QuantityExercise, DiceExercise, CountingExercise, MissingExercise };
