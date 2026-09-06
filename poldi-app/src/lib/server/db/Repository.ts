/**
 * Repository Interfaces - Abstract database operations
 * 
 * These interfaces define the contract for data access.
 * Implementations can use YAML files, PostgreSQL, or any other storage.
 */

import type {
  User,
  CreateUserData,
  Session,
  CreateSessionData,
  ExerciseProgress,
  ModuleProgress,
  RecordProgressData,
  UserSettings
} from './types';

// ===== USER REPOSITORY =====

export interface UserRepository {
  /** Create a new user */
  create(data: CreateUserData): Promise<User>;

  /** Find user by ID */
  findById(id: string): Promise<User | null>;

  /** Find user by email */
  findByEmail(email: string): Promise<User | null>;

  /** Update user subscription status */
  updateSubscription(userId: string, status: User['subscription']): Promise<User>;

  /** Update user profile */
  updateProfile(userId: string, data: Partial<Pick<User, 'displayName'>>): Promise<User>;

  /** Delete user (for GDPR compliance) */
  delete(userId: string): Promise<void>;

  /** List all users (admin) */
  listAll(): Promise<User[]>;
}

// ===== SESSION REPOSITORY =====

export interface SessionRepository {
  /** Create a new session */
  create(data: CreateSessionData): Promise<Session>;

  /** Find session by token */
  findByToken(token: string): Promise<Session | null>;

  /** Find all sessions for a user */
  findByUserId(userId: string): Promise<Session[]>;

  /** Delete a session (logout) */
  delete(sessionId: string): Promise<void>;

  /** Delete all sessions for a user */
  deleteAllForUser(userId: string): Promise<void>;

  /** Clean up expired sessions */
  deleteExpired(): Promise<number>;
}

// ===== PROGRESS REPOSITORY =====

export interface ProgressRepository {
  /** Record an exercise attempt */
  recordExercise(data: RecordProgressData): Promise<ExerciseProgress>;

  /** Get all exercise progress for a user */
  getExercises(userId: string): Promise<ExerciseProgress[]>;

  /** Get exercise progress for a specific module */
  getExercisesByModule(userId: string, moduleId: string): Promise<ExerciseProgress[]>;

  /** Get module progress summary for a user */
  getModuleProgress(userId: string): Promise<ModuleProgress[]>;

  /** Get overall statistics for a user */
  getOverallStats(userId: string): Promise<{
    totalExercises: number;
    correctCount: number;
    incorrectCount: number;
    modulesCompleted: number;
    accuracy: number;
  }>;

  /** Clear all progress for a user */
  clearProgress(userId: string): Promise<void>;
}

// ===== SETTINGS REPOSITORY =====

export interface SettingsRepository {
  /** Get user settings */
  get(userId: string): Promise<UserSettings>;

  /** Update user settings */
  update(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;

  /** Reset to defaults */
  reset(userId: string): Promise<UserSettings>;
}

// ===== COMBINED DATABASE INTERFACE =====

export interface Database {
  users: UserRepository;
  sessions: SessionRepository;
  progress: ProgressRepository;
  settings: SettingsRepository;

  /** Initialize the database (create tables/files if needed) */
  initialize(): Promise<void>;

  /** Close database connections */
  close(): Promise<void>;
}
