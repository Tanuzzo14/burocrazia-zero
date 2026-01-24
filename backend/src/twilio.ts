import type { Env, Lead } from './types';

export async function sendSMSToOperator(lead: Lead, guideUrl: string, env: Env): Promise<void> {
  const message = `🔔 Nuova pratica pagata!

👤 Cliente: ${lead.nome_cognome}
📱 Telefono: ${lead.telefono}
📋 Operazione: ${lead.tipo_operazione}
💰 Budget per costi statali: €${(lead.totale_incassato - parseFloat(env.COMMISSION_AMOUNT)).toFixed(2)}

📖 Guida tecnica: ${guideUrl}

Contatta il cliente per richiedere i documenti e completare la pratica.`;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('From', env.TWILIO_PHONE_FROM);
  formData.append('To', env.OPERATOR_PHONE);
  formData.append('Body', message);

  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twilio error:', errorText);
    throw new Error(`Failed to send SMS message: ${response.statusText}`);
  }

  console.log('SMS notification sent to operator');
}
