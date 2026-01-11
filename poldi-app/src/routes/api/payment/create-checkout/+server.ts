import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, getDatabase } from '$lib/server';
import { env } from '$env/dynamic/private';
import { sendCheckoutNotification } from '$lib/server/EmailService';

/**
 * POST /api/payment/create-checkout - Create Stripe checkout session
 * Supports: 'lifetime' (one-time €30) and 'monthly' (subscription €10/month)
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Get request headers for notification email
    const userAgent = request.headers.get('User-Agent') || undefined;
    const referer = request.headers.get('Referer') || undefined;
    const language = request.headers.get('Accept-Language')?.split(',')[0] || undefined;
    const ipAddress = request.headers.get('X-Forwarded-For')?.split(',')[0] ||
      request.headers.get('X-Real-IP') ||
      'unknown';

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
    let planName: string;

    if (planId === 'lifetime') {
      priceId = env.STRIPE_PRICE_ID_FAMILY || '';
      mode = 'payment';
      planName = 'Einmalzahlung (€30)';
    } else if (planId === 'monthly') {
      priceId = env.STRIPE_PRICE_ID_MONTHLY || env.STRIPE_PRICE_ID_FAMILY || '';
      mode = 'subscription';
      planName = 'Monatsabo (€10/Monat)';
    } else {
      return json({ success: false, error: 'Ungültiger Plan' }, { status: 400 });
    }

    // Get user display name from database
    const db = getDatabase();
    const user = await db.users.findById(payload.userId);
    const displayName = user?.displayName;

    // Send admin notification email (async, don't wait)
    sendCheckoutNotification({
      email: payload.email,
      displayName,
      planId,
      planName,
      userAgent,
      ipAddress,
      referer,
      language
    }).catch(err => console.error('Checkout notification email error:', err));

    // Check if Stripe is configured
    if (!env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured, returning mock checkout URL');
      return json({
        success: true,
        url: `${env.APP_URL || ''}/app?payment=success&mock=true`
      });
    }

    // Create Stripe checkout session
    const body = new URLSearchParams();
    body.append('mode', mode);
    body.append('success_url', `${env.APP_URL || ''}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    body.append('cancel_url', `${env.APP_URL || ''}/signup?plan=${planId}&payment=cancelled`);
    body.append('line_items[0][price]', priceId);
    body.append('line_items[0][quantity]', '1');
    body.append('customer_email', payload.email);
    body.append('client_reference_id', payload.userId);
    body.append('metadata[userId]', payload.userId);
    body.append('metadata[planId]', planId);
    if (mode === 'subscription') {
      body.append('subscription_data[metadata][userId]', payload.userId);
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
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
