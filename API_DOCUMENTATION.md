# API Documentation - Burocrazia-Zero Backend

## Base URL

- **Development**: `http://localhost:8787/api`
- **Production**: `https://your-worker-name.workers.dev/api`

## Endpoints

### 1. Health Check

**Endpoint**: `GET /api/health`

**Description**: Check if the API is running.

**Response**:
```json
{
  "status": "ok"
}
```

---

### 2. Identify Operation

**Endpoint**: `POST /api/identify`

**Description**: Uses Gemini AI to identify bureaucratic operations and estimate costs. Returns multiple options when the query is generic, allowing users to select the most appropriate one.

**Request Body**:
```json
{
  "query": "Richiedere lo SPID"
}
```

**Response** (Multiple Options):
```json
{
  "options": [
    {
      "operation": "Richiesta SPID con operatore",
      "stateCost": 12.00,
      "commission": 10.00,
      "totalCost": 22.00,
      "guideUrl": "https://www.spid.gov.it/richiedi-spid",
      "isGeneric": false
    },
    {
      "operation": "Consulenza Generica - Costi aggiuntivi in base all'operazione",
      "stateCost": 0.00,
      "commission": 10.00,
      "totalCost": 10.00,
      "guideUrl": "#consulenza-generica",
      "isGeneric": true
    }
  ]
}
```

**Response Fields**:
- `operation`: Name of the bureaucratic operation
- `stateCost`: Government/state fees for the operation
- `commission`: Service commission (fixed at €10)
- `totalCost`: Total amount to be paid (stateCost + commission)
- `guideUrl`: URL to official guide or documentation
- `isGeneric`: Boolean indicating if this is a generic consultation option

**Behavior**:
- **Specific queries** (e.g., "richiedere SPID"): Returns 1-2 specific options plus generic consultation
- **Generic queries** (e.g., "concorsi pubblici"): Returns 2-3 common operations for that category, sorted by relevance/date, plus generic consultation
- **Generic consultation**: Always included as last option with `isGeneric: true`, has `stateCost: 0`, and includes disclaimer about additional costs

**Error Responses**:
- `400 Bad Request`: Missing or empty query
- `500 Internal Server Error`: Gemini API error

---

### 3. Create Booking

**Endpoint**: `POST /api/book`

**Description**: Creates a lead in the database and generates a PayPal payment link.

**Request Body**:
```json
{
  "nome_cognome": "Mario Rossi",
  "telefono": "+393331234567",
  "tipo_operazione": "Richiesta SPID con operatore",
  "totale_incassato": 22.00,
  "guida_url": "https://www.spid.gov.it/richiedi-spid"
}
```

**Response**:
```json
{
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "paymentUrl": "https://www.paypal.com/checkoutnow?token=..."
}
```

**Validation**:
- `telefono` must be in international format (e.g., `+393331234567`)
- All fields are required

**Error Responses**:
- `400 Bad Request`: Invalid phone format or missing fields
- `500 Internal Server Error`: Database or PayPal error

---

### 4. PayPal Webhook

**Endpoint**: `POST /api/webhook/paypal`

**Description**: Handles PayPal payment confirmation webhooks. Updates lead status and sends email notification to operator.

**Headers**:
- `paypal-transmission-id`: Transmission ID for verification
- `paypal-transmission-time`: Transmission time
- `paypal-transmission-sig`: Transmission signature
- `paypal-cert-url`: Certificate URL
- `paypal-auth-algo`: Authentication algorithm

**Request Body**: PayPal event payload

**Events Handled**:
- `CHECKOUT.ORDER.APPROVED`: Payment approved

**Response**:
```json
{
  "received": true
}
```

**Process Flow**:
1. Verify webhook signature
2. Extract lead ID from session metadata
3. Update lead status to "PAID"
4. Send email to operator with:
   - Customer name and phone
   - Operation type
   - Budget for state costs
   - Link to guide

**Error Responses**:
- `400 Bad Request`: Invalid signature or missing lead_id
- `404 Not Found`: Lead not found
- `500 Internal Server Error`: Processing error

---

### 4. Email Queue Statistics

**Endpoint**: `GET /api/email/stats`

**Description**: Get statistics about the email queue (pending, sent, failed).

**Response**:
```json
{
  "pending": 2,
  "sent": 15,
  "failed": 0
}
```

