# 📖 Guida Completa per Principianti - Burocrazia Zero

## 🎯 Benvenuto!

Questa guida è pensata per chi **non ha esperienza di programmazione**. Ti guideremo passo-passo per installare e mettere online l'applicazione Burocrazia-Zero. Non preoccuparti se alcuni termini ti sembrano strani: tutto verrà spiegato in modo semplice!

---

## 📋 Cosa faremo insieme

1. Creeremo gli account necessari (tutti gratuiti o con piani free)
2. Installeremo i programmi base sul tuo computer
3. Scaricheremo il codice dell'applicazione
4. Otterremo tutte le chiavi segrete necessarie
5. Configureremo tutto
6. Metteremo online l'applicazione

**Tempo stimato**: 2-3 ore (se è la prima volta)

---

## 🛠️ PARTE 1: Preparazione - Creare gli Account

Prima di iniziare, devi creare alcuni account (sono tutti gratuiti per iniziare):

### 1.1 GitHub (per il codice)

**Cos'è**: Un sito dove si conserva il codice dei programmi.

**Come fare**:
1. Vai su https://github.com
2. Clicca su "Sign up" (Registrati)
3. Inserisci email, password e nome utente
4. Conferma la tua email

✅ **Fatto!** Ora hai un account GitHub.

---

### 1.2 Cloudflare (per ospitare l'applicazione)

**Cos'è**: Un servizio che fa funzionare la tua applicazione su Internet 24/7.

**Come fare**:
1. Vai su https://dash.cloudflare.com/sign-up
2. Inserisci email e password
3. Verifica la tua email
4. Accedi alla Dashboard di Cloudflare
5. Nel menu a sinistra, clicca su **"Workers & Pages"**
6. Se ti chiede di scegliere un piano, seleziona **"Free"**

✅ **Fatto!** Cloudflare è pronto.

---

### 1.3 Google Cloud (per l'intelligenza artificiale)

**Cos'è**: Il servizio di Google che useremo per far capire all'AI cosa vuole l'utente.

**Come fare**:
1. Vai su https://console.cloud.google.com
2. Accedi con il tuo account Google (o creane uno)
3. Accetta i termini e condizioni
4. Nel menu in alto, clicca su "Select a project" → "New Project"
5. Dai un nome al progetto (es: "burocrazia-zero")
6. Clicca "Create"

**Ottenere la chiave API per Gemini**:
1. Vai su https://makersuite.google.com/app/apikey
2. Clicca su "Create API Key"
3. Seleziona il progetto che hai appena creato
4. Clicca "Create API key in existing project"
5. **COPIA QUESTA CHIAVE** e salvala in un file di testo (la userai dopo)
   - Sarà qualcosa tipo: `AIzaSyABCDEF123456789...`

✅ **Fatto!** Salva questa chiave come: `GEMINI_API_KEY`

---

### 1.4 Stripe (per i pagamenti)

**Cos'è**: Il sistema che gestisce i pagamenti con carta di credito.

**Come fare**:
1. Vai su https://dashboard.stripe.com/register
2. Inserisci email e password
3. Conferma la tua email
4. Completa il profilo base (puoi saltare i dettagli bancari per ora)

**Ottenere le chiavi API**:
1. Nella Dashboard di Stripe, clicca su **"Developers"** (in alto)
2. Clicca su **"API keys"**
3. Vedrai due chiavi:
   - **Publishable key** (inizia con `pk_test_...`) - NON ti serve
   - **Secret key** - Clicca su "Reveal test key" e **COPIALA**
4. **COPIA LA SECRET KEY** e salvala nel tuo file di testo
   - Sarà qualcosa tipo: `sk_test_ABC123...`

✅ **Fatto!** Salva questa chiave come: `STRIPE_SECRET_KEY`

📝 **NOTA**: Per ora useremo le chiavi di test. Più avanti, quando tutto funziona, potrai passare alle chiavi live per accettare pagamenti reali.

---

### 1.5 Twilio (per WhatsApp)

**Cos'è**: Il servizio che permette di inviare messaggi WhatsApp automatici.

**Come fare**:
1. Vai su https://www.twilio.com/try-twilio
2. Compila il form di registrazione
3. Verifica il tuo numero di telefono
4. Completa il questionario iniziale (scegli "Products" → "Messaging")

