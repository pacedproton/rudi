import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, getDatabase } from '$lib/server';

const ADMIN_EMAILS = ['admin@lern-rudi.at', 'mike@example.com'];

function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * POST /api/admin/users/subscription - Update user subscription (admin only)
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json({ success: false, error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload.email)) {
      return json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
    }

    const { userId, subscription } = await request.json();

    if (!userId || !subscription) {
      return json({ success: false, error: 'User ID und Subscription erforderlich' }, { status: 400 });
    }

    if (!['free', 'trial', 'paid'].includes(subscription)) {
      return json({ success: false, error: 'Ungültiger Subscription-Status' }, { status: 400 });
    }

    const db = getDatabase('./data');
    const user = await db.users.updateSubscription(userId, subscription);

    const { passwordHash, ...safeUser } = user;

    return json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Admin update subscription error:', error);
    return json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
  }
};
