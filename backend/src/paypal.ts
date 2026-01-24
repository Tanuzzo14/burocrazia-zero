import type { Env } from './types';

// PayPal SDK types (minimal definitions needed for our use case)
interface PayPalAmount {
  currency_code: string;
  value: string;
}

interface PayPalPurchaseUnit {
  description: string;
  amount: PayPalAmount;
  reference_id?: string;
}

interface PayPalApplicationContext {
  return_url: string;
  cancel_url: string;
  brand_name?: string;
  user_action?: string;
}

interface PayPalOrderRequest {
  intent: string;
  purchase_units: PayPalPurchaseUnit[];
  application_context?: PayPalApplicationContext;
}

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: PayPalLink[];
}

// Get PayPal OAuth token
async function getPayPalAccessToken(env: Env): Promise<string> {
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${env.PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

// Create a PayPal order for payment
export async function createPaymentLink(
  amount: number,
  leadId: string,
  operationName: string,
  env: Env
): Promise<string> {
  const accessToken = await getPayPalAccessToken(env);

  const orderRequest: PayPalOrderRequest = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: operationName,
        amount: {
          currency_code: 'EUR',
          value: amount.toFixed(2),
        },
        reference_id: leadId,
      },
    ],
    application_context: {
      return_url: `${env.FRONTEND_URL || 'https://burocrazia-zero.pages.dev'}/success`,
      cancel_url: `${env.FRONTEND_URL || 'https://burocrazia-zero.pages.dev'}/cancel`,
      brand_name: 'Burocrazia Zero',
      user_action: 'PAY_NOW',
    },
  };

  const response = await fetch(`${env.PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal order: ${error}`);
  }

  const order = await response.json() as PayPalOrder;
  
  // Find the approval URL
  const approvalLink = order.links.find(link => link.rel === 'approve');
  if (!approvalLink) {
    throw new Error('No approval URL in PayPal order response');
  }

  return approvalLink.href;
}

// Verify PayPal webhook signature
export async function verifyWebhookSignature(
  body: string,
  headers: Headers,
  env: Env
): Promise<any> {
  const transmissionId = headers.get('paypal-transmission-id');
  const transmissionTime = headers.get('paypal-transmission-time');
  const transmissionSig = headers.get('paypal-transmission-sig');
  const certUrl = headers.get('paypal-cert-url');
  const authAlgo = headers.get('paypal-auth-algo');

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    throw new Error('Missing PayPal webhook headers');
  }

  const accessToken = await getPayPalAccessToken(env);

  const verifyRequest = {
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: env.PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(body),
  };

  const response = await fetch(`${env.PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verifyRequest),
  });

  if (!response.ok) {
    throw new Error('Failed to verify PayPal webhook signature');
  }

  const verification = await response.json() as { verification_status: string };
  
  if (verification.verification_status !== 'SUCCESS') {
    throw new Error('Invalid webhook signature');
  }

  return JSON.parse(body);
}

// Capture payment for an order
export async function capturePayment(orderId: string, env: Env): Promise<any> {
  const accessToken = await getPayPalAccessToken(env);

  const response = await fetch(`${env.PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to capture PayPal payment: ${error}`);
  }

  return await response.json();
}
