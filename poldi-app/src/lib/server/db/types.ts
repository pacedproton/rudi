/**
 * Database Types - Core data models for the Lern-Rudi application
 */

// ===== USER MODELS =====

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  subscription: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'free' | 'paid' | 'trial';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName?: string;
}

// ===== SESSION MODELS =====

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateSessionData {
  userId: string;
  token: string;
  expiresAt: Date;
}

// ===== PROGRESS MODELS =====

export interface ExerciseProgress {
  id: string;
  userId: string;
  moduleId: string;
  exerciseType: string;
  exerciseIndex: number;
  correct: boolean;
  attemptCount: number;
  completedAt: Date;
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  totalExercises: number;
  correctCount: number;
  incorrectCount: number;
  completedAt?: Date;
}

export interface RecordProgressData {
  userId: string;
  moduleId: string;
  exerciseType: string;
  exerciseIndex: number;
  correct: boolean;
}

// ===== USER SETTINGS =====

export interface UserSettings {
  userId: string;
  speechEnabled: boolean;
  speechRate: number;
  speechVolume: number;
  soundEnabled: boolean;
  soundVolume: number;
  shuffleExercises: boolean;
  animations: boolean;
  language: string;
}

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId'> = {
  speechEnabled: true,
  speechRate: 1.0,
  speechVolume: 1.0,
  soundEnabled: true,
  soundVolume: 0.7,
  shuffleExercises: false,
  animations: true,
  language: 'de'
};