**Ottenere le chiavi**:
1. Nella Dashboard di Twilio, cerca la sezione **"Account Info"**
2. Troverai:
   - **Account SID** (inizia con `AC...`) - **COPIALO**
   - **Auth Token** - Clicca su "Show" e **COPIALO**
3. Salva entrambi nel tuo file di testo

✅ **Fatto!** Salva come:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

**Configurare WhatsApp**:
1. Nel menu di Twilio, vai su **"Messaging"** → **"Try it out"** → **"Send a WhatsApp message"**
2. Segui le istruzioni per attivare il Twilio Sandbox for WhatsApp
3. Ti verrà dato un numero WhatsApp tipo: `+1 415 523 8886`
4. **COPIA questo numero** nel formato: `whatsapp:+14155238886`

✅ **Fatto!** Salva come: `TWILIO_WHATSAPP_FROM`

---

### 1.6 Riepilogo Chiavi Raccolte

A questo punto dovresti avere in un file di testo:

```
GEMINI_API_KEY=AIzaSyABCDEF123456789...
STRIPE_SECRET_KEY=sk_test_ABC123...
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
OPERATOR_PHONE=whatsapp:+393331234567 (il TUO numero WhatsApp!)
```

⚠️ **IMPORTANTE**: Queste chiavi sono SEGRETE! Non condividerle MAI con nessuno e non pubblicarle online.

---

## 💻 PARTE 2: Installare i Programmi sul Computer

### 2.1 Installare Node.js

**Cos'è**: Un programma che serve per far funzionare il codice dell'applicazione.

**Come fare**:

**Su Windows**:
1. Vai su https://nodejs.org
2. Scarica la versione **LTS** (quella consigliata)
3. Apri il file scaricato e segui la procedura di installazione
4. Clicca sempre "Next" e alla fine "Finish"

**Su Mac**:
1. Vai su https://nodejs.org
2. Scarica la versione **LTS**
3. Apri il file .pkg e segui le istruzioni
4. Inserisci la password del Mac se richiesto

**Su Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install nodejs npm
```

**Verificare l'installazione**:
1. Apri il **Terminale** (su Mac/Linux) o il **Prompt dei comandi** (su Windows)
   - Su Windows: Premi `Win + R`, scrivi `cmd` e premi Invio
   - Su Mac: Cerca "Terminal" in Spotlight
2. Scrivi questo comando e premi Invio:
   ```bash
   node --version
   ```
3. Dovresti vedere qualcosa tipo: `v18.17.0` o superiore

✅ **Fatto!** Node.js è installato.

---

### 2.2 Installare Git

**Cos'è**: Un programma per scaricare e gestire il codice.

**Come fare**:

**Su Windows**:
1. Vai su https://git-scm.com/download/win
2. Scarica la versione per Windows
3. Apri il file e segui l'installazione (lascia tutte le opzioni di default)

**Su Mac**:
1. Apri il Terminale
2. Scrivi: `git --version`
3. Se Git non è installato, ti chiederà di installare Xcode Command Line Tools - accetta

**Su Linux**:
```bash
sudo apt update
sudo apt install git
```

**Verificare l'installazione**:
```bash
git --version
```

✅ **Fatto!** Git è installato.

---

## 📦 PARTE 3: Scaricare e Preparare il Codice

### 3.1 Scaricare il Codice

1. Apri il Terminale (Mac/Linux) o Prompt dei comandi (Windows)
2. Vai nella cartella dove vuoi mettere il progetto:
   ```bash
   cd Desktop
   ```
   (questo lo metterà sul Desktop - puoi scegliere un'altra cartella)

3. Scarica il codice:
   ```bash
   git clone https://github.com/Tanuzzo14/burocrazia-zero.git
   ```

4. Entra nella cartella del progetto:
   ```bash
   cd burocrazia-zero
   ```

✅ **Fatto!** Il codice è sul tuo computer.

---

### 3.2 Installare le Dipendenze

**Cos'è**: Sono dei "pezzi di codice" aggiuntivi che servono all'applicazione.

**Backend** (il "cervello" dell'app):
```bash
npm install
```

Aspetta che finisca (potrebbe volerci qualche minuto).

**Frontend** (l'interfaccia che vede l'utente):
```bash
cd frontend
npm install
cd ..
```

Aspetta ancora qualche minuto.

✅ **Fatto!** Tutte le dipendenze sono installate.

---

## 🔑 PARTE 4: Configurare il Database

### 4.1 Creare il Database su Cloudflare

1. Nel Terminale, scrivi:
   ```bash
   npx wrangler login
   ```

2. Si aprirà il browser - accedi con il tuo account Cloudflare

3. Torna al Terminale e crea il database:
   ```bash
   npx wrangler d1 create burocrazia-zero-db
   ```

4. Ti verrà mostrato un **database_id** (tipo: `4bf3015a-bc01-497a-ae31-72f9e72847f2`)
5. **COPIA QUESTO ID!**

---

### 4.2 Aggiornare il File di Configurazione

1. Apri il file `wrangler.toml` con un editor di testo (Blocco Note su Windows, TextEdit su Mac)
   - Il file si trova nella cartella `burocrazia-zero`

2. Cerca questa riga:
   ```
   database_id = "4bf3015a-bc01-497a-ae31-72f9e72847f2"
   ```

3. Sostituisci l'ID con quello che hai copiato prima

4. Salva il file

---

### 4.3 Creare le Tabelle nel Database

```bash
npx wrangler d1 execute burocrazia-zero-db --file=./schema.sql
```

Dovresti vedere un messaggio di successo.

✅ **Fatto!** Il database è pronto.

---

## 🔐 PARTE 5: Configurare le Chiavi Segrete

Ora useremo tutte quelle chiavi che abbiamo raccolto prima!

### 5.1 Configurare le Chiavi per lo Sviluppo Locale

1. Nella cartella del progetto, c'è un file chiamato `.dev.vars.example`
2. Copialo e chiamalo `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. Apri il file `.dev.vars` con un editor di testo

