CREATE TABLE lead_pratiche (
    id TEXT PRIMARY KEY,
    nome_cognome TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tipo_operazione TEXT,
    totale_incassato REAL,
    guida_url TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, PAID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email queue table for reliable email delivery with retry mechanism
CREATE TABLE email_queue (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    last_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    next_retry_at DATETIME,
    FOREIGN KEY (lead_id) REFERENCES lead_pratiche(id) ON DELETE CASCADE
);
