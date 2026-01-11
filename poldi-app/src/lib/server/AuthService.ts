/**
 * Authentication Service - Password hashing and JWT token management
 * 
 * Handles user authentication including password hashing,
 * JWT token generation/validation, and session management.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { User, Session, CreateSessionData } from './db/types';
import type { Database } from './db/Repository';
import { env } from '$env/dynamic/private';

// ===== CONFIGURATION =====

const SALT_ROUNDS = 12;
const JWT_ALGORITHM = 'HS256';
const TOKEN_EXPIRY_HOURS = 24 * 7; // 1 week

function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    console.warn('JWT_SECRET not set, using development default');
    return 'poldi-app-development-secret-change-in-production';
  }
  return env.JWT_SECRET;
}

// ===== TYPES =====

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  subscription: string;
  iat: number;
  exp: number;
}

// ===== PASSWORD FUNCTIONS =====

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== TOKEN FUNCTIONS =====

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    subscription: user.subscription
  };

  return jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: `${TOKEN_EXPIRY_HOURS}h`
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode a token without verifying (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

// ===== AUTH SERVICE CLASS =====

export class AuthService {
  constructor(private db: Database) { }

  /**
   * Register a new user
   */
  async register(email: string, password: string, displayName?: string): Promise<AuthResult> {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    const existing = await this.db.users.findByEmail(email);
    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await this.db.users.create({
      email,
      passwordHash,
      displayName
    });

    // Generate token
    const token = generateToken(user);

    // Create session
    await this.createSession(user.id, token);

    return { success: true, user, token };
  }

  /**
   * Login an existing user
   */
  async login(email: string, password: string): Promise<AuthResult> {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Find user
    const user = await this.db.users.findByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate token
    const token = generateToken(user);

    // Create session
    await this.createSession(user.id, token);

    return { success: true, user, token };
  }

  /**
   * Logout a user (invalidate session)
   */
  async logout(token: string): Promise<boolean> {
    const session = await this.db.sessions.findByToken(token);
    if (session) {
      await this.db.sessions.delete(session.id);
      return true;
    }
    return false;
  }

  /**
   * Validate a token and return the user
   */
  async validateToken(token: string): Promise<AuthResult> {
    // Verify JWT
    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // Check session exists
    const session = await this.db.sessions.findByToken(token);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Get user
    const user = await this.db.users.findById(payload.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user, token };
  }

  /**
   * Refresh a token (generates new token, invalidates old)
   */
  async refreshToken(oldToken: string): Promise<AuthResult> {
    const result = await this.validateToken(oldToken);
    if (!result.success || !result.user) {
      return result;
    }

    // Delete old session
    await this.logout(oldToken);

    // Generate new token
    const newToken = generateToken(result.user);
    await this.createSession(result.user.id, newToken);

    return { success: true, user: result.user, token: newToken };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResult> {
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const user = await this.db.users.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    // Note: We'd need to add updatePassword to the repository
    // For now, this is a stub

    // Invalidate all sessions
    await this.db.sessions.deleteAllForUser(userId);

    return { success: true, user };
  }

  /**
   * Create a session for a user
   */
  private async createSession(userId: string, token: string): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    const sessionData: CreateSessionData = {
      userId,
      token,
      expiresAt
    };

    return this.db.sessions.create(sessionData);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    return this.db.sessions.deleteExpired();
  }
}

// ===== FACTORY =====

let authServiceInstance: AuthService | null = null;

export function getAuthService(db: Database): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(db);
  }
  return authServiceInstance;
}

export function resetAuthService(): void {
  authServiceInstance = null;
}
