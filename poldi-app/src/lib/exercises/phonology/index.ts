/**
 * Phonology exercises - Sound awareness and phonological processing
 */

import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { RhymeExercise } from './RhymeExercise';
import { WordLengthExercise } from './WordLengthExercise';
import { SyllablesExercise } from './SyllablesExercise';
import { InitialSoundExercise } from './InitialSoundExercise';

// Register exercises
ExerciseRegistry.register('rhyme', RhymeExercise);
ExerciseRegistry.register('wordlength', WordLengthExercise);
ExerciseRegistry.register('syllables', SyllablesExercise);
ExerciseRegistry.register('initial', InitialSoundExercise);

// Exports
export { RhymeExercise, WordLengthExercise, SyllablesExercise, InitialSoundExercise };
