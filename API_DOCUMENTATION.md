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

**Description**: Handles PayPal payment confirmation webhooks. Updates lead status and sends WhatsApp notification to operator.

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
- `PAYPAL_CLIENT_ID`: PayPal Client ID
- `PAYPAL_CLIENT_SECRET`: PayPal Client Secret
- `PAYPAL_WEBHOOK_ID`: PayPal Webhook ID
- `PAYPAL_API_BASE`: PayPal API base URL
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_WHATSAPP_FROM`: Sender WhatsApp number (format: `whatsapp:+...`)
- `OPERATOR_PHONE`: Operator WhatsApp number (format: `whatsapp:+...`)

### Best Practices

1. Never expose secret keys in frontend code
2. Always verify PayPal webhook signatures
3. Validate and sanitize all user inputs
4. Use HTTPS in production
5. Monitor API usage and set up alerts
