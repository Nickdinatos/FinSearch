import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchFinancialInstrument = async (query: string): Promise<FinancialData> => {
  try {
    const prompt = `
      Agisci come un esperto analista finanziario. Cerca informazioni aggiornate sullo strumento finanziario: "${query}".
      
      REQUSITO FONDAMENTALE: 
      Tutti i prezzi e i valori monetari DEVONO essere espressi in EURO (€). Se lo strumento è quotato in un'altra valuta (es. USD), usa il tasso di cambio attuale per convertire prezzo, market cap, high/low, ecc.

      Ho bisogno che tu restituisca un UNICO oggetto JSON (senza testo colloquiale prima o dopo) che contenga i seguenti dati precisi trovati tramite Google Search.
      
      Struttura JSON richiesta:
      {
        "symbol": "Simbolo ticker (es. AAPL)",
        "name": "Nome completo azienda/asset",
        "price": numero (prezzo attuale convertito in EUR),
        "currency": "EUR",
        "change": numero (variazione assoluta oggi in EUR),
        "changePercent": numero (variazione percentuale oggi, es. 1.5 per +1.5%),
        "marketCap": "Stringa formattata in EUR (es. €2.5T)",
        "peRatio": "Stringa (es. 30.5 o N/A)",
        "dividendYield": "Stringa (es. 0.5% o N/A)",
        "high52Week": "Stringa prezzo in EUR",
        "low52Week": "Stringa prezzo in EUR",
        "volume": "Stringa volume",
        "description": "Una breve analisi comparativa e descrizione dello strumento in Italiano (max 300 caratteri).",
        "history": [Array di 30 oggetti { "date": "YYYY-MM-DD", "price": numero } che simulano l'andamento plausibile degli ultimi 30 giorni basandosi sul trend attuale trovato. I prezzi nell'array devono essere in EUR.]
      }

      IMPORTANTE:
      - Usa il tool googleSearch per trovare il prezzo ATTUALE, il tasso di cambio e le notizie recenti.
      - Restituisci SOLO il blocco JSON all'interno di un blocco di codice markdown json.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is NOT allowed with googleSearch, so we parse manually.
      },
    });

    const text = response.text || "";
    
    // Extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      console.error("Gemini Response:", text);
      throw new Error("Impossibile interpretare la risposta finanziaria.");
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    const data = JSON.parse(jsonString) as FinancialData;

    // Force currency label to EUR just in case
    data.currency = "EUR";

    // Extract sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: string[] = [];
    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }
    
    // Deduplicate sources and limit to 3
    data.sources = [...new Set(sources)].slice(0, 3);

    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};