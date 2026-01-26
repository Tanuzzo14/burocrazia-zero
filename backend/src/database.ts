import type { Env, Lead, CreateLeadRequest } from './types';

export async function createLead(data: CreateLeadRequest, env: Env, leadId?: string): Promise<Lead> {
  const id = leadId || crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO lead_pratiche (id, nome_cognome, telefono, tipo_operazione, totale_incassato, guida_url, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`
  )
    .bind(id, data.nome_cognome, data.telefono, data.tipo_operazione, data.totale_incassato, data.guida_url, now)
    .run();

  return {
    id,
    nome_cognome: data.nome_cognome,
    telefono: data.telefono,
    tipo_operazione: data.tipo_operazione,
    totale_incassato: data.totale_incassato,
    guida_url: data.guida_url,
    status: 'PENDING',
    created_at: now,
  };
}

export async function updateLeadStatus(id: string, status: 'PENDING' | 'PAID', env: Env): Promise<void> {
  await env.DB.prepare('UPDATE lead_pratiche SET status = ? WHERE id = ?')
    .bind(status, id)
    .run();
}

export async function getLeadById(id: string, env: Env): Promise<Lead | null> {
  const result = await env.DB.prepare('SELECT * FROM lead_pratiche WHERE id = ?')
    .bind(id)
    .first<Lead>();

  return result;
}
