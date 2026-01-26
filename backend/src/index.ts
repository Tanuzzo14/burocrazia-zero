import type { Env } from './types';
import { identifyOperation } from './gemini';
import { createLead, updateLeadStatus, getLeadById } from './database';
import { createPaymentLink, verifyWebhookSignature } from './paypal';
import { prepareOperatorEmailData } from './email';
import { processPendingEmails, getEmailQueueStats, validateEmailConfig, EMAIL_REGEX, queueEmail, sendAndDeleteEmail, getEmailByLeadId, hasAnyEmailForLead } from './emailQueue';

// CORS headers for frontend communication
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Type for email health check response
interface EmailHealthResponse {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  configuration: {
    brevo_api_key: boolean;
    brevo_sender_email: boolean;
    operator_email: boolean;
  };
  validation: {
    errors: string[];
    warnings: string[];
  };
  queue_stats?: {
    pending: number;
    sent: number;
    failed: number;
  };
}

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
        
        // Transform each option to include commission and total cost
        const options = result.options.map(option => ({
          operation: option.label,
          stateCost: option.costo_stato,
          commission: parseFloat(env.COMMISSION_AMOUNT),
          totalCost: option.costo_stato + parseFloat(env.COMMISSION_AMOUNT),
          guideUrl: option.guida_url,
          isGeneric: option.is_generic || false,
          requiresCaf: option.requires_caf || false
        }));

        return jsonResponse({ options });
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

        // Generate lead ID upfront
        const leadId = crypto.randomUUID();

        // STEP 1: Create lead in database FIRST (without email_queue_id)
        const lead = await createLead(
          {
            nome_cognome: body.nome_cognome,
            telefono: body.telefono,
            tipo_operazione: body.tipo_operazione,
            totale_incassato: body.totale_incassato,
            guida_url: body.guida_url,
          },
          env,
          leadId
        );
        console.log(`Lead created with ID ${lead.id}`);

        // STEP 2: Queue email AFTER lead is created (FOREIGN KEY can now reference lead_id)
        const emailData = prepareOperatorEmailData(lead, body.guida_url, env);
        const queuedEmail = await queueEmail(emailData, env);
        console.log(`Email queued with ID ${queuedEmail.id} for lead ${leadId}`);

        // Generate PayPal payment link
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

      // Route: POST /api/webhook/paypal - Handle PayPal webhooks
      if (url.pathname === '/api/webhook/paypal' && request.method === 'POST') {
        const body = await request.text();
        
        try {
          const event = await verifyWebhookSignature(body, request.headers, env);

          // Handle successful payment - PayPal event: CHECKOUT.ORDER.APPROVED
          if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
            const order = event.resource;
            
            // Validate purchase_units exists and has at least one element
            if (!order.purchase_units || order.purchase_units.length === 0) {
              console.error('No purchase_units in webhook data');
              return errorResponse('Invalid webhook data', 400);
            }
            
            const leadId = order.purchase_units[0].reference_id;

            if (!leadId) {
              console.error('No reference_id in webhook data');
              return errorResponse('Invalid webhook data', 400);
            }

            // Update lead status to PAID
            await updateLeadStatus(leadId, 'PAID', env);

            // Find the queued email for this lead using lead_id (only PENDING emails)
            const queuedEmail = await getEmailByLeadId(leadId, env);
            if (!queuedEmail) {
              // Check if any email exists for this lead to distinguish between scenarios
              const hasEmail = await hasAnyEmailForLead(leadId, env);
              if (hasEmail) {
                // Email exists but not pending - already processed
                console.log(`Email for lead ${leadId} already processed (sent or failed)`);
              } else {
                // No email found at all - this is unexpected and might indicate a data issue
                console.error(`No email record found for lead ${leadId} - possible data inconsistency`);
              }
              return jsonResponse({ received: true });
            }

            // Send the queued email
            try {
              await sendAndDeleteEmail(queuedEmail.id, env);
              console.log(`Email sent and deleted for lead ${leadId}, email_queue_id ${queuedEmail.id}`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const errorStack = error instanceof Error ? error.stack : '';
              console.error(`Failed to send email for lead ${leadId}, email_queue_id ${queuedEmail.id}:`, errorMessage, errorStack);
              // Don't fail the webhook - the retry mechanism will handle it
            }

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

      // Route: GET /api/email/health - Email system health check
      if (url.pathname === '/api/email/health' && request.method === 'GET') {
        const health: EmailHealthResponse = {
          status: 'unknown' as any, // Will be set based on validation
          timestamp: new Date().toISOString(),
          configuration: {
            brevo_api_key: false,
            brevo_sender_email: false,
            operator_email: false,
          },
          validation: {
            errors: [],
            warnings: [],
          },
        };

        // Check environment variables
        health.configuration.brevo_api_key = !!env.BREVO_API_KEY;
        health.configuration.brevo_sender_email = !!env.BREVO_SENDER_EMAIL;
        health.configuration.operator_email = !!env.OPERATOR_EMAIL;

        // Validate configuration
        try {
          if (!env.BREVO_API_KEY) {
            health.validation.errors.push('BREVO_API_KEY is not configured');
          }
          if (!env.BREVO_SENDER_EMAIL) {
            health.validation.errors.push('BREVO_SENDER_EMAIL is not configured');
          } else if (!EMAIL_REGEX.test(env.BREVO_SENDER_EMAIL)) {
            health.validation.errors.push('BREVO_SENDER_EMAIL has invalid format');
          }
          if (!env.OPERATOR_EMAIL) {
            health.validation.errors.push('OPERATOR_EMAIL is not configured');
          } else if (!EMAIL_REGEX.test(env.OPERATOR_EMAIL)) {
            health.validation.errors.push('OPERATOR_EMAIL has invalid format');
          }

          // Get queue statistics
          const stats = await getEmailQueueStats(env);
          health.queue_stats = stats;

          if (stats.failed > 0) {
            health.validation.warnings.push(`${stats.failed} emails permanently failed`);
          }
          if (stats.pending > 10) {
            health.validation.warnings.push(`${stats.pending} emails pending (high queue)`);
          }

          // Determine overall status
          if (health.validation.errors.length > 0) {
            health.status = 'error';
          } else if (health.validation.warnings.length > 0) {
            health.status = 'warning';
          } else {
            health.status = 'healthy';
          }
        } catch (error) {
          health.status = 'error';
          health.validation.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }

        return jsonResponse(health, health.status === 'error' ? 500 : 200);
      }

      // Route: POST /api/email/process - Manually trigger email queue processing
      if (url.pathname === '/api/email/process' && request.method === 'POST') {
        const result = await processPendingEmails(env);
        return jsonResponse({
          message: 'Email queue processed',
          ...result
        });
      }

      // Route: GET /api/email/stats - Get email queue statistics
      if (url.pathname === '/api/email/stats' && request.method === 'GET') {
        const stats = await getEmailQueueStats(env);
        return jsonResponse(stats);
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

  /**
   * Scheduled event handler for automatic email queue processing
   * This runs periodically (configured in wrangler.toml) to retry failed emails
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Running scheduled email queue processing...');
    try {
      const result = await processPendingEmails(env);
      console.log(`Email queue processed: sent=${result.sent}, failed=${result.failed}, pending=${result.pending}`);
    } catch (error) {
      console.error('Scheduled email processing error:', error);
    }
  },
};
