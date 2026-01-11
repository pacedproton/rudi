import { json, type RequestHandler } from '@sveltejs/kit';
import { getDatabase } from '$lib/server';
import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';

/**
 * POST /api/payment/webhook - Handle Stripe webhook events
 * Handles both one-time payments (lifetime) and subscriptions (monthly)
 */
export const POST: RequestHandler = async ({ request }) => {
  console.log('=== Stripe Webhook Received ===');

  if (!env.STRIPE_SECRET_KEY) {
    console.warn('Stripe not configured, ignoring webhook');
    return json({ received: true });
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Verify signature if secret is present
    if (env.STRIPE_WEBHOOK_SECRET && signature) {
      const parts = signature.split(',').reduce((acc, part) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const timestamp = parts.t;
      const hmac = createHmac('sha256', env.STRIPE_WEBHOOK_SECRET);
      hmac.update(`${timestamp}.${payload}`);
      const calculated = hmac.digest('hex');

      if (calculated !== parts.v1) {
        console.error('❌ Invalid webhook signature');
        return json({ error: 'Invalid signature' }, { status: 400 });
      }
      console.log('✅ Signature verified');
    } else {
      console.warn('⚠️ No signature verification (STRIPE_WEBHOOK_SECRET not set or no signature)');
    }

    let event;
    try {
      event = JSON.parse(payload);
    } catch (err) {
      console.error('❌ Invalid webhook payload');
      return json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(`📦 Event type: ${event.type}`);
    console.log(`📦 Event ID: ${event.id}`);

    const db = getDatabase();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const mode = session.mode; // 'payment' for one-time, 'subscription' for recurring
        const paymentStatus = session.payment_status;

        console.log(`🛒 Checkout completed:`);
        console.log(`   - Mode: ${mode}`);
        console.log(`   - Payment Status: ${paymentStatus}`);
        console.log(`   - User ID: ${userId || 'not found'}`);
        console.log(`   - Customer ID: ${customerId || 'not found'}`);
        console.log(`   - Email: ${customerEmail || 'not found'}`);

        // Find user - by ID first, then by email
        let targetUserId = userId;
        if (!targetUserId && customerEmail) {
          console.log(`🔍 Looking up user by email: ${customerEmail}`);
          const user = await db.users.findByEmail(customerEmail);
          if (user) {
            targetUserId = user.id;
            console.log(`✅ Found user by email: ${user.id}`);
          }
        }

        if (targetUserId && paymentStatus === 'paid') {
          // Update customer ID if present
          if (customerId) {
            await db.users.updateStripeCustomerId(targetUserId, customerId as string);
            console.log(`💳 Updated Stripe customer ID for user ${targetUserId}`);
          }
          // Update subscription to paid
          await db.users.updateSubscription(targetUserId, 'paid');
          console.log(`✅ User ${targetUserId} upgraded to PAID via checkout (mode: ${mode})`);
        } else {
          console.warn(`⚠️ Could not update user: userId=${targetUserId}, paymentStatus=${paymentStatus}`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const customerId = subscription.customer;
        const status = subscription.status;

        console.log(`📅 Subscription ${event.type}:`);
        console.log(`   - Status: ${status}`);
        console.log(`   - User ID: ${userId || 'not in metadata'}`);
        console.log(`   - Customer ID: ${customerId}`);

        if (userId) {
          if (customerId) {
            await db.users.updateStripeCustomerId(userId, customerId as string);
          }

          if (status === 'active' || status === 'trialing') {
            await db.users.updateSubscription(userId, 'paid');
            console.log(`✅ User ${userId} subscription active`);
          } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
            await db.users.updateSubscription(userId, 'free');
            console.log(`⚠️ User ${userId} subscription ${status} -> downgraded to free`);
          }
        } else {
          // Try to find user by customer ID
          console.log(`🔍 No userId in metadata, looking up by customer ID: ${customerId}`);
          // Future: implement findByStripeCustomerId
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        console.log(`🗑️ Subscription deleted for user: ${userId || 'unknown'}`);

        if (userId) {
          await db.users.updateSubscription(userId, 'free');
          console.log(`✅ User ${userId} downgraded to free`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`💰 Payment succeeded: ${paymentIntent.id}, amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}, error: ${paymentIntent.last_payment_error?.message}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log('=== Webhook Processed ===\n');
    return json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return json({ error: 'Webhook handler failed' }, { status: 500 });
  }
};
