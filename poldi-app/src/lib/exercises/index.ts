/**
 * Exercise library - Main exports
 *
 * Import all exercises to register them with the ExerciseRegistry.
 * This file automatically registers all exercise types when imported.
 */

// Base system
export * from './base';

// Exercise categories (auto-register on import)
import './phonology';  // rhyme, wordlength, syllables, initial
import './math';       // quantity, dice, counting, missing
import './memory';     // memory
import './visual';     // discrimination, pattern
import './motor';      // trace, trace_path
import './spatial';    // preposition
import './drawing';    // drawing, connect_dots, handwriting (tablet/stylus)
import './storytelling'; // storytelling (OpenAI)

// Re-export all exercises for direct use
export * from './phonology';
export * from './math';
export * from './memory';
export * from './visual';
export * from './motor';
export * from './spatial';
export * from './drawing';
export * from './storytelling';

