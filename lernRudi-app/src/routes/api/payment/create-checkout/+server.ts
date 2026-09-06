import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server';

// Stripe API configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID_FAMILY = process.env.STRIPE_PRICE_ID_FAMILY || 'price_family_monthly';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * POST /api/payment/create-checkout - Create Stripe checkout session
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

    const { planId } = await request.json();

    if (planId !== 'family') {
      return json({ success: false, error: 'Ungültiger Plan' }, { status: 400 });
    }

    // Check if Stripe is configured
    if (!STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured, returning mock checkout URL');
      // For development without Stripe
      return json({
        success: true,
        url: `${APP_URL}/app?payment=success&mock=true`
      });
    }

    // Create Stripe checkout session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'success_url': `${APP_URL}/app?payment=success`,
        'cancel_url': `${APP_URL}/signup?plan=family&payment=cancelled`,
        'line_items[0][price]': STRIPE_PRICE_ID_FAMILY,
        'line_items[0][quantity]': '1',
        'customer_email': payload.email,
        'client_reference_id': payload.userId,
        'metadata[userId]': payload.userId,
        'metadata[planId]': planId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Stripe error:', error);
      return json({
        success: false,
        error: 'Fehler beim Erstellen der Zahlungssitzung'
      }, { status: 500 });
    }

    const session = await response.json();

    return json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return json({
      success: false,
      error: 'Interner Serverfehler'
    }, { status: 500 });
  }
};
