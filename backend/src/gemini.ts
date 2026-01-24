import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Env, GeminiMultipleResponse, GeminiOption } from './types';

const GEMINI_SYSTEM_PROMPT = `Sei un consulente burocratico. Per ogni richiesta utente, identifica le possibili operazioni richieste. 

Se la richiesta è SPECIFICA (es. "richiedere SPID", "rinnovare carta d'identità"), restituisci 1-2 opzioni concrete.

Se la richiesta è GENERICA (es. "concorsi pubblici", "documenti per viaggio"), restituisci 2-3 opzioni specifiche comuni per quella categoria, ordinate per data/urgenza quando rilevante.

SEMPRE includi come ultima opzione una "Consulenza Generica" con costo_stato: 0 e guida_url: "#consulenza-generica".

Per ogni operazione, determina se richiede assistenza da CAF (Centro di Assistenza Fiscale) o Patronato. Imposta "requires_caf" a true se l'operazione richiede assistenza fisica presso un CAF o Patronato (es. pratiche fiscali complesse, 730, ISEE, pensioni, disoccupazione, bonus fiscali). Imposta "requires_caf" a false se l'operazione può essere svolta interamente online o presso altri uffici.

Rispondi in JSON:
{
  "options": [
    { "label": string, "costo_stato": number, "guida_url": string, "requires_caf": boolean },
    { "label": string, "costo_stato": number, "guida_url": string, "requires_caf": boolean },
    { "label": "Consulenza Generica - Costi aggiuntivi in base all'operazione", "costo_stato": 0, "guida_url": "#consulenza-generica", "is_generic": true, "requires_caf": false }
  ]
}

Se l'operazione è gratuita, costo_stato è 0.`;

export async function identifyOperation(userQuery: string, env: Env): Promise<GeminiMultipleResponse> {
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${GEMINI_SYSTEM_PROMPT}\n\nRichiesta utente: ${userQuery}\n\nRispondi solo con il JSON richiesto, senza testo aggiuntivo.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response - look for object with "options" array
    const jsonMatch = text.match(/\{[\s\S]*"options"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const parsedResponse: GeminiMultipleResponse = JSON.parse(jsonMatch[0]);
    
    // Validate response structure
    if (!parsedResponse.options || !Array.isArray(parsedResponse.options) || parsedResponse.options.length === 0) {
      throw new Error('Invalid response structure from Gemini - options array required');
    }
    
    // Validate each option
    for (const option of parsedResponse.options) {
      if (!option.label || typeof option.costo_stato !== 'number' || !option.guida_url) {
        throw new Error('Invalid option structure from Gemini');
      }
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error identifying operation:', error);
    throw new Error('Failed to identify operation');
  }
}
