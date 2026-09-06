/**
 * Motor skills exercises - Graphomotor and fine motor control
 */

import { ExerciseRegistry } from '../base/ExerciseRegistry';
import { TraceExercise } from './TraceExercise';
import { TracePathExercise } from './TracePathExercise';
import { LineTracingExercise } from './LineTracingExercise';
import { MazeExercise } from './MazeExercise';

// Register exercises
ExerciseRegistry.register('trace', TraceExercise);
ExerciseRegistry.register('trace_path', TracePathExercise);
ExerciseRegistry.register('line_tracing', LineTracingExercise);
ExerciseRegistry.register('maze', MazeExercise);

// Exports
export { TraceExercise, TracePathExercise, LineTracingExercise, MazeExercise };
