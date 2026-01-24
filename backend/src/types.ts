// Types for the application
export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_WEBHOOK_ID: string;
  PAYPAL_API_BASE: string;
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  OPERATOR_EMAIL: string;
  COMMISSION_AMOUNT: string;
  FRONTEND_URL?: string;
}

export interface GeminiOption {
  label: string;
  costo_stato: number;
  guida_url: string;
  is_generic?: boolean;
  requires_caf?: boolean;
}

export interface GeminiMultipleResponse {
  options: GeminiOption[];
}

export interface Lead {
  id: string;
  nome_cognome: string;
  telefono: string;
  tipo_operazione: string;
  totale_incassato: number;
  guida_url: string;
  status: 'PENDING' | 'PAID';
  created_at: string;
}

export interface CreateLeadRequest {
  nome_cognome: string;
  telefono: string;
  tipo_operazione: string;
  totale_incassato: number;
  guida_url: string;
}

export interface EmailQueueItem {
  id: string;
  lead_id: string;
  recipient_email: string;
  recipient_name: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  html_content: string;
  text_content: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
  next_retry_at: string | null;
}

export interface CreateEmailRequest {
  lead_id: string;
  recipient_email: string;
  recipient_name: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  html_content: string;
  text_content: string;
}
