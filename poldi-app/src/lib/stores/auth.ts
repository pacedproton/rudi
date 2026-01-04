/**
 * Auth Store - Client-side authentication state management
 * 
 * Manages user authentication state with Svelte stores.
 * Handles token storage in localStorage and API communication.
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

// ===== TYPES =====

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  subscription: 'free' | 'paid' | 'trial';
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// ===== STORAGE =====

const TOKEN_KEY = 'poldi-auth-token';
const USER_KEY = 'poldi-auth-user';

function loadToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string | null): void {
  if (!browser) return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function loadUser(): AuthUser | null {
  if (!browser) return null;
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

function saveUser(user: AuthUser | null): void {
  if (!browser) return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

// ===== AUTH STORE =====

function createAuthStore() {
  const { subscribe, set, update }: Writable<AuthState> = writable({
    user: loadUser(),
    token: loadToken(),
    loading: false,
    error: null
  });

  async function apiRequest(
    endpoint: string,
    method: string = 'GET',
    body?: unknown
  ): Promise<LoginResponse> {
    const token = loadToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: `Network error: ${error}` };
    }
  }

  return {
    subscribe,

    /**
     * Register a new user
     */
    async register(email: string, password: string, displayName?: string): Promise<boolean> {
      update(s => ({ ...s, loading: true, error: null }));

      const result = await apiRequest('/api/auth/register', 'POST', {
        email,
        password,
        displayName
      });

      if (result.success && result.user && result.token) {
        saveToken(result.token);
        saveUser(result.user);
        set({
          user: result.user,
          token: result.token,
          loading: false,
          error: null
        });
        return true;
      }

      update(s => ({
        ...s,
        loading: false,
        error: result.error || 'Registration failed'
      }));
      return false;
    },

    /**
     * Login an existing user
     */
    async login(email: string, password: string): Promise<boolean> {
      update(s => ({ ...s, loading: true, error: null }));

      const result = await apiRequest('/api/auth/login', 'POST', {
        email,
        password
      });

      if (result.success && result.user && result.token) {
        saveToken(result.token);
        saveUser(result.user);
        set({
          user: result.user,
          token: result.token,
          loading: false,
          error: null
        });
        return true;
      }

      update(s => ({
        ...s,
        loading: false,
        error: result.error || 'Login failed'
      }));
      return false;
    },

    /**
     * Logout the current user
     */
    async logout(): Promise<void> {
      const token = loadToken();
      if (token) {
        await apiRequest('/api/auth/logout', 'POST');
      }
      saveToken(null);
      saveUser(null);
      set({
        user: null,
        token: null,
        loading: false,
        error: null
      });
    },

    /**
     * Validate the current token
     */
    async validateSession(): Promise<boolean> {
      const token = loadToken();
      if (!token) {
        return false;
      }

      update(s => ({ ...s, loading: true }));

      const result = await apiRequest('/api/auth/me', 'GET');

      if (result.success && result.user) {
        saveUser(result.user);
        update(s => ({
          ...s,
          user: result.user!,
          loading: false
        }));
        return true;
      }

      // Token invalid, clear auth state
      saveToken(null);
      saveUser(null);
      set({
        user: null,
        token: null,
        loading: false,
        error: null
      });
      return false;
    },

    /**
     * Clear any error state
     */
    clearError(): void {
      update(s => ({ ...s, error: null }));
    },

    /**
     * Check if user is logged in (synchronous check)
     */
    isLoggedIn(): boolean {
      return loadToken() !== null;
    }
  };
}

export const auth = createAuthStore();

// ===== DERIVED STORES =====

export const isAuthenticated: Readable<boolean> = derived(
  auth,
  $auth => $auth.user !== null && $auth.token !== null
);

export const currentUser: Readable<AuthUser | null> = derived(
  auth,
  $auth => $auth.user
);

export const isPaidUser: Readable<boolean> = derived(
  auth,
  $auth => $auth.user?.subscription === 'paid'
);

export const authLoading: Readable<boolean> = derived(
  auth,
  $auth => $auth.loading
);

export const authError: Readable<string | null> = derived(
  auth,
  $auth => $auth.error
);
