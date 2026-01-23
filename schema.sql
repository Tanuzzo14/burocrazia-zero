CREATE TABLE lead_pratiche (
    id TEXT PRIMARY KEY,
    nome_cognome TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tipo_operazione TEXT,
    totale_incassato REAL,
    status TEXT DEFAULT 'PENDING', -- PENDING, PAID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);