import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchFinancialInstrument = async (query: string): Promise<FinancialData> => {
  try {
    const prompt = `
      Agisci come un esperto analista finanziario senior di una banca d'investimento. 
      Analizza lo strumento finanziario: "${query}".
      
      REQUSITO FONDAMENTALE: 
      Tutti i prezzi e i valori monetari DEVONO essere espressi in EURO (€). Converti valute estere al cambio attuale.

      Restituisci un UNICO oggetto JSON con i seguenti dati precisi e un'analisi approfondita in Italiano.
      
      Struttura JSON richiesta:
      {
        "symbol": "Ticker (es. AAPL)",
        "name": "Nome Asset",
        "price": numero (prezzo attuale in EUR),
        "currency": "EUR",
        "change": numero (variazione oggi EUR),
        "changePercent": numero (variazione % oggi),
        "marketCap": "Stringa (es. €2.5T)",
        "peRatio": "Stringa (es. 30.5 o N/A)",
        "dividendYield": "Stringa (es. 0.5% o N/A)",
        "high52Week": "Stringa prezzo EUR",
        "low52Week": "Stringa prezzo EUR",
        "volume": "Stringa volume",
        "description": "Breve intro", 
        "analysis": {
           "overview": "Panoramica generale dell'asset: di cosa si occupa, settore, posizionamento competitivo.",
           "movements": "Analisi tecnica e fondamentale degli ultimi movimenti di mercato. Perché il prezzo sta cambiando? Ci sono notizie recenti (utili, trimestrali, eventi macro)?",
           "forecast": "Previsionale a breve/medio termine basato sul sentiment attuale e trend tecnici (Bullish/Bearish/Neutral) con motivazione."
        },
        "history": [Array di 30 oggetti { "date": "YYYY-MM-DD", "price": numero } simulando il trend reale recente in EUR.]
      }

      Usa il tool googleSearch per dati reali. Restituisci SOLO il JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      console.error("Gemini Response:", text);
      throw new Error("Impossibile interpretare la risposta finanziaria.");
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    const data = JSON.parse(jsonString) as FinancialData;

    data.currency = "EUR";

    // Fallback for analysis if model returns old format
    if (!data.analysis) {
        data.analysis = {
            overview: data.description || "N/A",
            movements: "Dati non disponibili per questa sezione.",
            forecast: "Dati non disponibili per questa sezione."
        };
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: string[] = [];
    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }
    
    data.sources = [...new Set(sources)].slice(0, 3);

    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};