import { json, type RequestHandler } from '@sveltejs/kit';
import { getDatabase } from '$lib/server';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

/**
 * POST /api/payment/webhook - Handle Stripe webhook events
 */
export const POST: RequestHandler = async ({ request }) => {
  if (!STRIPE_SECRET_KEY) {
    console.warn('Stripe not configured, ignoring webhook');
    return json({ received: true });
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    // In production, verify the webhook signature
    // For now, we'll process the event directly
    let event;

    try {
      event = JSON.parse(payload);
    } catch (err) {
      console.error('Invalid webhook payload');
      return json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (userId) {
          // Update user subscription to paid
          const db = getDatabase('./data');
          await db.users.updateSubscription(userId, 'paid');
          console.log(`User ${userId} upgraded to paid`);
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const db = getDatabase('./data');

          if (subscription.status === 'active') {
            await db.users.updateSubscription(userId, 'paid');
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await db.users.updateSubscription(userId, 'free');
            console.log(`User ${userId} downgraded to free`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.warn(`Payment failed for invoice ${invoice.id}`);
        // Could send notification to user here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return json({ error: 'Webhook handler failed' }, { status: 500 });
  }
};
