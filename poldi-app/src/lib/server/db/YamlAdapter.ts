/**
 * YAML Adapter - File-based database implementation
 * 
 * Stores data in YAML files for easy development and small-scale deployments.
 * Can be swapped to PostgreSQL for production scale.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { randomUUID } from 'crypto';

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

// ===== FILE STORAGE HELPERS =====

interface YamlStore<T> {
  data: T[];
  updatedAt: string;
}

class YamlFileStorage<T extends { id: string }> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(private dataDir: string, private filename: string) {
    this.filePath = join(dataDir, filename);
  }

  private ensureDir(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private load(): T[] {
    if (this.cache !== null) {
      return this.cache;
    }

    this.ensureDir();

    if (!existsSync(this.filePath)) {
      this.cache = [];
      return this.cache;
    }

    try {
      const content = readFileSync(this.filePath, 'utf-8');
      const store = yaml.load(content) as YamlStore<T> | null;
      this.cache = store?.data || [];
      return this.cache;
    } catch (error) {
      console.error(`Failed to load ${this.filename}:`, error);
      this.cache = [];
      return this.cache;
    }
  }

  private save(): void {
    this.ensureDir();
    const store: YamlStore<T> = {
      data: this.cache || [],
      updatedAt: new Date().toISOString()
    };
    writeFileSync(this.filePath, yaml.dump(store), 'utf-8');
  }

  getAll(): T[] {
    return this.load();
  }

  findById(id: string): T | null {
    return this.load().find(item => item.id === id) || null;
  }

  findBy(predicate: (item: T) => boolean): T | null {
    return this.load().find(predicate) || null;
  }

  findAllBy(predicate: (item: T) => boolean): T[] {
    return this.load().filter(predicate);
  }

  create(item: T): T {
    this.load();
    this.cache!.push(item);
    this.save();
    return item;
  }

  update(id: string, updates: Partial<T>): T | null {
    this.load();
    const index = this.cache!.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.cache![index] = { ...this.cache![index], ...updates };
    this.save();
    return this.cache![index];
  }

  delete(id: string): boolean {
    this.load();
    const index = this.cache!.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.cache!.splice(index, 1);
    this.save();
    return true;
  }

  deleteWhere(predicate: (item: T) => boolean): number {
    this.load();
    const initialLength = this.cache!.length;
    this.cache = this.cache!.filter(item => !predicate(item));
    const deleted = initialLength - this.cache.length;
    if (deleted > 0) {
      this.save();
    }
    return deleted;
  }

  clearCache(): void {
    this.cache = null;
  }
}

// ===== REPOSITORY IMPLEMENTATIONS =====

class YamlUserRepository implements UserRepository {
  private storage: YamlFileStorage<User & { id: string }>;

  constructor(dataDir: string) {
    this.storage = new YamlFileStorage(dataDir, 'users.yaml');
  }

  async create(data: CreateUserData): Promise<User> {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      displayName: data.displayName,
      subscription: 'free',
      createdAt: now,
      updatedAt: now
    };
    return this.storage.create(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.storage.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.storage.findBy(u => u.email === email.toLowerCase());
  }

  async updateSubscription(userId: string, status: User['subscription']): Promise<User> {
    const user = this.storage.update(userId, {
      subscription: status,
      updatedAt: new Date()
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const user = this.storage.update(userId, {
      stripeCustomerId: customerId,
      updatedAt: new Date()
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'displayName'>>): Promise<User> {
    const user = this.storage.update(userId, {
      ...data,
      updatedAt: new Date()
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async delete(userId: string): Promise<void> {
    this.storage.delete(userId);
  }

  async listAll(): Promise<User[]> {
    return this.storage.getAll();
  }
}

class YamlSessionRepository implements SessionRepository {
  private storage: YamlFileStorage<Session & { id: string }>;

  constructor(dataDir: string) {
    this.storage = new YamlFileStorage(dataDir, 'sessions.yaml');
  }

  async create(data: CreateSessionData): Promise<Session> {
    const session: Session = {
      id: randomUUID(),
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: new Date()
    };
    return this.storage.create(session);
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = this.storage.findBy(s => s.token === token);
    if (session && new Date(session.expiresAt) < new Date()) {
      // Session expired
      this.storage.delete(session.id);
      return null;
    }
    return session;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.storage.findAllBy(s => s.userId === userId);
  }

  async delete(sessionId: string): Promise<void> {
    this.storage.delete(sessionId);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    this.storage.deleteWhere(s => s.userId === userId);
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    return this.storage.deleteWhere(s => new Date(s.expiresAt) < now);
  }
}

class YamlProgressRepository implements ProgressRepository {
  private storage: YamlFileStorage<ExerciseProgress & { id: string }>;

  constructor(dataDir: string) {
    this.storage = new YamlFileStorage(dataDir, 'progress.yaml');
  }

  async recordExercise(data: RecordProgressData): Promise<ExerciseProgress> {
    // Check if there's an existing attempt for this exercise
    const existing = this.storage.findBy(
      p => p.userId === data.userId &&
        p.moduleId === data.moduleId &&
        p.exerciseIndex === data.exerciseIndex
    );

    if (existing) {
      // Update existing record
      const updated = this.storage.update(existing.id, {
        correct: data.correct,
        attemptCount: existing.attemptCount + 1,
        completedAt: new Date()
      });
      return updated!;
    }

    // Create new record
    const progress: ExerciseProgress = {
      id: randomUUID(),
      userId: data.userId,
      moduleId: data.moduleId,
      exerciseType: data.exerciseType,
      exerciseIndex: data.exerciseIndex,
      correct: data.correct,
      attemptCount: 1,
      completedAt: new Date()
    };
    return this.storage.create(progress);
  }

  async getExercises(userId: string): Promise<ExerciseProgress[]> {
    return this.storage.findAllBy(p => p.userId === userId);
  }

  async getExercisesByModule(userId: string, moduleId: string): Promise<ExerciseProgress[]> {
    return this.storage.findAllBy(p => p.userId === userId && p.moduleId === moduleId);
  }

  async getModuleProgress(userId: string): Promise<ModuleProgress[]> {
    const exercises = await this.getExercises(userId);

    // Group by module
    const moduleMap = new Map<string, { correct: number; incorrect: number; total: number }>();

    for (const ex of exercises) {
      const current = moduleMap.get(ex.moduleId) || { correct: 0, incorrect: 0, total: 0 };
      current.total++;
      if (ex.correct) {
        current.correct++;
      } else {
        current.incorrect++;
      }
      moduleMap.set(ex.moduleId, current);
    }

    return Array.from(moduleMap.entries()).map(([moduleId, stats]) => ({
      userId,
      moduleId,
      totalExercises: stats.total,
      correctCount: stats.correct,
      incorrectCount: stats.incorrect
    }));
  }

  async getOverallStats(userId: string): Promise<{
    totalExercises: number;
    correctCount: number;
    incorrectCount: number;
    modulesCompleted: number;
    accuracy: number;
  }> {
    const moduleProgress = await this.getModuleProgress(userId);

    let total = 0;
    let correct = 0;
    let incorrect = 0;

    for (const mp of moduleProgress) {
      total += mp.totalExercises;
      correct += mp.correctCount;
      incorrect += mp.incorrectCount;
    }

    return {
      totalExercises: total,
      correctCount: correct,
      incorrectCount: incorrect,
      modulesCompleted: moduleProgress.length,
      accuracy: total > 0 ? (correct / total) * 100 : 0
    };
  }

  async clearProgress(userId: string): Promise<void> {
    this.storage.deleteWhere(p => p.userId === userId);
  }
}

class YamlSettingsRepository implements SettingsRepository {
  private storage: YamlFileStorage<UserSettings & { id: string }>;

  constructor(dataDir: string) {
    this.storage = new YamlFileStorage(dataDir, 'settings.yaml');
  }

  async get(userId: string): Promise<UserSettings> {
    const existing = this.storage.findBy(s => s.userId === userId);
    if (existing) {
      return existing;
    }
    // Return defaults if not found
    return { userId, ...DEFAULT_USER_SETTINGS };
  }

  async update(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const existing = this.storage.findBy(s => s.userId === userId);

    if (existing) {
      const updated = this.storage.update(existing.id, settings);
      return updated!;
    }

    // Create new settings
    const newSettings: UserSettings & { id: string } = {
      id: randomUUID(),
      userId,
      ...DEFAULT_USER_SETTINGS,
      ...settings
    };
    return this.storage.create(newSettings);
  }

  async reset(userId: string): Promise<UserSettings> {
    const existing = this.storage.findBy(s => s.userId === userId);

    if (existing) {
      const updated = this.storage.update(existing.id, DEFAULT_USER_SETTINGS);
      return updated!;
    }

    return { userId, ...DEFAULT_USER_SETTINGS };
  }
}

// ===== DATABASE FACTORY =====

export class YamlDatabase implements Database {
  users: UserRepository;
  sessions: SessionRepository;
  progress: ProgressRepository;
  settings: SettingsRepository;

  constructor(dataDir: string = './data') {
    this.users = new YamlUserRepository(dataDir);
    this.sessions = new YamlSessionRepository(dataDir);
    this.progress = new YamlProgressRepository(dataDir);
    this.settings = new YamlSettingsRepository(dataDir);
  }

  async initialize(): Promise<void> {
    // YAML adapter doesn't need initialization
    // Files are created on first write
    console.log('YamlDatabase initialized');
  }

  async close(): Promise<void> {
    // No connections to close for file-based storage
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(dataDir?: string): Database {
  if (!dbInstance) {
    dbInstance = new YamlDatabase(dataDir);
  }
  return dbInstance;
}

export function resetDatabase(): void {
  dbInstance = null;
}
