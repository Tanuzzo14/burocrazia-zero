import type { Env, Lead } from './types';
import { queueEmail } from './emailQueue';

export async function sendEmailToOperator(lead: Lead, guideUrl: string, env: Env): Promise<void> {
  const message = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #2c3e50;">🔔 Nuova pratica pagata!</h2>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <p><strong>👤 Cliente:</strong> ${lead.nome_cognome}</p>
    <p><strong>📱 Telefono:</strong> ${lead.telefono}</p>
    <p><strong>📋 Operazione:</strong> ${lead.tipo_operazione}</p>
    <p><strong>💰 Budget per costi statali:</strong> €${(lead.totale_incassato - parseFloat(env.COMMISSION_AMOUNT)).toFixed(2)}</p>
  </div>
  
  <p><strong>📖 Guida tecnica:</strong> <a href="${guideUrl}" style="color: #3498db;">${guideUrl}</a></p>
  
  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
    Contatta il cliente su WhatsApp al numero indicato per richiedere i documenti e completare la pratica.
  </p>
</body>
</html>
`;

  const textMessage = `🔔 Nuova pratica pagata!

👤 Cliente: ${lead.nome_cognome}
📱 Telefono: ${lead.telefono}
📋 Operazione: ${lead.tipo_operazione}
💰 Budget per costi statali: €${(lead.totale_incassato - parseFloat(env.COMMISSION_AMOUNT)).toFixed(2)}

📖 Guida tecnica: ${guideUrl}

Contatta il cliente su WhatsApp per richiedere i documenti e completare la pratica.`;

  // Queue the email for reliable delivery with automatic retry
  await queueEmail({
    lead_id: lead.id,
    recipient_email: env.OPERATOR_EMAIL,
    recipient_name: 'Operatore',
    sender_email: env.BREVO_SENDER_EMAIL,
    sender_name: 'Burocrazia Zero',
    subject: `Nuova pratica: ${lead.tipo_operazione} - ${lead.nome_cognome}`,
    html_content: message,
    text_content: textMessage,
  }, env);

  console.log(`Email queued for lead ${lead.id} to ${env.OPERATOR_EMAIL}`);
}
