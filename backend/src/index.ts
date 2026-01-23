import type { Env } from './types';
import { identifyOperation } from './gemini';
import { createLead, updateLeadStatus, getLeadById } from './database';
import { createPaymentLink, verifyWebhookSignature } from './stripe';
import { sendWhatsAppToOperator } from './twilio';

// CORS headers for frontend communication
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: POST /api/identify - Identify operation using Gemini
      if (url.pathname === '/api/identify' && request.method === 'POST') {
        const { query } = await request.json() as { query: string };

        if (!query || query.trim().length === 0) {
          return errorResponse('Query is required');
        }

        const result = await identifyOperation(query, env);
        const totalCost = result.costo_stato + parseFloat(env.COMMISSION_AMOUNT);

        return jsonResponse({
          operation: result.label,
          stateCost: result.costo_stato,
          commission: parseFloat(env.COMMISSION_AMOUNT),
          totalCost,
          guideUrl: result.guida_url,
        });
      }

      // Route: POST /api/book - Create lead and generate payment link
      if (url.pathname === '/api/book' && request.method === 'POST') {
        const body = await request.json() as {
          nome_cognome: string;
          telefono: string;
          tipo_operazione: string;
          totale_incassato: number;
          guida_url: string;
        };

        // Validate phone number format (international format)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(body.telefono)) {
          return errorResponse('Invalid phone number format. Use international format (e.g., +393331234567)');
        }

        // Validate required fields
        if (!body.nome_cognome || !body.tipo_operazione || !body.totale_incassato) {
          return errorResponse('Missing required fields');
        }

        // Create lead in database
        const lead = await createLead(
          {
            nome_cognome: body.nome_cognome,
            telefono: body.telefono,
            tipo_operazione: body.tipo_operazione,
            totale_incassato: body.totale_incassato,
            guida_url: body.guida_url,
          },
          env
        );

        // Generate Stripe payment link
        const paymentUrl = await createPaymentLink(
          body.totale_incassato,
          lead.id,
          body.tipo_operazione,
          env
        );

        return jsonResponse({
          leadId: lead.id,
          paymentUrl,
        });
      }

      // Route: POST /api/webhook/stripe - Handle Stripe webhooks
      if (url.pathname === '/api/webhook/stripe' && request.method === 'POST') {
        const signature = request.headers.get('stripe-signature');
        if (!signature) {
          return errorResponse('Missing stripe signature', 400);
        }

        const body = await request.text();
        
        try {
          const event = await verifyWebhookSignature(body, signature, env);

          // Handle successful payment
          if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const leadId = session.metadata?.lead_id;

            if (!leadId) {
              console.error('No lead_id in webhook metadata');
              return errorResponse('Invalid webhook data', 400);
            }

            // Update lead status to PAID
            await updateLeadStatus(leadId, 'PAID', env);

            // Get lead details
            const lead = await getLeadById(leadId, env);
            if (!lead) {
              console.error('Lead not found:', leadId);
              return errorResponse('Lead not found', 404);
            }

            // Send WhatsApp notification to operator
            await sendWhatsAppToOperator(lead, lead.guida_url, env);

            return jsonResponse({ received: true });
          }

          return jsonResponse({ received: true });
        } catch (error) {
          console.error('Webhook error:', error);
          return errorResponse('Webhook processing failed', 400);
        }
      }

      // Route: GET /api/health - Health check
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return jsonResponse({ status: 'ok' });
      }

      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('Request error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  },
};
