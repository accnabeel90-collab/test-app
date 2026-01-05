
import { GoogleGenAI } from "@google/genai";
import { Transaction, SalesRep } from "../types";

export const getFinancialSummary = async (transactions: Transaction[], reps: SalesRep[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataContext = `
    Current transactions: ${JSON.stringify(transactions)}
    Current sales representatives status: ${JSON.stringify(reps)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `
        Analyze this financial data for a sales management system. 
        Provide a brief summary in Arabic (maximum 3 bullet points) regarding:
        1. Overall cash health.
        2. Any suspicious or high-spending representatives.
        3. A quick recommendation for the financial manager.
        Data Context: ${dataContext}
      `,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "تعذر الحصول على تحليل الذكاء الاصطناعي حالياً.";
  }
};
