import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Env, GeminiResponse } from './types';

const GEMINI_SYSTEM_PROMPT = `Sei un consulente burocratico. Per ogni richiesta utente, identifica l'operazione e il costo della via più rapida (es. SPID con operatore = 12€). Rispondi in JSON: { "label": string, "costo_stato": number, "guida_url": string }. Se l'operazione è gratuita, costo_stato è 0.`;

export async function identifyOperation(userQuery: string, env: Env): Promise<GeminiResponse> {
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${GEMINI_SYSTEM_PROMPT}\n\nRichiesta utente: ${userQuery}\n\nRispondi solo con il JSON richiesto, senza testo aggiuntivo.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const parsedResponse: GeminiResponse = JSON.parse(jsonMatch[0]);
    
    // Validate response structure
    if (!parsedResponse.label || typeof parsedResponse.costo_stato !== 'number' || !parsedResponse.guida_url) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error identifying operation:', error);
    throw new Error('Failed to identify operation');
  }
}
