# Email Queue System - Complete Guide

## Overview

This document describes the email queue system implemented to ensure reliable email delivery via Brevo, even when the API is temporarily unavailable or experiences issues.

## The Problem

Previously, emails were sent synchronously during the PayPal webhook processing. If Brevo's API failed (network issues, rate limits, temporary outages), the email would be lost forever, and operators would miss critical payment notifications.

## The Solution

A database-backed email queue with automatic retry mechanism using exponential backoff. All emails are persisted before sending, and failed deliveries are automatically retried up to 5 times.

## Architecture

### Components

1. **Email Queue Table** (`email_queue`)
   - Stores all email attempts with full content
   - Tracks status (PENDING, SENT, FAILED)
   - Maintains retry count and error messages
   - Optimized with index for efficient processing

2. **Email Queue Service** (`backend/src/emailQueue.ts`)
   - `queueEmail()`: Add email to queue
   - `processPendingEmails()`: Process queued emails with retry logic
   - `getEmailQueueStats()`: Get queue statistics
   - Configuration constants for easy tuning

3. **Cron Job** (Cloudflare Workers Scheduled Event)
   - Runs every 5 minutes
   - Automatically processes pending emails
   - Handles retries with exponential backoff

4. **API Endpoints**
   - `POST /api/email/process`: Manual trigger
   - `GET /api/email/stats`: Queue statistics

### Flow Diagram

```
Payment Confirmed
       ↓
Queue Email to Database (status: PENDING)
       ↓
Attempt Send in Background (non-blocking)
       ↓
   ┌─ Success? ───┐
   │              │
  Yes            No
   │              │
   ↓              ↓
Mark SENT    Log Error & Schedule Retry
             (1min, 5min, 15min, 1hr, 4hrs)
                  ↓
            Cron Job (every 5 min)
                  ↓
            Retry Sending
                  ↓
            Max Retries? (5)
                  ↓
                 Yes → Mark FAILED
```

## Configuration

All configuration is centralized in `EMAIL_QUEUE_CONFIG` constant:

```typescript
const EMAIL_QUEUE_CONFIG = {
  MAX_RETRIES: 5,                                // Maximum retry attempts
  BATCH_SIZE: 50,                                 // Emails processed per batch
  RETRY_DELAYS: [60, 300, 900, 3600, 14400],     // Retry schedule (seconds)
} as const;
```

### Retry Schedule

| Attempt | Delay     | Time After Failure |
|---------|-----------|-------------------|
| 1       | 1 minute  | 1 minute          |
| 2       | 5 minutes | 6 minutes         |
| 3       | 15 minutes| 21 minutes        |
| 4       | 1 hour    | 1h 21m            |
| 5       | 4 hours   | 5h 21m            |

After 5 failed attempts, the email is marked as FAILED and requires manual intervention.

## Database Schema

```sql
CREATE TABLE email_queue (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    last_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    next_retry_at DATETIME,
    FOREIGN KEY (lead_id) REFERENCES lead_pratiche(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_queue_processing ON email_queue(status, next_retry_at, created_at);
```

## Usage

### Migration

Apply the database migration:

```bash
# Production
wrangler d1 execute burocrazia-zero-db --file=./schema.sql

# Local development
wrangler d1 execute burocrazia-zero-db --local --file=./schema.sql
```

### Monitoring

#### Check Queue Statistics

```bash
curl https://your-domain.com/api/email/stats
```

Response:
```json
{
  "pending": 3,
  "sent": 147,
  "failed": 2
}
```

#### Manual Processing

Trigger immediate processing of pending emails:

```bash
curl -X POST https://your-domain.com/api/email/process
```

Response:
```json
{
  "message": "Email queue processed",
  "sent": 5,
  "failed": 0,
  "pending": 2
}
```

### Database Queries

#### View Pending Emails

```sql
SELECT id, recipient_email, subject, retry_count, last_error, next_retry_at
FROM email_queue
WHERE status = 'PENDING'
ORDER BY created_at ASC;
```

#### View Failed Emails

