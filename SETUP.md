# Burocrazia-Zero - Setup e Deployment

## Prerequisiti

- Node.js 18 o superiore
- Account Cloudflare (per Workers e D1)
- Account Google Cloud (per Gemini API)
- Account PayPal (per pagamenti)
- Account Twilio (per WhatsApp)

## 1. Setup Backend (Cloudflare Workers)

### Installazione Dipendenze

```bash
npm install
```

### Configurazione Database D1

1. Crea un database D1 nella dashboard Cloudflare o via CLI:

```bash
npx wrangler d1 create burocrazia-zero-db
```

2. Aggiorna il `database_id` nel file `wrangler.toml` con l'ID restituito dal comando.

3. Esegui le migrations del database:

```bash
npx wrangler d1 execute burocrazia-zero-db --file=./schema.sql
```

### Configurazione Variabili d'Ambiente (Secrets)

Configura i seguenti secrets tramite Wrangler CLI:

```bash
# Google Gemini API Key
npx wrangler secret put GEMINI_API_KEY

# PayPal Client ID
npx wrangler secret put PAYPAL_CLIENT_ID

# PayPal Client Secret
npx wrangler secret put PAYPAL_CLIENT_SECRET

# PayPal Webhook ID (ottenuto dopo aver configurato il webhook)
npx wrangler secret put PAYPAL_WEBHOOK_ID

# PayPal API Base (sandbox o live)
npx wrangler secret put PAYPAL_API_BASE

# Twilio Account SID
npx wrangler secret put TWILIO_ACCOUNT_SID

# Twilio Auth Token
npx wrangler secret put TWILIO_AUTH_TOKEN

# Twilio WhatsApp From Number (formato: whatsapp:+1234567890)
npx wrangler secret put TWILIO_WHATSAPP_FROM

# Numero WhatsApp dell'operatore (formato: whatsapp:+1234567890)
npx wrangler secret put OPERATOR_PHONE

# URL del frontend (opzionale, default: https://burocrazia-zero.pages.dev)
npx wrangler secret put FRONTEND_URL
```

### Test in Locale

```bash
npm run dev:backend
```

Il worker sarà disponibile su `http://localhost:8787`

### Deploy in Produzione

```bash
npm run deploy:backend
```

### Configurazione Webhook PayPal

1. Dopo il deploy, ottieni l'URL del worker (es. `https://burocrazia-zero-worker.your-subdomain.workers.dev`)
2. Vai su PayPal Developer Dashboard → Apps & Credentials → Webhooks
3. Aggiungi un nuovo endpoint: `https://your-worker-url.workers.dev/api/webhook/paypal`
4. Seleziona gli eventi: `CHECKOUT.ORDER.APPROVED` e `PAYMENT.CAPTURE.COMPLETED`
5. Copia il Webhook ID e configuralo come secret:

```bash
npx wrangler secret put PAYPAL_WEBHOOK_ID
```

## 2. Setup Frontend (Angular)

### Installazione Dipendenze

```bash
cd frontend
npm install
```

### Configurazione API URL

Modifica il file `frontend/src/app/api.service.ts` e aggiorna la variabile `apiUrl` con l'URL del tuo worker in produzione:

```typescript
private apiUrl = 'https://your-worker-url.workers.dev/api';
```

### Test in Locale

```bash
npm run dev:frontend
```

L'applicazione sarà disponibile su `http://localhost:4200`

### Build per Produzione

```bash
npm run build:frontend
```

I file di build saranno generati in `frontend/dist/frontend/browser/`

## 3. Deploy Frontend su Cloudflare Pages

### Via Dashboard Cloudflare Pages

1. Vai su Cloudflare Dashboard → Pages
2. Crea un nuovo progetto
3. Connetti il repository GitHub
4. Configura:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist/frontend/browser`
   - **Root directory**: `/`

### Via Wrangler CLI

```bash
cd frontend/dist/frontend/browser
npx wrangler pages deploy . --project-name=burocrazia-zero
```

## 4. Ottenere le API Keys

### Google Gemini API

1. Vai su [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un nuovo progetto
3. Genera una API key
4. Copia la chiave e configurala come secret

### PayPal API

1. Vai su [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Vai su Apps & Credentials
3. Crea una nuova app REST API o usa quella di default
4. Copia il **Client ID** e il **Secret**
4. Configurala come secret

### Twilio WhatsApp

1. Vai su [Twilio Console](https://console.twilio.com/)
2. Attiva il servizio WhatsApp
3. Configura il Twilio Sandbox for WhatsApp
4. Ottieni:
   - Account SID
   - Auth Token
   - WhatsApp sender number (formato: `whatsapp:+14155238886`)
5. Configura come secrets

## 5. Testing del Sistema

### Test Flow Completo

1. Apri il frontend
2. Descrivi un'operazione (es. "Richiedere lo SPID")
3. Verifica che venga identificata correttamente
4. Inserisci i dati (nome e telefono in formato internazionale)
5. Clicca "Prenota e Paga"
6. Completa il pagamento su PayPal
7. Verifica che:
   - Il lead sia stato creato nel database D1
   - Lo status sia aggiornato a "PAID"
   - L'operatore riceva un messaggio WhatsApp

### Test degli Endpoint

```bash
# Health check
curl https://your-worker-url.workers.dev/api/health

# Test identificazione operazione
curl -X POST https://your-worker-url.workers.dev/api/identify \
  -H "Content-Type: application/json" \
  -d '{"query":"richiedere lo spid"}'
```

## 6. Monitoraggio e Logs

### Visualizzare i logs del Worker

```bash
npx wrangler tail
```

### Query Database D1

```bash
# Lista tutti i lead
npx wrangler d1 execute burocrazia-zero-db --command="SELECT * FROM lead_pratiche ORDER BY created_at DESC LIMIT 10"

# Conta lead per status
npx wrangler d1 execute burocrazia-zero-db --command="SELECT status, COUNT(*) as count FROM lead_pratiche GROUP BY status"
```

## 7. Troubleshooting

### Errore: "Invalid webhook signature"

- Verifica che il `PAYPAL_WEBHOOK_ID` sia configurato correttamente
- Assicurati che l'endpoint webhook in PayPal punti all'URL corretto

### Errore: "Failed to send WhatsApp message"

- Verifica le credenziali Twilio
- Assicurati che il numero operatore sia nel formato corretto (`whatsapp:+...`)
- Controlla che il Twilio Sandbox sia attivo

### Gemini non identifica correttamente le operazioni

- Verifica che la `GEMINI_API_KEY` sia valida
- Controlla i quota limits del tuo account Google Cloud
- Considera di ottimizzare il system prompt in `backend/src/gemini.ts`

## 8. Costi Stimati (Piano Free/Starter)

- **Cloudflare Workers**: Primo 100k richieste/giorno gratis
- **Cloudflare D1**: Primo 5M righe lette/giorno gratis
- **Cloudflare Pages**: Illimitato
- **Gemini API**: Free tier generoso
- **PayPal**: 3.4% + €0.35 per transazione europea
- **Twilio WhatsApp**: ~€0.005 per messaggio

**Totale**: Praticamente gratis fino a ~1000 pratiche/mese
