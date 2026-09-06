import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, getDatabase } from '$lib/server';

// Admin emails - in production, store this in database
const ADMIN_EMAILS = ['admin@lern-rudi.at', 'mike@example.com'];

function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * GET /api/admin/users - Get all users (admin only)
 */
export const GET: RequestHandler = async ({ request }) => {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json({ success: false, error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return json({ success: false, error: 'Ungültiges Token' }, { status: 401 });
    }

    // Check admin status
    if (!isAdmin(payload.email)) {
      return json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
    }

    const db = getDatabase('./data');
    const users = await db.users.listAll();

    // Remove password hashes for safety
    const safeUsers = users.map(user => {
      const { passwordHash, ...safe } = user;
      return safe;
    });

    return json({
      success: true,
      users: safeUsers,
      total: users.length
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
  }
};

/**
 * DELETE /api/admin/users - Delete a user (admin only)
 */
export const DELETE: RequestHandler = async ({ request }) => {
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

    const { userId } = await request.json();

    if (!userId) {
      return json({ success: false, error: 'User ID erforderlich' }, { status: 400 });
    }

    const db = getDatabase('./data');

    // Don't allow deleting yourself
    if (userId === payload.userId) {
      return json({ success: false, error: 'Kann sich nicht selbst löschen' }, { status: 400 });
    }

    await db.users.delete(userId);

    return json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
  }
};
