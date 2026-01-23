// Types for the application
export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
  OPERATOR_PHONE: string;
  COMMISSION_AMOUNT: string;
  FRONTEND_URL?: string;
}

export interface GeminiResponse {
  label: string;
  costo_stato: number;
  guida_url: string;
}

export interface GeminiOption {
  label: string;
  costo_stato: number;
  guida_url: string;
  is_generic?: boolean;
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
