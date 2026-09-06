import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase, getAuthService } from '$lib/server';

const db = getDatabase('./data');
const authService = getAuthService(db);

/**
 * GET /api/auth/me - Get current user
 */
export const GET: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const result = await authService.validateToken(token);

    if (result.success && result.user) {
      const { passwordHash, ...safeUser } = result.user;
      return json({
        success: true,
        user: safeUser
      });
    }

    return json({ success: false, error: result.error }, { status: 401 });
  } catch (error) {
    console.error('Auth validation error:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
