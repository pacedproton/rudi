import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, getDatabase } from '$lib/server';

const ADMIN_EMAILS = ['admin@lern-rudi.at', 'mike@example.com'];

function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Module name mapping
const MODULE_NAMES: Record<string, string> = {
  'phonology': 'Reime & Laute',
  'lettersounds': 'Anfangslaute',
  'quantities': 'Mengen',
  'counting': 'Zählen',
  'memory': 'Gedächtnis',
  'visual': 'Wahrnehmung',
  'motor': 'Motorik',
  'spatial': 'Raumorientierung',
  'drawing': 'Zeichnen',
  'storytelling': 'Geschichten',
  'syllables': 'Silben',
  'bonus-realworld': 'Was gibt es in echt?'
};

/**
 * GET /api/admin/stats - Get admin dashboard statistics
 */
export const GET: RequestHandler = async ({ request }) => {
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

    const db = getDatabase('./data');
    const users = await db.users.listAll();

    // Calculate user stats
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = users.length;
    const paidUsers = users.filter(u => u.subscription === 'paid').length;
    const freeUsers = users.filter(u => u.subscription === 'free').length;
    const trialUsers = users.filter(u => u.subscription === 'trial').length;

    const newUsersLast7Days = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;
    const newUsersLast30Days = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

    // For now, provide base stats - telemetry will be populated as exercises are played
    // This ensures the page works even without telemetry data
    const stats = {
      overview: {
        totalUsers,
        paidUsers,
        freeUsers,
        trialUsers,
        conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0
      },
      growth: {
        newUsersLast7Days,
        newUsersLast30Days,
        activeUsersLast7Days: 0, // Will be real once telemetry is tracked
        activeUsersLast30Days: 0
      },
      exercises: {
        totalAttempts: 0,
        overallAccuracy: 0,
        avgSessionDurationMinutes: 0
      },
      moduleBreakdown: Object.entries(MODULE_NAMES).map(([id, name]) => ({
        id,
        name,
        attempts: 0,
        accuracy: 0
      })),
      recentUsers: users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(u => ({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          subscription: u.subscription,
          createdAt: u.createdAt
        }))
    };

    return json({ success: true, stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    return json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
  }
};
