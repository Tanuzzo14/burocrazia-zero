import Stripe from 'stripe';
import type { Env } from './types';

export async function createPaymentLink(
  amount: number,
  leadId: string,
  operationName: string,
  env: Env
): Promise<string> {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });

  // Create a payment link
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: operationName,
            description: `Commissione servizio + costi statali`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL || 'https://burocrazia-zero.pages.dev'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL || 'https://burocrazia-zero.pages.dev'}/cancel`,
    metadata: {
      lead_id: leadId,
    },
  });

  return session.url || '';
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  env: Env
): Promise<Stripe.Event> {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });

  try {
    return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw new Error('Invalid webhook signature');
  }
}
