import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase, getAuthService } from '$lib/server';

const db = getDatabase('./data');
const authService = getAuthService(db);

/**
 * POST /api/auth/logout - Logout user
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    await authService.logout(token);
    return json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
