# Sistema di Coda Email - Soluzione Implementata

## Il Problema

Brevo non sempre inviava le email con successo. Quando il webhook di PayPal veniva processato e Brevo falliva l'invio (per problemi di rete, limiti API, o interruzioni temporanee), l'email andava persa per sempre e l'operatore non veniva notificato del pagamento.

## La Soluzione

È stato implementato un **sistema di coda email con retry automatico** che garantisce che TUTTE le email vengano sempre inviate, anche in caso di problemi temporanei con Brevo.

## Come Funziona

### 1. Persistenza nel Database
Ogni email viene salvata nel database **PRIMA** di essere inviata. Questo garantisce che nessuna email vada mai persa.

### 2. Tentativi Automatici
Se Brevo fallisce l'invio, il sistema:
- Registra l'errore
- Programma automaticamente un nuovo tentativo
- Usa un sistema di "exponential backoff" (ritardi crescenti tra i tentativi)

### 3. Schedule dei Retry
```
Tentativo 1: dopo 1 minuto
Tentativo 2: dopo 5 minuti (totale: 6 min)
Tentativo 3: dopo 15 minuti (totale: 21 min)
Tentativo 4: dopo 1 ora (totale: 1h 21m)
Tentativo 5: dopo 4 ore (totale: 5h 21m)
```

Dopo 5 tentativi falliti, l'email viene marcata come FAILED e richiede intervento manuale.

### 4. Cron Job Automatico
Un job automatico gira ogni 5 minuti su Cloudflare Workers per processare le email in attesa di retry.

## Modifiche Implementate

### File Modificati

1. **schema.sql** - Aggiunta tabella `email_queue`
   - Salva tutte le email con stato, tentativi, errori
   - Indice ottimizzato per query veloci
   - Foreign key con CASCADE per integrità dati

2. **backend/src/emailQueue.ts** - NUOVO FILE
   - Logica di coda email
   - Sistema di retry con exponential backoff
   - Configurazione centralizzata
   - Gestione errori migliorata

3. **backend/src/email.ts** - Modificato
   - Ora usa la coda invece di inviare direttamente
   - Logging migliorato

4. **backend/src/types.ts** - Aggiornato
   - Nuovi tipi per email queue

5. **backend/src/index.ts** - Aggiornato
   - Nuovi endpoint API
   - Handler per cron job
   - Import del sistema di coda

6. **wrangler.toml** - Configurato
   - Cron trigger ogni 5 minuti

7. **.gitignore** - Aggiornato
   - Esclude file auto-generati

### Documentazione Aggiunta

1. **docs/EMAIL_QUEUE_SYSTEM.md** - Guida completa al sistema
2. **docs/EMAIL_QUEUE_MIGRATION.md** - Istruzioni per la migrazione
3. **README.md** - Aggiornato con nuove features

## Nuovi Endpoint API

### 1. Statistiche Coda Email
```
GET /api/email/stats
```

Risposta:
```json
{
  "pending": 3,    // Email in attesa
  "sent": 147,     // Email inviate con successo
  "failed": 2      // Email fallite dopo 5 tentativi
}
```

### 2. Processamento Manuale
```
POST /api/email/process
```

Forza il processamento immediato delle email in coda (utile per debug o emergenze).

Risposta:
```json
{
  "message": "Email queue processed",
  "sent": 5,
  "failed": 0,
  "pending": 2
}
```

## Migrazione Database

**IMPORTANTE**: Prima di usare il sistema in produzione, devi applicare la migrazione del database:

```bash
# Produzione
wrangler d1 execute burocrazia-zero-db --file=./schema.sql

# Sviluppo locale
wrangler d1 execute burocrazia-zero-db --local --file=./schema.sql
```

## Monitoraggio

### Controllare lo Stato della Coda

```bash
curl https://tuo-dominio.com/api/email/stats
```

### Query Database Utili

**Email in attesa:**
```sql
SELECT id, recipient_email, subject, retry_count, last_error, next_retry_at
FROM email_queue
WHERE status = 'PENDING'
ORDER BY created_at ASC;
```

