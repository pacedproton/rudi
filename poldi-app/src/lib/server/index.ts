/**
 * Server Module - Exports all server-side services
 */

// Database
export * from './db';

// Exercise Loader
export {
  ExerciseLoader,
  getExerciseLoader,
  resetExerciseLoader,
  createDemoModule,
  createShortTestModule
} from './ExerciseLoader';

// Authentication
export {
  AuthService,
  getAuthService,
  resetAuthService,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
} from './AuthService';
export type { AuthResult, TokenPayload } from './AuthService';
