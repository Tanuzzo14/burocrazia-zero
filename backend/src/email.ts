import type { Env, Lead } from './types';

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

  const emailData = {
    sender: {
      name: "Burocrazia Zero",
      email: env.BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: env.OPERATOR_EMAIL,
        name: "Operatore"
      }
    ],
    subject: `Nuova pratica: ${lead.tipo_operazione} - ${lead.nome_cognome}`,
    htmlContent: message,
    textContent: textMessage
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API error:', errorText);
    throw new Error(`Failed to send email via Brevo: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Email notification sent to operator via Brevo:', result);
}
