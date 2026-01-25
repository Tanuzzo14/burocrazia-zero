# Email Queue Migration

This migration adds the `email_queue` table to enable reliable email delivery with automatic retry mechanism.

## Migration Command

To apply this migration to your D1 database, run:

```bash
wrangler d1 execute burocrazia-zero-db --file=./schema.sql
```

Or for local development:

```bash
wrangler d1 execute burocrazia-zero-db --local --file=./schema.sql
```

## Migration Details

The migration adds a new table `email_queue` with the following features:

- **Persistent queue**: All emails are saved to the database before sending
- **Automatic retry**: Failed emails are automatically retried with exponential backoff
- **Retry schedule**: 1min, 5min, 15min, 1hour, 4hours (max 5 retries)
- **Status tracking**: Track emails as PENDING, SENT, or FAILED
- **Error logging**: Last error message is stored for debugging

## New API Endpoints

### Process Email Queue (Manual Trigger)
```
POST /api/email/process
```

Manually trigger processing of pending emails in the queue.

**Response:**
```json
{
  "message": "Email queue processed",
  "sent": 5,
  "failed": 0,
  "pending": 2
}
```

### Get Email Queue Statistics
```
GET /api/email/stats
```

Get statistics about the email queue.

**Response:**
```json
{
  "pending": 3,
  "sent": 147,
  "failed": 2
}
```

## How It Works

1. When a payment is confirmed, an email is queued in the database
2. The system immediately attempts to send the email via Brevo
3. If sending fails:
   - The error is logged
   - The email stays in PENDING status
   - A retry is scheduled based on exponential backoff
4. On subsequent requests or manual processing, pending emails are retried
5. After 5 failed attempts, the email is marked as FAILED

## Monitoring

You can monitor the email queue by:

1. Checking logs for email sending attempts
2. Calling `/api/email/stats` to see queue statistics
3. Querying the `email_queue` table directly

## Troubleshooting

If emails are stuck in PENDING status:

1. Check Brevo API credentials
2. Verify network connectivity
3. Manually trigger processing: `POST /api/email/process`
4. Check the `last_error` field in the database for error details
