import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, getDatabase } from '$lib/server';
import { env } from '$env/dynamic/private';

/**
 * POST /api/payment/create-portal - Create Stripe Customer Portal session
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

    // Get user to find Stripe Customer ID
    const db = getDatabase();
    const user = await db.users.findById(payload.userId);

    if (!user) {
      return json({ success: false, error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      // If no customer ID, they probably haven't subscribed yet or we don't have it linked.
      // We could try to find by email via Stripe API, but for now just error.
      return json({ success: false, error: 'Kein aktives Abonnement gefunden' }, { status: 400 });
    }

    // Check if Stripe is configured
    if (!env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured, returning mock portal URL');
      return json({
        success: true,
        url: `${env.APP_URL || ''}/app/account?mock=portal`
      });
    }

    // Create Portal Session
    const body = new URLSearchParams();
    body.append('customer', user.stripeCustomerId);
    body.append('return_url', `${env.APP_URL || ''}/app/account`);

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Stripe portal error:', error);
      return json({
        success: false,
        error: 'Fehler beim Erstellen der Portal-Sitzung'
      }, { status: 500 });
    }

    const session = await response.json();

    return json({
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error('Portal error:', error);
    return json({
      success: false,
      error: 'Interner Serverfehler'
    }, { status: 500 });
  }
};