**Response Fields**:
- `pending`: Number of emails waiting to be sent
- `sent`: Number of successfully sent emails
- `failed`: Number of permanently failed emails (after max retries)

---

### 5. Process Email Queue

**Endpoint**: `POST /api/email/process`

**Description**: Manually trigger processing of pending emails in the queue. Useful for debugging or forcing immediate delivery.

**Response**:
```json
{
  "message": "Email queue processed",
  "sent": 3,
  "failed": 0,
  "pending": 1
}
```

**Response Fields**:
- `sent`: Number of emails successfully sent in this batch
- `failed`: Number of emails that failed permanently
- `pending`: Number of emails that failed but will be retried

**Note**: This endpoint is automatically triggered by a cron job every 5 minutes. Use this for manual intervention only.

---

### 6. Email System Health Check

**Endpoint**: `GET /api/email/health`

**Description**: Comprehensive health check for the email system. Validates configuration, checks environment variables, and reports queue statistics.

**Response** (Healthy):
```json
{
  "status": "healthy",
  "timestamp": "2026-01-26T11:00:00.000Z",
  "configuration": {
    "brevo_api_key": true,
    "brevo_sender_email": true,
    "operator_email": true
  },
  "validation": {
    "errors": [],
    "warnings": []
  },
  "queue_stats": {
    "pending": 0,
    "sent": 15,
    "failed": 0
  }
}
```

**Response** (Configuration Error):
```json
{
  "status": "error",
  "timestamp": "2026-01-26T11:00:00.000Z",
  "configuration": {
    "brevo_api_key": false,
    "brevo_sender_email": false,
    "operator_email": true
  },
  "validation": {
    "errors": [
      "BREVO_API_KEY is not configured",
      "BREVO_SENDER_EMAIL is not configured"
    ],
    "warnings": []
  },
  "queue_stats": {
    "pending": 5,
    "sent": 0,
    "failed": 2
  }
}
```

**Response Fields**:
- `status`: Overall health status (`healthy`, `warning`, or `error`)
- `timestamp`: Current server timestamp
- `configuration`: Boolean flags for each required environment variable
- `validation.errors`: Array of configuration errors that must be fixed
- `validation.warnings`: Array of non-critical warnings
- `queue_stats`: Current email queue statistics

**Status Values**:
- `healthy`: All configuration correct, no issues
- `warning`: Configuration OK but some warnings (e.g., high pending queue, some failed emails)
- `error`: Configuration errors that prevent email sending

**HTTP Status Codes**:
- `200 OK`: System is healthy or has warnings
- `500 Internal Server Error`: System has configuration errors

**Use Cases**:
- Verify email system setup before going live
- Monitor email system health in production
- Troubleshoot email delivery issues
- Check if environment variables are properly configured

---

## Data Models

### Lead (Database Schema)

```sql
CREATE TABLE lead_pratiche (
    id TEXT PRIMARY KEY,
    nome_cognome TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tipo_operazione TEXT,
    totale_incassato REAL,
    guida_url TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values**:
- `PENDING`: Lead created, payment not completed
- `PAID`: Payment successful, operator notified

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## CORS

The API allows requests from any origin with these headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Rate Limiting

Cloudflare Workers Free plan limits:
- 100,000 requests per day
- 10ms CPU time per request

For production use, consider upgrading to Cloudflare Workers Paid plan for higher limits.

---

## Security

### Environment Variables (Secrets)

The following secrets must be configured via `wrangler secret put`:

- `GEMINI_API_KEY`: Google Gemini API key
- `PAYPAL_CLIENT_ID`: PayPal Client ID
- `PAYPAL_CLIENT_SECRET`: PayPal Client Secret
- `PAYPAL_WEBHOOK_ID`: PayPal Webhook ID
- `PAYPAL_API_BASE`: PayPal API base URL
- `BREVO_API_KEY`: Brevo API key
- `BREVO_SENDER_EMAIL`: Verified sender email on Brevo
- `OPERATOR_EMAIL`: Operator email address for notifications

### Best Practices

1. Never expose secret keys in frontend code
2. Always verify PayPal webhook signatures
3. Validate and sanitize all user inputs
4. Use HTTPS in production
5. Monitor API usage and set up alerts
