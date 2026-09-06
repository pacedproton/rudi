/**
 * PostgreSQL Adapter - Production database implementation (stub)
 * 
 * This is a placeholder for future PostgreSQL implementation.
 * Switch to this adapter for production scale by setting DATABASE_TYPE=postgres.
 */

import type {
  Database,
  UserRepository,
  SessionRepository,
  ProgressRepository,
  SettingsRepository
} from './Repository';

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

import { DEFAULT_USER_SETTINGS } from './types';

// ===== STUB IMPLEMENTATIONS =====
// These throw errors until properly implemented with a PostgreSQL client

class PostgresUserRepository implements UserRepository {
  constructor(private connectionString: string) { }

  async create(_data: CreateUserData): Promise<User> {
    throw new Error('PostgreSQL adapter not implemented. Use YAML adapter for now.');
  }

  async findById(_id: string): Promise<User | null> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async findByEmail(_email: string): Promise<User | null> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async updateSubscription(_userId: string, _status: User['subscription']): Promise<User> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async updateProfile(_userId: string, _data: Partial<Pick<User, 'displayName'>>): Promise<User> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async delete(_userId: string): Promise<void> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async listAll(): Promise<User[]> {
    throw new Error('PostgreSQL adapter not implemented');
  }
}

class PostgresSessionRepository implements SessionRepository {
  constructor(private connectionString: string) { }

  async create(_data: CreateSessionData): Promise<Session> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async findByToken(_token: string): Promise<Session | null> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async findByUserId(_userId: string): Promise<Session[]> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async delete(_sessionId: string): Promise<void> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async deleteAllForUser(_userId: string): Promise<void> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async deleteExpired(): Promise<number> {
    throw new Error('PostgreSQL adapter not implemented');
  }
}

class PostgresProgressRepository implements ProgressRepository {
  constructor(private connectionString: string) { }

  async recordExercise(_data: RecordProgressData): Promise<ExerciseProgress> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async getExercises(_userId: string): Promise<ExerciseProgress[]> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async getExercisesByModule(_userId: string, _moduleId: string): Promise<ExerciseProgress[]> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async getModuleProgress(_userId: string): Promise<ModuleProgress[]> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async getOverallStats(_userId: string): Promise<{
    totalExercises: number;
    correctCount: number;
    incorrectCount: number;
    modulesCompleted: number;
    accuracy: number;
  }> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async clearProgress(_userId: string): Promise<void> {
    throw new Error('PostgreSQL adapter not implemented');
  }
}

class PostgresSettingsRepository implements SettingsRepository {
  constructor(private connectionString: string) { }

  async get(userId: string): Promise<UserSettings> {
    // Return defaults until implemented
    return { userId, ...DEFAULT_USER_SETTINGS };
  }

  async update(_userId: string, _settings: Partial<UserSettings>): Promise<UserSettings> {
    throw new Error('PostgreSQL adapter not implemented');
  }

  async reset(userId: string): Promise<UserSettings> {
    return { userId, ...DEFAULT_USER_SETTINGS };
  }
}

// ===== DATABASE FACTORY =====

export class PostgresDatabase implements Database {
  users: UserRepository;
  sessions: SessionRepository;
  progress: ProgressRepository;
  settings: SettingsRepository;

  constructor(connectionString: string) {
    this.users = new PostgresUserRepository(connectionString);
    this.sessions = new PostgresSessionRepository(connectionString);
    this.progress = new PostgresProgressRepository(connectionString);
    this.settings = new PostgresSettingsRepository(connectionString);
  }

  async initialize(): Promise<void> {
    // TODO: Create tables if they don't exist
    // Run migrations
    console.warn('PostgresDatabase.initialize() not implemented');
  }

  async close(): Promise<void> {
    // TODO: Close connection pool
  }
}

/**
 * SQL Schema for reference when implementing:
 * 
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password_hash VARCHAR(255) NOT NULL,
 *   display_name VARCHAR(255),
 *   subscription VARCHAR(20) DEFAULT 'free',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE sessions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   token VARCHAR(500) NOT NULL,
 *   expires_at TIMESTAMPTZ NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE exercise_progress (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   module_id VARCHAR(100) NOT NULL,
 *   exercise_type VARCHAR(100) NOT NULL,
 *   exercise_index INTEGER NOT NULL,
 *   correct BOOLEAN NOT NULL,
 *   attempt_count INTEGER DEFAULT 1,
 *   completed_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(user_id, module_id, exercise_index)
 * );
 * 
 * CREATE TABLE user_settings (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 *   speech_enabled BOOLEAN DEFAULT true,
 *   speech_rate DECIMAL(3,2) DEFAULT 1.0,
 *   speech_volume DECIMAL(3,2) DEFAULT 1.0,
 *   sound_enabled BOOLEAN DEFAULT true,
 *   sound_volume DECIMAL(3,2) DEFAULT 0.7,
 *   shuffle_exercises BOOLEAN DEFAULT false,
 *   animations BOOLEAN DEFAULT true,
 *   language VARCHAR(10) DEFAULT 'de'
 * );
 */