```sql
SELECT id, recipient_email, subject, retry_count, last_error, created_at
FROM email_queue
WHERE status = 'FAILED'
ORDER BY created_at DESC;
```

#### View Recent Activity

```sql
SELECT 
  status,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM email_queue
WHERE created_at >= datetime('now', '-1 day')
GROUP BY status;
```

## Troubleshooting

### Emails Stuck in PENDING

**Symptoms**: Emails remain in PENDING status for extended periods

**Possible Causes**:
1. Brevo API credentials invalid
2. Network connectivity issues
3. Brevo API down
4. Rate limiting

**Solutions**:
1. Check Brevo API key: Verify `BREVO_API_KEY` environment variable
2. Check sender email: Verify `BREVO_SENDER_EMAIL` is authorized
3. Review logs for error messages
4. Manually trigger processing: `POST /api/email/process`
5. Check `last_error` field in database

### High Failure Rate

**Symptoms**: Many emails marked as FAILED

**Investigation Steps**:
1. Query failed emails to find common errors:
   ```sql
   SELECT last_error, COUNT(*) as count
   FROM email_queue
   WHERE status = 'FAILED'
   GROUP BY last_error
   ORDER BY count DESC;
   ```

2. Check Brevo dashboard for account issues
3. Verify API quotas and limits
4. Review error logs for patterns

### Cron Job Not Running

**Symptoms**: Pending emails not being processed automatically

**Solutions**:
1. Check wrangler.toml has cron trigger configured
2. Verify deployment includes scheduled handler
3. Check Cloudflare Workers dashboard for cron execution logs
4. Use manual trigger as fallback: `POST /api/email/process`

## Performance Considerations

### Batch Processing

- Default batch size: 50 emails per run
- Cron runs every 5 minutes
- Maximum throughput: ~600 emails/hour during normal operation
- Adjust `BATCH_SIZE` if needed for higher volume

### Database Optimization

- Index on `(status, next_retry_at, created_at)` ensures fast queries
- Regular cleanup of old SENT emails recommended (optional)

### Non-Blocking Design

- Email queueing is fast (single DB insert)
- Sending happens in background to not block webhooks
- Cron job provides guaranteed processing

## Security

### Data Protection

- Email content stored in database (encrypted at rest by Cloudflare D1)
- Foreign key CASCADE ensures data consistency
- No sensitive credentials in email queue table

### CodeQL Analysis

All code has passed CodeQL security scanning with zero vulnerabilities.

## Best Practices

### Monitoring

1. Set up alerts for high FAILED count
2. Monitor `/api/email/stats` regularly
3. Review failed emails weekly

### Maintenance

1. Periodically clean up old SENT emails (optional):
   ```sql
   DELETE FROM email_queue
   WHERE status = 'SENT'
   AND sent_at < datetime('now', '-30 days');
   ```

2. Investigate FAILED emails and retry manually if needed

3. Adjust retry delays based on Brevo API behavior

### Testing

1. Test with PayPal sandbox webhooks
2. Temporarily break Brevo credentials to verify retry mechanism
3. Monitor logs during first production deployments

## Future Enhancements

Potential improvements for future iterations:

1. **Dead Letter Queue**: Separate storage for permanently failed emails
2. **Email Templates**: Template management in database
3. **Priority Queue**: Send critical emails first
4. **Bulk Operations**: Batch API calls to Brevo
5. **Dashboard**: Admin UI for queue management
6. **Alerts**: Webhook notifications for failures
7. **Analytics**: Email delivery metrics and reports

## Support

For issues or questions about the email queue system:

1. Check this documentation
2. Review error logs
3. Query the `email_queue` table
4. Check Brevo API status
5. Consult Cloudflare Workers documentation for cron issues

## Summary

The email queue system provides:

✅ **Reliability**: No lost emails, even during API failures  
✅ **Automation**: Automatic retry with exponential backoff  
✅ **Monitoring**: Easy to track status and failures  
✅ **Performance**: Non-blocking, optimized for scale  
✅ **Maintenance**: Simple configuration and troubleshooting  

This ensures that every payment notification reaches the operator, maintaining the reliability of the Burocrazia Zero service.
