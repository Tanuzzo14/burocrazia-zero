# 📧 Guida alla Verifica del Sistema Email

Questa guida ti aiuta a **verificare che il sistema email sia configurato correttamente** e a risolvere eventuali problemi.

## ✅ Checklist di Configurazione

Prima di tutto, assicurati di aver completato questi passaggi:

### 1. Account Brevo Configurato

- [ ] Hai creato un account su [Brevo](https://www.brevo.com/)
- [ ] Hai generato una chiave API in **Settings → SMTP & API → API Keys**
- [ ] Hai copiato la chiave API (inizia con `xkeysib-...`)
- [ ] Hai aggiunto e verificato l'email mittente in **Senders**
- [ ] L'email mittente mostra lo stato "Verified" ✓

### 2. Variabili d'Ambiente Configurate su Cloudflare

Vai su **Cloudflare Dashboard → Workers & Pages → tuo worker → Settings → Variables**

Verifica che siano presenti TUTTE queste variabili (con "Encrypt" selezionato):

- [ ] `BREVO_API_KEY` - La chiave API di Brevo
- [ ] `BREVO_SENDER_EMAIL` - L'email mittente verificata (es: `noreply@tuodominio.com`)
- [ ] `OPERATOR_EMAIL` - L'email dove ricevi le notifiche (es: `tua-email@example.com`)

### 3. Database Configurato

- [ ] Il database D1 `burocrazia-zero-db` è stato creato
- [ ] La tabella `email_queue` esiste (vedi schema.sql)
- [ ] Il database è collegato al Worker (Settings → Bindings → D1 Database)

---

## 🔍 Verifica Automatica

### Passo 1: Controlla lo stato del sistema

Apri il browser e vai a:
```
https://TUO-WORKER.workers.dev/api/email/health
```

**Sostituisci `TUO-WORKER` con il nome del tuo worker Cloudflare.**

### Passo 2: Interpreta i risultati

#### ✅ Configurazione Corretta (Status: healthy)
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
    "sent": 0,
    "failed": 0
  }
}
```

**Tutto OK! Il sistema è pronto per inviare email.**

---

#### ⚠️ Configurazione con Avvisi (Status: warning)
```json
{
  "status": "warning",
  "validation": {
    "errors": [],
    "warnings": [
      "5 emails pending (high queue)",
      "2 emails permanently failed"
    ]
  }
}
```

**La configurazione è OK, ma ci sono problemi minori:**
- Se ci sono molte email pending, il cron job le invierà automaticamente
- Se ci sono email failed, controlla i log per capire perché

---

#### ❌ Configurazione Errata (Status: error)
```json
{
  "status": "error",
  "configuration": {
    "brevo_api_key": false,
    "brevo_sender_email": false,
    "operator_email": true
  },
  "validation": {
    "errors": [
      "BREVO_API_KEY is not configured",
      "BREVO_SENDER_EMAIL is not configured"
    ]
  }
}
```

**Ci sono problemi che DEVONO essere risolti:**
- Guarda l'array `errors` per vedere cosa manca
- Risolvi ogni errore seguendo le istruzioni sotto

---

## 🔧 Risolvere gli Errori

### Errore: "BREVO_API_KEY is not configured"

**Causa**: La chiave API di Brevo non è impostata nelle variabili d'ambiente.

**Soluzione**:
1. Vai su [Brevo Dashboard](https://app.brevo.com) → Settings → SMTP & API → API Keys
2. Se non hai una chiave, clicca "Create a new API key"
3. Copia la chiave (inizia con `xkeysib-...`)
4. Vai su Cloudflare Dashboard → Workers & Pages → tuo worker → Settings → Variables
5. Clicca "Add variable"
   - Variable name: `BREVO_API_KEY`
   - ✓ Encrypt
   - Value: incolla la chiave copiata
6. Clicca "Save and deploy"
7. Aspetta 1-2 minuti per il deploy
8. Ricarica `/api/email/health` per verificare

---

### Errore: "BREVO_SENDER_EMAIL is not configured"

**Causa**: L'email mittente non è impostata.

**Soluzione**:
1. Vai su Brevo Dashboard → Senders
2. Assicurati di aver aggiunto e verificato un indirizzo email
3. Copia l'indirizzo email verificato
4. Vai su Cloudflare Dashboard → Workers & Pages → tuo worker → Settings → Variables
5. Clicca "Add variable"
   - Variable name: `BREVO_SENDER_EMAIL`
   - ✓ Encrypt
   - Value: incolla l'email verificata
6. Clicca "Save and deploy"
7. Aspetta 1-2 minuti
8. Ricarica `/api/email/health`

---

### Errore: "BREVO_SENDER_EMAIL has invalid format"

**Causa**: L'email mittente non è in un formato valido.

**Soluzione**:
1. Vai su Cloudflare Dashboard → Workers & Pages → tuo worker → Settings → Variables
2. Trova `BREVO_SENDER_EMAIL`
3. Clicca "Edit"
4. Assicurati che il valore sia un indirizzo email valido (es: `noreply@tuodominio.com`)
5. Clicca "Save and deploy"

---

### Errore: "OPERATOR_EMAIL is not configured"

**Causa**: L'email dell'operatore non è impostata.

**Soluzione**:
1. Decidi quale email vuoi usare per ricevere le notifiche (può essere Gmail, Outlook, ecc.)
2. Vai su Cloudflare Dashboard → Workers & Pages → tuo worker → Settings → Variables
3. Clicca "Add variable"
   - Variable name: `OPERATOR_EMAIL`
   - ✓ Encrypt
   - Value: il tuo indirizzo email
4. Clicca "Save and deploy"
5. Aspetta 1-2 minuti
6. Ricarica `/api/email/health`

---

## 🧪 Test Manuale dell'Invio Email

Dopo aver risolto tutti gli errori, puoi testare manualmente l'invio:

### Passo 1: Attiva lo streaming dei log

1. Vai su Cloudflare Dashboard → Workers & Pages → tuo worker
2. Clicca su "Logs" nella barra laterale
3. Clicca "Begin log stream"
4. Lascia questa finestra aperta

### Passo 2: Crea un pagamento di test

1. Vai sul tuo sito frontend
2. Completa il flusso di prenotazione
3. Paga con PayPal Sandbox
4. Dopo il pagamento, torna ai log di Cloudflare

### Passo 3: Verifica i log

Dovresti vedere messaggi come:
```
Email queued for lead abc-123 to operator@example.com
Starting email queue processing...
Found 1 pending emails to process
Processing email 1/1: ID=xyz, Attempt=1/5
Attempting to send email via Brevo: ID=xyz, To=operator@example.com
✓ Email sent successfully: xyz to operator@example.com
Email queue processing complete: {"sent":1,"failed":0,"pending":0}
```

### Passo 4: Controlla la tua email

1. Vai nella casella di posta dell'email operatore
2. Controlla se è arrivata l'email di notifica
3. Se non la vedi:
   - Controlla la cartella SPAM
   - Verifica i log di Brevo: https://app.brevo.com/log
   - Controlla se ci sono errori nei log di Cloudflare

---

## 📊 Monitoraggio Continuo

### Controlla le statistiche della coda

Vai a:
```
https://TUO-WORKER.workers.dev/api/email/stats
```

Risposta esempio:
```json
{
  "pending": 0,
  "sent": 15,
  "failed": 0
}
```

**Interpretazione**:
- `pending`: Email in attesa di invio (normale se < 10)
- `sent`: Email inviate con successo ✓
- `failed`: Email permanentemente fallite (deve essere 0)

### Forza l'invio delle email pending

Se ci sono email in `pending`, puoi forzare l'invio:

```bash
curl -X POST https://TUO-WORKER.workers.dev/api/email/process
```

Risposta:
```json
{
  "message": "Email queue processed",
  "sent": 3,
  "failed": 0,
  "pending": 0
}
```

### Verifica il database

1. Vai su Cloudflare Dashboard → Workers & Pages → D1 SQL Database
2. Clicca su `burocrazia-zero-db`
3. Vai su Console
4. Esegui:
   ```sql
   SELECT id, recipient_email, status, retry_count, last_error, created_at, sent_at
   FROM email_queue
   ORDER BY created_at DESC
   LIMIT 10;
   ```

**Cosa cercare**:
- `status = 'SENT'` - Email inviate ✓
- `status = 'PENDING'` - Email in attesa
- `status = 'FAILED'` - Email fallite ✗

Se vedi email FAILED:
```sql
SELECT id, recipient_email, last_error, retry_count
FROM email_queue
WHERE status = 'FAILED';
```

Leggi il campo `last_error` per capire il problema.

---

## 📞 Hai Ancora Problemi?

### Controlla i log di Brevo

1. Vai su https://app.brevo.com/log
2. Cerca le email inviate recentemente
3. Controlla se ci sono errori o rifiuti

### Limiti del piano gratuito Brevo

Il piano gratuito include:
- 300 email al giorno (9.000 al mese)
- Se superi questo limite, le email falliranno

Controlla le quote su Brevo Dashboard → Settings → Plan.

### Verifica lo stato dell'account Brevo

- Assicurati che l'account Brevo sia attivo
- Verifica che non ci siano blocchi o sospensioni
- Controlla che la chiave API non sia stata disabilitata

---

## ✅ Checklist Finale

Prima di considerare il sistema funzionante, verifica:

- [ ] `/api/email/health` mostra `status: "healthy"`
- [ ] Tutte le configurazioni mostrano `true`
- [ ] Non ci sono errori nell'array `errors`
- [ ] Hai testato il flusso di pagamento end-to-end
- [ ] Hai ricevuto l'email di notifica nella tua casella
- [ ] `/api/email/stats` mostra almeno 1 email sent

**Se tutti questi check sono ✓, il sistema email funziona correttamente! 🎉**

---

## 📚 Risorse Aggiuntive

- [Documentazione Brevo API](https://developers.brevo.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [GUIDA_FACILE.md](./GUIDA_FACILE.md) - Setup completo step-by-step
- [docs/EMAIL_QUEUE_SYSTEM.md](./docs/EMAIL_QUEUE_SYSTEM.md) - Documentazione tecnica del sistema email
- [docs/SOLUZIONE_EMAIL_ITA.md](./docs/SOLUZIONE_EMAIL_ITA.md) - Spiegazione della soluzione implementata

---

**Creato per garantire il 100% di affidabilità del sistema email** 🚀