4. Sostituisci i valori di esempio con le tue chiavi vere:
   ```
   GEMINI_API_KEY=AIzaSy... (la tua vera chiave)
   STRIPE_SECRET_KEY=sk_test_... (la tua vera chiave)
   STRIPE_WEBHOOK_SECRET=whsec_... (lo configureremo dopo)
   TWILIO_ACCOUNT_SID=ACxxxx... (la tua vera chiave)
   TWILIO_AUTH_TOKEN=xxxx... (il tuo vero token)
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   OPERATOR_PHONE=whatsapp:+39333XXXXXXX (il TUO numero WhatsApp!)
   FRONTEND_URL=http://localhost:4200
   ```

5. Salva il file

⚠️ **IMPORTANTE**: Non condividere MAI questo file con nessuno!

---

### 5.2 Configurare le Chiavi per la Produzione

Per quando metterai online l'app, devi configurare le stesse chiavi su Cloudflare:

```bash
npx wrangler secret put GEMINI_API_KEY
```
(Ti chiederà di inserire la chiave - incollala e premi Invio)

Ripeti per tutte le altre chiavi:
```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_WHATSAPP_FROM
npx wrangler secret put OPERATOR_PHONE
```

📝 **NOTA**: La `STRIPE_WEBHOOK_SECRET` la configureremo dopo, quando avremo l'URL online.

✅ **Fatto!** Le chiavi sono configurate.

---

## 🚀 PARTE 6: Testare l'Applicazione sul Tuo Computer

Prima di mettere tutto online, testiamo che funzioni sul tuo computer!

### 6.1 Avviare il Backend

Apri un Terminale e:
```bash
cd burocrazia-zero
npm run dev:backend
```

Dovresti vedere:
```
⎔ Starting local server...
[wrangler] Ready on http://localhost:8787
```

✅ **Lascia questo Terminale APERTO!**

---

### 6.2 Avviare il Frontend

