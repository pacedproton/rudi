/**
 * Extended Telemetry Types - Detailed exercise tracking
 */

import type { SubscriptionStatus } from './types';

// ===== EXERCISE ATTEMPT TELEMETRY =====

export interface ExerciseAttempt {
  id: string;
  userId: string;
  sessionId: string;
  moduleId: string;
  exerciseType: string;
  exerciseIndex: number;

  // Correctness
  correct: boolean;
  attemptNumber: number;

  // Timing
  startedAt: Date;
  completedAt: Date;
  durationMs: number;

  // For specific exercises
  userAnswer?: string;
  expectedAnswer?: string;

  // Device info
  deviceType?: 'desktop' | 'tablet' | 'mobile';

  // Created
  createdAt: Date;
}

export interface RecordAttemptData {
  userId: string;
  sessionId: string;
  moduleId: string;
  exerciseType: string;
  exerciseIndex: number;
  correct: boolean;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
  userAnswer?: string;
  expectedAnswer?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
}

// ===== AGGREGATED STATISTICS =====

export interface UserStats {
  userId: string;
  email: string;
  displayName?: string;
  subscription: SubscriptionStatus;

  // Overall
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;

  // Time
  totalTimeMs: number;
  avgTimePerExerciseMs: number;

  // Progress
  modulesStarted: number;
  modulesCompleted: number;

  // Activity
  firstActivityAt?: Date;
  lastActivityAt?: Date;
  activeDays: number;

  createdAt: Date;
}

export interface ModuleStats {
  moduleId: string;
  moduleTitle: string;

  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;

  avgDurationMs: number;

  uniqueUsers: number;
  completionRate: number;
}

export interface ExerciseTypeStats {
  exerciseType: string;

  totalAttempts: number;
  accuracy: number;
  avgDurationMs: number;

  // Problem detection
  mostFailedExercises: Array<{
    moduleId: string;
    exerciseIndex: number;
    failureRate: number;
    attempts: number;
  }>;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  activeUsers: number;
  newUsers: number;
  totalAttempts: number;
  correctAttempts: number;
  avgSessionDurationMs: number;
}

export interface AdminDashboardStats {
  // Overview
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  trialUsers: number;

  // Activity (last 30 days)
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;

  // Exercise stats
  totalExerciseAttempts: number;
  overallAccuracy: number;
  avgSessionDuration: number;

  // By module
  moduleStats: ModuleStats[];

  // By exercise type
  exerciseTypeStats: ExerciseTypeStats[];

  // Daily trend
  dailyStats: DailyStats[];
}

// ===== TELEMETRY REPOSITORY =====

export interface TelemetryRepository {
  /** Record a single exercise attempt */
  recordAttempt(data: RecordAttemptData): Promise<ExerciseAttempt>;

  /** Get all attempts for a user */
  getAttemptsByUser(userId: string): Promise<ExerciseAttempt[]>;

  /** Get attempts for a specific session */
  getAttemptsBySession(sessionId: string): Promise<ExerciseAttempt[]>;

  /** Get user statistics */
  getUserStats(userId: string): Promise<UserStats>;

  /** Get all user statistics (admin) */
  getAllUserStats(): Promise<UserStats[]>;

  /** Get admin dashboard statistics */
  getAdminDashboardStats(): Promise<AdminDashboardStats>;

  /** Get daily statistics for a date range */
  getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]>;

  /** Export user data (for GDPR) */
  exportUserData(userId: string): Promise<{
    user: UserStats;
    attempts: ExerciseAttempt[];
  }>;
}
