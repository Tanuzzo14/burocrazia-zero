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

**Description**: Uses Gemini AI to identify the bureaucratic operation and estimate costs.

**Request Body**:
```json
{
  "query": "Richiedere lo SPID"
}
```

**Response**:
```json
{
  "operation": "Richiesta SPID con operatore",
  "stateCost": 12.00,
  "commission": 10.00,
  "totalCost": 22.00,
  "guideUrl": "https://www.spid.gov.it/richiedi-spid"
}
```

**Error Responses**:
- `400 Bad Request`: Missing or empty query
- `500 Internal Server Error`: Gemini API error

---

### 3. Create Booking

**Endpoint**: `POST /api/book`

**Description**: Creates a lead in the database and generates a Stripe payment link.

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
  "paymentUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Validation**:
- `telefono` must be in international format (e.g., `+393331234567`)
- All fields are required

**Error Responses**:
- `400 Bad Request`: Invalid phone format or missing fields
- `500 Internal Server Error`: Database or Stripe error

---

### 4. Stripe Webhook

**Endpoint**: `POST /api/webhook/stripe`

**Description**: Handles Stripe payment confirmation webhooks. Updates lead status and sends WhatsApp notification to operator.

**Headers**:
- `stripe-signature`: Webhook signature for verification

**Request Body**: Stripe event payload

**Events Handled**:
- `checkout.session.completed`: Payment successful

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
4. Send WhatsApp message to operator with:
   - Customer name and phone
   - Operation type
   - Budget for state costs
   - Link to guide

**Error Responses**:
- `400 Bad Request`: Invalid signature or missing lead_id
- `404 Not Found`: Lead not found
- `500 Internal Server Error`: Processing error

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
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_WHATSAPP_FROM`: Sender WhatsApp number (format: `whatsapp:+...`)
- `OPERATOR_PHONE`: Operator WhatsApp number (format: `whatsapp:+...`)

### Best Practices

1. Never expose secret keys in frontend code
2. Always verify Stripe webhook signatures
3. Validate and sanitize all user inputs
4. Use HTTPS in production
5. Monitor API usage and set up alerts
