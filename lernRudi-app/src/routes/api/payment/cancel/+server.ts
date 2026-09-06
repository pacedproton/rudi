import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, getDatabase } from '$lib/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

/**
 * POST /api/payment/cancel - Cancel subscription
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Verify auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json({ success: false, error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return json({ success: false, error: 'Ungültiges Token' }, { status: 401 });
    }

    // For development without Stripe
    if (!STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured, mock cancellation');
      const db = getDatabase('./data');
      await db.users.updateSubscription(payload.userId, 'free');
      return json({ success: true, message: 'Subscription cancelled (mock)' });
    }

    // Get user to find their Stripe subscription
    const db = getDatabase('./data');
    const user = await db.users.findById(payload.userId);

    if (!user) {
      return json({ success: false, error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    // In a real implementation, you would:
    // 1. Look up the user's Stripe customer ID
    // 2. List their subscriptions
    // 3. Cancel the subscription

    // For now, we'll just update the database
    await db.users.updateSubscription(payload.userId, 'free');

    return json({
      success: true,
      message: 'Abonnement gekündigt'
    });

  } catch (error) {
    console.error('Cancel error:', error);
    return json({
      success: false,
      error: 'Interner Serverfehler'
    }, { status: 500 });
  }
};
