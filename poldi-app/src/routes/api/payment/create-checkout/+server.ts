import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server';
import { STRIPE_SECRET_KEY, STRIPE_PRICE_ID_FAMILY, APP_URL } from '$env/static/private';

// Optional: STRIPE_PRICE_ID_MONTHLY - create in Stripe for monthly subscription
const STRIPE_PRICE_ID_MONTHLY = (import.meta.env?.STRIPE_PRICE_ID_MONTHLY as string) || '';

/**
 * POST /api/payment/create-checkout - Create Stripe checkout session
 * Supports: 'lifetime' (one-time €40) and 'monthly' (subscription €10/month)
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

    // Validate plan and get price + mode
    let priceId: string;
    let mode: 'payment' | 'subscription';

    if (planId === 'lifetime') {
      priceId = STRIPE_PRICE_ID_FAMILY; // €40 one-time
      mode = 'payment';
    } else if (planId === 'monthly') {
      priceId = STRIPE_PRICE_ID_MONTHLY || STRIPE_PRICE_ID_FAMILY; // €10/month, fallback to family
      mode = 'subscription';
    } else {
      return json({ success: false, error: 'Ungültiger Plan' }, { status: 400 });
    }

    // Check if Stripe is configured
    if (!STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured, returning mock checkout URL');
      return json({
        success: true,
        url: `${APP_URL}/app?payment=success&mock=true`
      });
    }

    // Create Stripe checkout session
    const body = new URLSearchParams();
    body.append('mode', mode);
    body.append('success_url', `${APP_URL}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    body.append('cancel_url', `${APP_URL}/signup?plan=${planId}&payment=cancelled`);
    body.append('line_items[0][price]', priceId);
    body.append('line_items[0][quantity]', '1');
    body.append('customer_email', payload.email);
    body.append('client_reference_id', payload.userId);
    body.append('metadata[userId]', payload.userId);
    body.append('metadata[planId]', planId);
    body.append('subscription_data[metadata][userId]', payload.userId);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
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
