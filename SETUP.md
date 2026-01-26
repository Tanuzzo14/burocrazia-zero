# Burocrazia-Zero - Setup e Deployment

## Prerequisiti

- Node.js 18 o superiore
- Account Cloudflare (per Workers e D1)
- Account Google Cloud (per Gemini API)
- Account PayPal (per pagamenti)
- Account Brevo (per notifiche email)

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

### Configurazione Variabili d'Ambiente

#### Variabili in wrangler.toml (vars)

Le seguenti variabili sono configurate nel file `wrangler.toml` nella sezione `[vars]` e devono essere aggiornate con i tuoi valori reali prima del deployment:

- `BREVO_SENDER_EMAIL`: Email mittente verificata su Brevo (es: noreply@tuodominio.com)
- `OPERATOR_EMAIL`: Email operatore per ricevere le notifiche (es: operator@example.com)
- `COMMISSION_AMOUNT`: Importo commissione in EUR (default: "10")

**IMPORTANTE**: Aggiorna questi valori nel file `wrangler.toml` con i tuoi indirizzi email reali prima di fare il deploy.

#### Secrets

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

# Brevo API Key
npx wrangler secret put BREVO_API_KEY

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

### Brevo Email

1. Vai su [Brevo](https://www.brevo.com/)
2. Crea un account gratuito
3. Vai su **Settings** → **SMTP & API**
4. Nella sezione **API Keys**, clicca **"Create a new API key"**
5. Dai un nome alla chiave (es: "burocrazia-zero")
6. Copia la chiave API (inizia con `xkeysib-`)
7. In **Senders**, aggiungi e verifica l'email mittente
8. Configura:
   - `BREVO_API_KEY`: La chiave API (configurala come secret)
   - `BREVO_SENDER_EMAIL`: L'email mittente verificata (aggiornala in `wrangler.toml`)
   - `OPERATOR_EMAIL`: L'email dove ricevere le notifiche (aggiornala in `wrangler.toml`)

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
   - L'operatore riceva un'email con i dettagli della pratica

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

### Errore: "Failed to send email via Brevo"

- Verifica che la chiave API di Brevo (`BREVO_API_KEY`) sia corretta
- Assicurati che l'email mittente (`BREVO_SENDER_EMAIL`) sia stata verificata su Brevo
- Controlla che l'email operatore (`OPERATOR_EMAIL`) sia valida
- Verifica i log di Brevo: https://app.brevo.com/log

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
- **Brevo Email**: 300 email/giorno gratis (9.000/mese)

**Totale**: Praticamente gratis fino a ~1000 pratiche/mese