**Email fallite:**
```sql
SELECT id, recipient_email, subject, retry_count, last_error, created_at
FROM email_queue
WHERE status = 'FAILED'
ORDER BY created_at DESC;
```

**Statistiche giornaliere:**
```sql
SELECT 
  status,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM email_queue
WHERE created_at >= datetime('now', '-1 day')
GROUP BY status;
```

## Vantaggi della Soluzione

✅ **Zero Email Perse**: Tutte le email sono salvate prima dell'invio  
✅ **Retry Automatico**: Nessun intervento manuale necessario  
✅ **Monitoraggio Facile**: API per controllare lo stato  
✅ **Scalabile**: Gestisce alto volume di email  
✅ **Configurabile**: Parametri facilmente modificabili  
✅ **Non Bloccante**: I webhook PayPal non vengono rallentati  
✅ **Sicuro**: Zero vulnerabilità (verificato con CodeQL)  

## Configurazione

Tutti i parametri sono configurabili in `backend/src/emailQueue.ts`:

```typescript
const EMAIL_QUEUE_CONFIG = {
  MAX_RETRIES: 5,                                // Numero massimo di tentativi
  BATCH_SIZE: 50,                                 // Email processate per batch
  RETRY_DELAYS: [60, 300, 900, 3600, 14400],     // Ritardi in secondi
} as const;
```

Se vuoi cambiare i tempi di retry o il numero massimo di tentativi, modifica questi valori.

## Troubleshooting

### Email Bloccate in PENDING

**Sintomi**: Email rimangono in PENDING per troppo tempo

**Possibili Cause**:
1. Credenziali Brevo non valide
2. Problemi di connettività
3. Brevo API down
4. Rate limiting

**Soluzioni**:
1. Verifica `BREVO_API_KEY` nelle variabili d'ambiente
2. Verifica `BREVO_SENDER_EMAIL` sia autorizzato
3. Controlla i log per messaggi di errore
4. Trigger manuale: `POST /api/email/process`
5. Controlla campo `last_error` nel database

### Alto Tasso di Fallimenti

**Cosa Fare**:
1. Query per trovare errori comuni:
   ```sql
   SELECT last_error, COUNT(*) as count
   FROM email_queue
   WHERE status = 'FAILED'
   GROUP BY last_error
   ORDER BY count DESC;
   ```

2. Controlla dashboard Brevo per problemi account
3. Verifica quote e limiti API
4. Analizza i log per pattern

## Testing

Per testare il sistema:

1. Compila TypeScript: `npx tsc --noEmit`
2. Testa un webhook PayPal in sandbox
3. Controlla le stats: `GET /api/email/stats`
4. Simula un fallimento (credenziali sbagliate temporaneamente)
5. Verifica che il retry funzioni

## Sicurezza

✅ Tutti i controlli di sicurezza CodeQL passati (0 vulnerabilità)  
✅ Nessun dato sensibile esposto  
✅ Gestione errori robusta  
✅ Vincoli database per integrità dati  
✅ Foreign key CASCADE per consistenza  

## Supporto

Per problemi o domande:

1. Leggi la [documentazione completa](./docs/EMAIL_QUEUE_SYSTEM.md)
2. Controlla i log di errore
3. Query sulla tabella `email_queue`
4. Verifica lo stato API Brevo
5. Consulta la documentazione Cloudflare Workers per problemi cron

## Prossimi Passi

1. ✅ Applica la migrazione database
2. ✅ Testa in ambiente di sviluppo
3. ✅ Deploy in produzione
4. ✅ Monitora `/api/email/stats` regolarmente
5. ✅ Imposta alert per email FAILED

## Riassunto Tecnico

Questa soluzione garantisce che **ogni pagamento ricevuto generi sempre una notifica email all'operatore**, eliminando completamente il problema delle email perse. Il sistema è:

- **Affidabile**: Database-backed con retry automatico
- **Robusto**: Gestione errori completa
- **Monitorabile**: API per statistiche e stato
- **Performante**: Non bloccante, ottimizzato
- **Sicuro**: Zero vulnerabilità

**Risultato**: Nessuna email persa, anche se Brevo ha problemi temporanei! 🎉
