/**
 * Telemetry YAML Adapter
 * Stores exercise attempt telemetry data in YAML files
 */
import type {
  ExerciseAttempt,
  RecordAttemptData,
  UserStats,
  AdminDashboardStats,
  DailyStats,
  TelemetryRepository
} from './telemetry';
import type { User } from './types';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

interface TelemetryData {
  attempts: ExerciseAttempt[];
  updatedAt: string;
}

export class YamlTelemetryAdapter implements TelemetryRepository {
  private basePath: string;
  private cache: TelemetryData | null = null;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  private getFilePath(): string {
    return path.join(this.basePath, 'telemetry.yaml');
  }

  private loadData(): TelemetryData {
    if (this.cache) return this.cache;

    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      this.cache = { attempts: [], updatedAt: new Date().toISOString() };
      return this.cache;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.cache = yaml.load(content) as TelemetryData;
      return this.cache;
    } catch {
      this.cache = { attempts: [], updatedAt: new Date().toISOString() };
      return this.cache;
    }
  }

  private saveData(data: TelemetryData): void {
    const filePath = this.getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, yaml.dump(data), 'utf-8');
    this.cache = data;
  }

  async recordAttempt(data: RecordAttemptData): Promise<ExerciseAttempt> {
    const telemetry = this.loadData();

    const attempt: ExerciseAttempt = {
      id: crypto.randomUUID(),
      ...data,
      durationMs: new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime(),
      createdAt: new Date()
    };

    telemetry.attempts.push(attempt);
    this.saveData(telemetry);

    return attempt;
  }

  async getAttemptsByUser(userId: string): Promise<ExerciseAttempt[]> {
    const data = this.loadData();
    return data.attempts.filter(a => a.userId === userId);
  }

  async getAttemptsBySession(sessionId: string): Promise<ExerciseAttempt[]> {
    const data = this.loadData();
    return data.attempts.filter(a => a.sessionId === sessionId);
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const attempts = await this.getAttemptsByUser(userId);

    const totalAttempts = attempts.length;
    const totalCorrect = attempts.filter(a => a.correct).length;
    const totalIncorrect = totalAttempts - totalCorrect;
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    const totalTimeMs = attempts.reduce((sum, a) => sum + a.durationMs, 0);
    const avgTimePerExerciseMs = totalAttempts > 0 ? totalTimeMs / totalAttempts : 0;

    const modulesStarted = new Set(attempts.map(a => a.moduleId)).size;

    const firstActivity = attempts.length > 0
      ? new Date(Math.min(...attempts.map(a => new Date(a.createdAt).getTime())))
      : undefined;
    const lastActivity = attempts.length > 0
      ? new Date(Math.max(...attempts.map(a => new Date(a.createdAt).getTime())))
      : undefined;

    // Count unique days
    const uniqueDays = new Set(
      attempts.map(a => new Date(a.createdAt).toDateString())
    ).size;

    return {
      userId,
      email: '', // Will be filled by caller
      subscription: 'free',
      totalAttempts,
      totalCorrect,
      totalIncorrect,
      accuracy,
      totalTimeMs,
      avgTimePerExerciseMs,
      modulesStarted,
      modulesCompleted: 0, // Would need completion tracking
      firstActivityAt: firstActivity,
      lastActivityAt: lastActivity,
      activeDays: uniqueDays,
      createdAt: new Date()
    };
  }

  async getAllUserStats(): Promise<UserStats[]> {
    const data = this.loadData();
    const userIds = [...new Set(data.attempts.map(a => a.userId))];
    const stats: UserStats[] = [];

    for (const userId of userIds) {
      stats.push(await this.getUserStats(userId));
    }

    return stats;
  }

  async getAdminDashboardStats(users: User[]): Promise<AdminDashboardStats> {
    const data = this.loadData();
    const attempts = data.attempts;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User counts
    const totalUsers = users.length;
    const paidUsers = users.filter(u => u.subscription === 'paid').length;
    const freeUsers = users.filter(u => u.subscription === 'free').length;
    const trialUsers = users.filter(u => u.subscription === 'trial').length;

    // New users
    const newUsersLast7Days = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;
    const newUsersLast30Days = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

    // Active users (users with attempts in period)
    const activeUserIds7Days = new Set(
      attempts
        .filter(a => new Date(a.createdAt) >= sevenDaysAgo)
        .map(a => a.userId)
    );
    const activeUserIds30Days = new Set(
      attempts
        .filter(a => new Date(a.createdAt) >= thirtyDaysAgo)
        .map(a => a.userId)
    );

    // Exercise stats
    const totalExerciseAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.correct).length;
    const overallAccuracy = totalExerciseAttempts > 0
      ? (correctAttempts / totalExerciseAttempts) * 100
      : 0;

    const totalDurationMs = attempts.reduce((sum, a) => sum + a.durationMs, 0);
    const avgSessionDuration = totalExerciseAttempts > 0
      ? (totalDurationMs / 1000 / 60) / activeUserIds30Days.size  // minutes per active user
      : 0;

    // Module stats
    const moduleIds = [...new Set(attempts.map(a => a.moduleId))];
    const moduleStats = moduleIds.map(moduleId => {
      const moduleAttempts = attempts.filter(a => a.moduleId === moduleId);
      const correct = moduleAttempts.filter(a => a.correct).length;
      const total = moduleAttempts.length;
      const uniqueUsers = new Set(moduleAttempts.map(a => a.userId)).size;
      const avgDuration = total > 0
        ? moduleAttempts.reduce((sum, a) => sum + a.durationMs, 0) / total
        : 0;

      return {
        moduleId,
        moduleTitle: moduleId, // Would need to look up
        totalAttempts: total,
        totalCorrect: correct,
        totalIncorrect: total - correct,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        avgDurationMs: avgDuration,
        uniqueUsers,
        completionRate: 0 // Would need completion tracking
      };
    });

    // Exercise type stats
    const exerciseTypes = [...new Set(attempts.map(a => a.exerciseType))];
    const exerciseTypeStats = exerciseTypes.map(exerciseType => {
      const typeAttempts = attempts.filter(a => a.exerciseType === exerciseType);
      const correct = typeAttempts.filter(a => a.correct).length;
      const total = typeAttempts.length;
      const avgDuration = total > 0
        ? typeAttempts.reduce((sum, a) => sum + a.durationMs, 0) / total
        : 0;

      return {
        exerciseType,
        totalAttempts: total,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        avgDurationMs: avgDuration,
        mostFailedExercises: [] // Would need more analysis
      };
    });

    // Daily stats for last 30 days
    const dailyStats: DailyStats[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayAttempts = attempts.filter(a =>
        new Date(a.createdAt).toISOString().split('T')[0] === dateStr
      );
      const dayUsers = new Set(dayAttempts.map(a => a.userId));
      const newUsersOnDay = users.filter(u =>
        new Date(u.createdAt).toISOString().split('T')[0] === dateStr
      ).length;
      const dayCorrect = dayAttempts.filter(a => a.correct).length;

      dailyStats.push({
        date: dateStr,
        activeUsers: dayUsers.size,
        newUsers: newUsersOnDay,
        totalAttempts: dayAttempts.length,
        correctAttempts: dayCorrect,
        avgSessionDurationMs: dayAttempts.length > 0
          ? dayAttempts.reduce((sum, a) => sum + a.durationMs, 0) / dayUsers.size
          : 0
      });
    }

    return {
      totalUsers,
      paidUsers,
      freeUsers,
      trialUsers,
      activeUsersLast7Days: activeUserIds7Days.size,
      activeUsersLast30Days: activeUserIds30Days.size,
      newUsersLast7Days,
      newUsersLast30Days,
      totalExerciseAttempts,
      overallAccuracy,
      avgSessionDuration,
      moduleStats,
      exerciseTypeStats,
      dailyStats
    };
  }

  async getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    const data = this.loadData();
    const stats: DailyStats[] = [];

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayAttempts = data.attempts.filter(a =>
        new Date(a.createdAt).toISOString().split('T')[0] === dateStr
      );

      const dayUsers = new Set(dayAttempts.map(a => a.userId));
      const correct = dayAttempts.filter(a => a.correct).length;

      stats.push({
        date: dateStr,
        activeUsers: dayUsers.size,
        newUsers: 0, // Would need user data
        totalAttempts: dayAttempts.length,
        correctAttempts: correct,
        avgSessionDurationMs: dayAttempts.length > 0
          ? dayAttempts.reduce((sum, a) => sum + a.durationMs, 0) / dayUsers.size
          : 0
      });

      current.setDate(current.getDate() + 1);
    }

    return stats;
  }

  async exportUserData(userId: string): Promise<{ user: UserStats; attempts: ExerciseAttempt[] }> {
    const stats = await this.getUserStats(userId);
    const attempts = await this.getAttemptsByUser(userId);
    return { user: stats, attempts };
  }
}
