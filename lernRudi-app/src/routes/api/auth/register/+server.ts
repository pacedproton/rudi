import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase, getAuthService } from '$lib/server';

const db = getDatabase('./data');
const authService = getAuthService(db);

/**
 * POST /api/auth/register - Register new user
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, displayName } = await request.json();

    const result = await authService.register(email, password, displayName);

    if (result.success && result.user) {
      // Don't return password hash to client
      const { passwordHash, ...safeUser } = result.user;
      return json({
        success: true,
        user: safeUser,
        token: result.token
      });
    }

    return json({ success: false, error: result.error }, { status: 400 });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
