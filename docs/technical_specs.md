# Documentazione Tecnica: Burocrazia-Zero (Versione Lean)

## 1. Visione del Prodotto

Un'interfaccia "concierge" che permette all'utente di delegare pratiche statali. Il sistema identifica l'operazione tramite AI, incassa il pagamento (Commissione 10€ + Costi vivi statali) e mette in contatto l'utente con un operatore umano su WhatsApp per lo scambio documenti e l'esecuzione.

## 2. Stack Tecnologico

* **Frontend:** Angular (v17+) su **Cloudflare Pages**.
* **Backend:** **Cloudflare Workers** (TypeScript).
* **Database:** **Cloudflare D1** (per log contatti e transazioni).
* **AI Engine:** **Gemini 1.5 Flash API**.
* **Pagamenti:** **PayPal API**.
* **Notifiche:** **Twilio API** (per invio WhatsApp all'operatore).

---

## 3. Flusso Operativo (Sequenza Tecnica)

### Fase 1: Identificazione (AI Layer)

1. L'utente descrive l'operazione nella barra di ricerca Angular.
2. Il Worker interroga Gemini con un prompt che impone la restituzione di:
* `nome_operazione`: String.
* `costo_statale_rapido`: Number (costo vivo per la procedura più veloce).
* `link_guida`: URL (istruzioni per l'operatore).


3. Angular mostra il riepilogo: **Costo Operazione + 10€ Commissione**.

### Fase 2: Raccolta Dati Lead & Pagamento

1. L'utente inserisce **Nome, Cognome e Numero di Telefono**.
2. Al click su "Prenota", il Worker esegue:
* **Salvataggio su D1:** Crea un record con i soli dati di contatto e lo stato `PENDING`.
* **PayPal Integration:** Genera un link di pagamento per l'importo totale.


3. L'utente viene reindirizzato al checkout.

### Fase 3: Webhook & Handover Operatore

1. PayPal invia un Webhook di conferma al Worker.
2. Il Worker aggiorna il record su D1 a `PAID`.
3. Il Worker attiva **Twilio** per inviare un WhatsApp all'operatore con:
* Identità dell'utente e numero di telefono.
* Budget incassato per i costi statali.
* Link alla guida tecnica per completare l'operazione.


4. **L'operatore avvia la chat WhatsApp con l'utente per richiedere le foto dei documenti (CIE/TS) e concludere la pratica.**

---

## 4. Schema Database (Cloudflare D1)

Il DB è ridotto ai minimi termini per la conformità privacy:

```sql
CREATE TABLE lead_pratiche (
    id TEXT PRIMARY KEY,
    nome_cognome TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tipo_operazione TEXT,
    totale_incassato REAL,
    status TEXT DEFAULT 'PENDING', -- PENDING, PAID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Specifiche per Gemini (System Prompt)

Lo sviluppatore dovrà configurare Gemini con questo set di istruzioni:

> *"Sei un consulente burocratico. Per ogni richiesta utente, identifica l'operazione e il costo della via più rapida (es. SPID con operatore = 12€). Rispondi in JSON: { 'label': string, 'costo_stato': number, 'guida_url': string }. Se l'operazione è gratuita, costo_stato è 0."*

---

## 6. Vantaggi della Gestione Documentale su WhatsApp

* **Zero Storage Risk:** Non salviamo documenti (CIE, firme, ISEE) sui nostri server. La responsabilità della gestione dati sensibili passa alla crittografia end-to-end di WhatsApp.
* **Semplicità Operativa:** L'operatore riceve i documenti in chat e può scaricarli direttamente sul PC dove effettua l'operazione statale.
* **Costi Cloud Azzerati:** Non serve Cloudflare R2 per lo storage, restando ampiamente nel piano Free.

---

## 7. Note per lo Sviluppatore

* **Angular:** Implementare la validazione del numero di telefono (formato internazionale) per evitare errori nei link `wa.me`.
* **Cloudflare:** Configurare le variabili d'ambiente segrete (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `GEMINI_API_KEY`, `TWILIO_AUTH`) tramite la dashboard Cloudflare per la sicurezza.
* **Error Handling:** Se il pagamento fallisce, il contatto deve restare nel DB come `PENDING` per permettere un eventuale ricontatto commerciale manuale.