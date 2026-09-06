import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { LetterTraceExercise } from './LetterTraceExercise';
import { LetterWriteExercise } from './LetterWriteExercise';
import { WordCopyExercise } from './WordCopyExercise';
import { WordMemoryExercise } from './WordMemoryExercise';
import { WordDictationExercise } from './WordDictationExercise';

ExerciseRegistry.register('letter_trace', LetterTraceExercise);
ExerciseRegistry.register('letter_write', LetterWriteExercise);
ExerciseRegistry.register('word_copy', WordCopyExercise);
ExerciseRegistry.register('word_memory', WordMemoryExercise);
ExerciseRegistry.register('word_dictation', WordDictationExercise);

export { LetterTraceExercise } from './LetterTraceExercise';
export { LetterWriteExercise } from './LetterWriteExercise';
export { WordCopyExercise } from './WordCopyExercise';
export { WordMemoryExercise } from './WordMemoryExercise';
export { WordDictationExercise } from './WordDictationExercise';
export { scoreStrokes, scoreWord } from './scoreStrokes';
export type { LetterTraceConfig } from './LetterTraceExercise';
export type { LetterWriteConfig } from './LetterWriteExercise';
export type { WordCopyConfig } from './WordCopyExercise';
export type { WordMemoryConfig } from './WordMemoryExercise';
export type { WordDictationConfig } from './WordDictationExercise';
