import type { Env, EmailQueueItem, CreateEmailRequest } from './types';

// Configuration constants
const EMAIL_QUEUE_CONFIG = {
  MAX_RETRIES: 5,
  BATCH_SIZE: 50,
  // Retry delays in seconds: 1min, 5min, 15min, 1hour, 4hours
  RETRY_DELAYS: [60, 300, 900, 3600, 14400],
} as const;

/**
 * Queue an email for sending with automatic retry mechanism
 */
export async function queueEmail(emailData: CreateEmailRequest, env: Env): Promise<EmailQueueItem> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  // Insert email into queue
  await env.DB.prepare(
    `INSERT INTO email_queue (
      id, lead_id, recipient_email, recipient_name, sender_email, sender_name,
      subject, html_content, text_content, status, retry_count, max_retries,
      created_at, next_retry_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, ?, ?, ?)`
  )
    .bind(
      id,
      emailData.lead_id,
      emailData.recipient_email,
      emailData.recipient_name,
      emailData.sender_email,
      emailData.sender_name,
      emailData.subject,
      emailData.html_content,
      emailData.text_content,
      EMAIL_QUEUE_CONFIG.MAX_RETRIES,
      now,
      now // Try to send immediately
    )
    .run();

  const queuedEmail: EmailQueueItem = {
    id,
    lead_id: emailData.lead_id,
    recipient_email: emailData.recipient_email,
    recipient_name: emailData.recipient_name,
    sender_email: emailData.sender_email,
    sender_name: emailData.sender_name,
    subject: emailData.subject,
    html_content: emailData.html_content,
    text_content: emailData.text_content,
    status: 'PENDING',
    retry_count: 0,
    max_retries: EMAIL_QUEUE_CONFIG.MAX_RETRIES,
    last_error: null,
    created_at: now,
    sent_at: null,
    next_retry_at: now,
  };

  // Try to send immediately in background (don't await to avoid blocking)
  // The cron job will retry if this fails
  processPendingEmails(env).catch(error => {
    console.error(`Background email processing failed for email ${id} (lead: ${emailData.lead_id}):`, error);
  });

  return queuedEmail;
}

/**
 * Validate email environment variables
 */
function validateEmailConfig(env: Env): void {
  const missingVars: string[] = [];
  
  if (!env.BREVO_API_KEY) {
    missingVars.push('BREVO_API_KEY');
  }
  if (!env.BREVO_SENDER_EMAIL) {
    missingVars.push('BREVO_SENDER_EMAIL');
  }
  if (!env.OPERATOR_EMAIL) {
    missingVars.push('OPERATOR_EMAIL');
  }
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required email environment variables: ${missingVars.join(', ')}. ` +
      `Please configure these in your Cloudflare Worker settings. ` +
      `See GUIDA_FACILE.md for setup instructions.`
    );
  }
  
  // Validate email format for sender and operator
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(env.BREVO_SENDER_EMAIL)) {
    throw new Error(`BREVO_SENDER_EMAIL has invalid format: ${env.BREVO_SENDER_EMAIL}`);
  }
  if (!emailRegex.test(env.OPERATOR_EMAIL)) {
    throw new Error(`OPERATOR_EMAIL has invalid format: ${env.OPERATOR_EMAIL}`);
  }
}

/**
 * Send an email via Brevo API
 */
async function sendEmailViaBrevo(email: EmailQueueItem, env: Env): Promise<void> {
  // Validate configuration before attempting to send
  validateEmailConfig(env);
  
  const emailData = {
    sender: {
      name: email.sender_name,
      email: email.sender_email,
    },
    to: [
      {
        email: email.recipient_email,
        name: email.recipient_name,
      },
    ],
    subject: email.subject,
    htmlContent: email.html_content,
    textContent: email.text_content,
  };

  console.log(`Attempting to send email via Brevo: ID=${email.id}, To=${email.recipient_email}, Subject="${email.subject}"`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = `Brevo API error (${response.status}): ${errorText}`;
    console.error(`Failed to send email ${email.id}:`, errorMessage);
    
    // Provide helpful error messages based on status code
    if (response.status === 401) {
      throw new Error(`${errorMessage}. Check that BREVO_API_KEY is valid.`);
    } else if (response.status === 400) {
      throw new Error(`${errorMessage}. Check that BREVO_SENDER_EMAIL is verified in your Brevo account.`);
    } else {
      throw new Error(errorMessage);
    }
  }
  
  console.log(`Email sent successfully via Brevo: ID=${email.id}`);
}

/**
 * Calculate next retry time using exponential backoff
 */
function calculateNextRetryTime(retryCount: number): string {
  const delaySeconds = EMAIL_QUEUE_CONFIG.RETRY_DELAYS[
    Math.min(retryCount, EMAIL_QUEUE_CONFIG.RETRY_DELAYS.length - 1)
  ];
  const nextRetry = new Date(Date.now() + delaySeconds * 1000);
  return nextRetry.toISOString();
}

/**
 * Mark email as sent
 */
async function markEmailAsSent(emailId: string, env: Env): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE email_queue SET status = 'SENT', sent_at = ? WHERE id = ?`
  )
    .bind(now, emailId)
    .run();
}

