import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase, getAuthService } from '$lib/server';

const db = getDatabase('./data');
const authService = getAuthService(db);

/**
 * POST /api/auth/login - Login user
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    const result = await authService.login(email, password);

    if (result.success && result.user) {
      // Don't return password hash to client
      const { passwordHash, ...safeUser } = result.user;
      return json({
        success: true,
        user: safeUser,
        token: result.token
      });
    }

    return json({ success: false, error: result.error }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
