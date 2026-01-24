# Burocrazia-Zero

Un'interfaccia "concierge" che permette all'utente di delegare pratiche statali. Il sistema identifica l'operazione tramite AI, incassa il pagamento (Commissione 10€ + Costi vivi statali) e mette in contatto l'utente con un operatore umano su WhatsApp per lo scambio documenti e l'esecuzione.

## 🎯 Visione del Prodotto

Burocrazia-Zero semplifica la gestione delle pratiche burocratiche italiane attraverso:
- **AI-powered**: Identifica automaticamente l'operazione richiesta tramite Gemini AI
- **Pagamento sicuro**: Integrazione con PayPal per pagamenti online
- **Zero storage documenti**: I documenti vengono gestiti tramite WhatsApp (crittografia end-to-end)
- **Operatore dedicato**: Contatto diretto con un operatore per completare la pratica

## 🏗️ Stack Tecnologico

- **Frontend**: Angular (v17+) su Cloudflare Pages
- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1
- **AI Engine**: Google Gemini 1.5 Flash
- **Pagamenti**: PayPal API
- **Notifiche**: Twilio API (WhatsApp)
- **Anti-Robot**: ALTCHA (proof-of-work challenge)


## 📋 Funzionalità

### Per l'Utente
1. Descrive l'operazione desiderata (es. "Richiedere lo SPID")
2. Il sistema identifica l'operazione e mostra i costi (costi statali + commissione €10)
3. Inserisce nome, cognome e numero di telefono
4. Effettua il pagamento tramite PayPal
5. Riceve un messaggio WhatsApp dall'operatore per completare la pratica

### Per l'Operatore
1. Riceve notifica WhatsApp quando un pagamento è completato
2. Ottiene informazioni sul cliente e sull'operazione da svolgere
3. Riceve il link alla guida tecnica per completare l'operazione
4. Contatta il cliente su WhatsApp per richiedere i documenti necessari

## 🚀 Quick Start

> 💡 **Sei alle prime armi?** Leggi la **[GUIDA_FACILE.md](./GUIDA_FACILE.md)** - una guida completa passo-passo per principianti!

### Prerequisiti
- Node.js 18+
- Account Cloudflare (Workers, D1, Pages)
- Account Google Cloud (per Gemini API)
- Account PayPal
- Account Twilio (con WhatsApp abilitato)

### Installazione

```bash
# Clone repository
git clone https://github.com/Tanuzzo14/burocrazia-zero.git
cd burocrazia-zero

# Installa dipendenze backend
npm install

# Installa dipendenze frontend
cd frontend
npm install
cd ..
```

### Setup Database

```bash
# Crea database D1
npx wrangler d1 create burocrazia-zero-db

# Esegui migrations
npx wrangler d1 execute burocrazia-zero-db --file=./schema.sql
```

### Configurazione Secrets

```bash
# Configura le chiavi API (una alla volta)
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put PAYPAL_CLIENT_ID
npx wrangler secret put PAYPAL_CLIENT_SECRET
npx wrangler secret put PAYPAL_WEBHOOK_ID
npx wrangler secret put PAYPAL_API_BASE
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_WHATSAPP_FROM
npx wrangler secret put OPERATOR_PHONE
```

### Sviluppo Locale

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Deploy in Produzione

```bash
# Deploy backend
npm run deploy:backend

# Build frontend
npm run build:frontend

# Deploy frontend su Cloudflare Pages
# (Connetti il repository dalla dashboard Cloudflare Pages)
```

## 📚 Documentazione

- **[GUIDA_FACILE.md](./GUIDA_FACILE.md)**: 🌟 **Guida per principianti** - Setup passo-passo per chi non ha esperienza di programmazione
- **[SETUP.md](./SETUP.md)**: Guida completa al setup e deployment
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Documentazione API endpoints
- **[CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md)**: Configurazione Cloudflare Pages
- **[docs/technical_specs.md](./docs/technical_specs.md)**: Specifiche tecniche dettagliate
- **[docs/ALTCHA_INTEGRATION.md](./docs/ALTCHA_INTEGRATION.md)**: Guida integrazione ALTCHA (anti-robot)

## 🗂️ Struttura Progetto

```
burocrazia-zero/
├── backend/
│   └── src/
│       ├── index.ts          # Entry point Worker
│       ├── gemini.ts         # Integrazione Gemini AI
│       ├── paypal.ts         # Integrazione PayPal
│       ├── twilio.ts         # Integrazione Twilio WhatsApp
│       ├── database.ts       # Operazioni D1 database
│       └── types.ts          # TypeScript types
├── frontend/
│   └── src/
│       └── app/
│           ├── api.service.ts              # Service per API calls
│           ├── app.component.ts            # Main component
│           └── pages/
│               ├── success/                # Pagina successo pagamento
│               └── cancel/                 # Pagina annullo pagamento
├── docs/
│   └── technical_specs.md    # Specifiche tecniche
├── schema.sql                # Schema database D1
├── wrangler.toml            # Configurazione Cloudflare Workers
└── package.json             # Dipendenze progetto
```

## 🔒 Privacy e Sicurezza

### Approccio Privacy-First
- **Dati minimi**: Salviamo solo nome, telefono, tipo operazione e importo
- **Zero storage documenti**: Documenti gestiti tramite WhatsApp (no server storage)
- **GDPR compliant**: Schema database ridotto al minimo necessario

### Sicurezza
- ✅ Validazione input utente (telefono internazionale)
- ✅ Verifica firma webhook PayPal
- ✅ Secrets gestiti via Cloudflare (no hardcoded)
- ✅ CORS configurato correttamente
- ✅ HTTPS obbligatorio in produzione
- ✅ Nessuna vulnerabilità rilevata da CodeQL
- ✅ Protezione anti-robot con ALTCHA (proof-of-work challenge)

## 💰 Costi Stimati

Con il piano Free/Starter:
- **Cloudflare Workers**: Gratis (primi 100k req/giorno)
- **Cloudflare D1**: Gratis (primi 5M righe lette/giorno)
- **Cloudflare Pages**: Gratis (illimitato)
- **Gemini API**: Free tier generoso
- **PayPal**: 3.4% + €0.35 per transazione europea
- **Twilio WhatsApp**: ~€0.005 per messaggio

**Totale**: Praticamente gratis fino a ~1000 pratiche/mese

## 🧪 Testing

```bash
# Test backend (TypeScript compilation)
npx tsc --noEmit

# Build frontend
cd frontend && npm run build

# Test frontend (unit tests)
cd frontend && npm test
```

## 📝 Licenza

ISC

## 👥 Contribuire

Le pull request sono benvenute. Per modifiche importanti, apri prima un issue per discutere cosa vorresti cambiare.

## 🆘 Supporto

Per domande o problemi:
1. Consulta la [documentazione](./SETUP.md)
2. Controlla le [API docs](./API_DOCUMENTATION.md)
3. Apri un issue su GitHub

---

**Fatto con ❤️ per semplificare la burocrazia italiana**