/**
 * Mark email as failed and schedule retry if retries remain
 */
async function markEmailAsFailed(
  emailId: string,
  error: string,
  retryCount: number,
  maxRetries: number,
  env: Env
): Promise<void> {
  if (retryCount >= maxRetries) {
    // No more retries, mark as permanently failed
    await env.DB.prepare(
      `UPDATE email_queue SET status = 'FAILED', last_error = ?, retry_count = ? WHERE id = ?`
    )
      .bind(error, retryCount, emailId)
      .run();
  } else {
    // Schedule next retry
    const nextRetry = calculateNextRetryTime(retryCount);
    await env.DB.prepare(
      `UPDATE email_queue SET 
        status = 'PENDING', 
        last_error = ?, 
        retry_count = ?, 
        next_retry_at = ? 
      WHERE id = ?`
    )
      .bind(error, retryCount + 1, nextRetry, emailId)
      .run();
  }
}

/**
 * Process all pending emails that are ready to be sent
 */
export async function processPendingEmails(env: Env): Promise<{ sent: number; failed: number; pending: number }> {
  console.log('Starting email queue processing...');
  const now = new Date().toISOString();
  
  // Validate email configuration before processing
  try {
    validateEmailConfig(env);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email configuration validation failed:', errorMessage);
    throw error; // Re-throw to prevent processing with invalid config
  }
  
  // Get all pending emails that are ready to be sent (next_retry_at <= now)
  const result = await env.DB.prepare(
    `SELECT * FROM email_queue 
     WHERE status = 'PENDING' 
     AND (next_retry_at IS NULL OR next_retry_at <= ?)
     ORDER BY created_at ASC
     LIMIT ?`
  )
    .bind(now, EMAIL_QUEUE_CONFIG.BATCH_SIZE)
    .all<EmailQueueItem>();

  const emails = result.results || [];
  console.log(`Found ${emails.length} pending emails to process`);
  
  let sent = 0;
  let failed = 0;
  let pending = 0;

  for (const email of emails) {
    try {
      console.log(`Processing email ${sent + failed + pending + 1}/${emails.length}: ID=${email.id}, Attempt=${email.retry_count + 1}/${email.max_retries}`);
      await sendEmailViaBrevo(email, env);
      await markEmailAsSent(email.id, env);
      sent++;
      console.log(`✓ Email sent successfully: ${email.id} to ${email.recipient_email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`✗ Failed to send email ${email.id} (attempt ${email.retry_count + 1}/${email.max_retries}):`, errorMessage);
      
      await markEmailAsFailed(
        email.id,
        errorMessage,
        email.retry_count,
        email.max_retries,
        env
      );
      
      if (email.retry_count >= email.max_retries) {
        failed++;
        console.error(`Email ${email.id} permanently failed after ${email.max_retries} attempts`);
      } else {
        pending++;
        const nextRetry = calculateNextRetryTime(email.retry_count);
        console.log(`Email ${email.id} scheduled for retry at ${nextRetry}`);
      }
    }
  }

  const summary = { sent, failed, pending };
  console.log(`Email queue processing complete: ${JSON.stringify(summary)}`);
  return summary;
}

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats(env: Env): Promise<{
  pending: number;
  sent: number;
  failed: number;
}> {
  const pending = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM email_queue WHERE status = 'PENDING'`
  ).first<{ count: number }>();

  const sent = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM email_queue WHERE status = 'SENT'`
  ).first<{ count: number }>();

  const failed = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM email_queue WHERE status = 'FAILED'`
  ).first<{ count: number }>();

  return {
    pending: pending?.count || 0,
    sent: sent?.count || 0,
    failed: failed?.count || 0,
  };
}