Apri un **SECONDO** Terminale (lascia l'altro aperto!) e:
```bash
cd burocrazia-zero
npm run dev:frontend
```

Dopo qualche secondo dovresti vedere:
```
** Angular Live Development Server is listening on localhost:4200 **
```

---

### 6.3 Testare l'Applicazione

1. Apri il browser e vai su: http://localhost:4200

2. Dovresti vedere l'applicazione Burocrazia-Zero!

3. Prova a:
   - Scrivere "voglio richiedere lo SPID" nella casella
   - Cliccare su "Identifica Operazione"
   - Vedere se il sistema riconosce correttamente la richiesta

4. Per fermare tutto:
   - Vai in ogni Terminale e premi `Ctrl + C` (su Windows) o `Cmd + C` (su Mac)

✅ **Fatto!** L'app funziona sul tuo computer!

---

## 🌍 PARTE 7: Mettere Online l'Applicazione

### 7.1 Deploy del Backend su Cloudflare Workers

1. Nel Terminale:
   ```bash
   npm run deploy:backend
   ```

2. Alla fine, ti darà un URL tipo:
   ```
   Published burocrazia-zero-worker
   https://burocrazia-zero-worker.your-username.workers.dev
   ```

3. **COPIA QUESTO URL!** Lo useremo dopo.

✅ **Fatto!** Il backend è online!

---

### 7.2 Configurare il Webhook di Stripe

Ora che abbiamo l'URL online, configuriamo Stripe:

1. Vai sulla Dashboard di Stripe: https://dashboard.stripe.com
2. Clicca su **"Developers"** → **"Webhooks"**
3. Clicca su **"Add endpoint"**
4. Inserisci l'URL:
   ```
   https://burocrazia-zero-worker.your-username.workers.dev/api/webhook/stripe
   ```
   (sostituisci con il TUO URL del backend)
5. Clicca su **"Select events"**
6. Cerca e seleziona: `checkout.session.completed`
7. Clicca **"Add endpoint"**
8. Clicca sull'endpoint appena creato
9. Nella sezione "Signing secret", clicca su **"Reveal"**
10. **COPIA questo valore** (inizia con `whsec_...`)

Ora configuralo come secret:
```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```
(Incolla il valore e premi Invio)

✅ **Fatto!** Stripe è configurato!

---

### 7.3 Configurare il Frontend per Produzione

1. Apri il file `frontend/src/app/api.service.ts`

2. Cerca questa riga (circa riga 10):
   ```typescript
   private apiUrl = 'http://localhost:8787/api';
   ```

3. Sostituiscila con il TUO URL:
   ```typescript
   private apiUrl = 'https://burocrazia-zero-worker.your-username.workers.dev/api';
   ```

4. Salva il file

---

### 7.4 Deploy del Frontend su Cloudflare Pages

**Opzione A: Via Dashboard (più facile)**

1. Fai il build del frontend:
   ```bash
   npm run build:frontend
   ```

2. Vai su https://dash.cloudflare.com
3. Clicca su **"Workers & Pages"** → **"Pages"**
4. Clicca **"Create application"** → **"Pages"**
5. Clicca **"Upload assets"**
6. Dai un nome al progetto: `burocrazia-zero`
7. Trascina la cartella `frontend/dist/frontend/browser` nella finestra
8. Clicca **"Deploy site"**

**Opzione B: Via GitHub (automatico)**

1. Fai il push del codice su GitHub (se non l'hai già fatto)
2. Vai su https://dash.cloudflare.com
3. Clicca su **"Workers & Pages"** → **"Pages"**
4. Clicca **"Create application"** → **"Pages"** → **"Connect to Git"**
5. Seleziona il repository `burocrazia-zero`
6. Configura:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist/frontend/browser`
7. Clicca **"Save and Deploy"**

✅ **Fatto!** Il frontend è online!

Ti verrà dato un URL tipo: `https://burocrazia-zero.pages.dev`

---

## ✅ PARTE 8: Test Finale

### 8.1 Testare il Flusso Completo

1. Vai sul tuo sito (l'URL di Cloudflare Pages)

2. Prova il flusso completo:
   - Descrivi un'operazione: "voglio richiedere lo SPID"
   - Clicca "Identifica Operazione"
   - Verifica che riconosca correttamente
   - Inserisci nome, cognome e telefono (formato internazionale: +393331234567)
   - Clicca "Prenota e Paga"
   - Usa una carta di test di Stripe: `4242 4242 4242 4242`
     - Data: qualsiasi data futura
     - CVC: qualsiasi 3 cifre
   - Completa il pagamento

3. Verifica che:
   - Vieni reindirizzato alla pagina di successo
   - L'operatore riceve un messaggio WhatsApp
   - Il lead è salvato nel database

### 8.2 Verificare il Database

```bash
npx wrangler d1 execute burocrazia-zero-db --command="SELECT * FROM lead_pratiche ORDER BY created_at DESC LIMIT 5"
```

Dovresti vedere i lead creati!

✅ **COMPLIMENTI!** L'applicazione è online e funzionante! 🎉

---

## 🔧 PARTE 9: Risoluzione Problemi Comuni

### Problema: "Node.js non è riconosciuto"

**Soluzione**: Chiudi e riapri il Terminale dopo aver installato Node.js

---

### Problema: "npx wrangler login" non funziona

**Soluzione**:
1. Assicurati di avere installato le dipendenze con `npm install`
2. Prova con: `npm install -g wrangler`
3. Poi riprova: `wrangler login`

---

### Problema: "Invalid webhook signature" su Stripe

**Soluzione**:
1. Verifica di aver configurato il `STRIPE_WEBHOOK_SECRET` correttamente
2. Assicurati che l'URL del webhook in Stripe punti al tuo worker online
3. Ricontrolla di aver selezionato l'evento giusto: `checkout.session.completed`

---

### Problema: "Failed to send WhatsApp message"

**Soluzione**:
1. Verifica che il numero operatore sia nel formato: `whatsapp:+393331234567`
2. Assicurati di aver attivato il Twilio Sandbox for WhatsApp
3. Verifica le credenziali Twilio

---

### Problema: "Gemini API non risponde"

**Soluzione**:
1. Controlla che la chiave API sia corretta
2. Verifica su https://makersuite.google.com che l'API key sia attiva
3. Controlla i limiti di quota del tuo account Google Cloud

---

### Problema: Il frontend non si collega al backend

**Soluzione**:
1. Verifica che l'URL in `api.service.ts` sia corretto
2. Controlla che il backend sia effettivamente online
3. Testa il backend direttamente: `curl https://your-worker-url.workers.dev/api/health`

---

## 📊 PARTE 10: Monitoraggio e Manutenzione

### Come vedere i log del backend

```bash
npx wrangler tail
```

Vedrai tutti i log in tempo reale!

---

### Come vedere i lead nel database

```bash
npx wrangler d1 execute burocrazia-zero-db --command="SELECT * FROM lead_pratiche ORDER BY created_at DESC LIMIT 10"
```

---

### Come aggiornare l'applicazione

Quando modifichi il codice:

**Backend**:
```bash
npm run deploy:backend
```

**Frontend**:
```bash
npm run build:frontend
```
Poi ricarica i file su Cloudflare Pages

---

## 💡 PARTE 11: Consigli e Best Practices

### Sicurezza
- ✅ Non condividere MAI le tue chiavi segrete
- ✅ Non committare (caricare su GitHub) il file `.dev.vars`
- ✅ Usa sempre HTTPS in produzione
- ✅ Controlla regolarmente i log per attività sospette

### Costi
- Il piano free di Cloudflare è sufficiente per ~1000 pratiche/mese
- Stripe prende 1.4% + €0.25 per transazione
- Twilio costa ~€0.005 per messaggio WhatsApp
- Monitora i costi nella dashboard di ogni servizio

### Backup
- Il database D1 è automaticamente replicato da Cloudflare
- Fai backup regolari:
  ```bash
  npx wrangler d1 export burocrazia-zero-db --output=backup.sql
  ```

---

## 🎓 Prossimi Passi

Ora che l'applicazione è online, potresti voler:

1. **Personalizzare il design**: Modifica i file in `frontend/src/app/`
2. **Aggiungere nuove operazioni**: Espandi il sistema in `backend/src/gemini.ts`
3. **Passare a produzione Stripe**: Cambia le chiavi da test a live
4. **Monitorare le performance**: Usa Cloudflare Analytics
5. **Aggiungere un dominio personalizzato**: Configura un dominio su Cloudflare Pages

---

## 📞 Hai Bisogno di Aiuto?

- 📖 Leggi la documentazione completa: [SETUP.md](./SETUP.md)
- 📚 API Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 🐛 Apri un issue su GitHub se trovi problemi
- 💬 Cerca aiuto nella community di Cloudflare

---

## 🎉 Conclusione

**COMPLIMENTI!** Hai installato e messo online un'applicazione completa con:
- Intelligenza Artificiale (Gemini)
- Pagamenti online (Stripe)
- Messaggistica WhatsApp (Twilio)
- Database cloud (Cloudflare D1)
- Frontend moderno (Angular)

Anche se non capisci niente di codice, hai fatto qualcosa di incredibile! 🚀

---

**Fatto con ❤️ per semplificare la burocrazia italiana**
