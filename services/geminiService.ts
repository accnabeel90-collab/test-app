
import { GoogleGenAI } from "@google/genai";
import { Transaction, SalesRep } from "../types";

export const getFinancialSummary = async (transactions: Transaction[], reps: SalesRep[]) => {
  // Create a new instance right before making an API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataContext = `
    Current transactions: ${JSON.stringify(transactions)}
    Current sales representatives status: ${JSON.stringify(reps)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        Analyze this financial data for a sales management system. 
        Provide a professional, deep financial summary in Arabic (maximum 4 bullet points) regarding:
        1. Overall cash health and liquidity.
        2. Performance of sales reps based on their collections vs payments.
        3. Identification of any risks (e.g., negative balances).
        4. Strategic recommendation for the financial manager to optimize cash flow.
        Data Context: ${dataContext}
      `,
      config: {
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      return "ERROR_KEY_NOT_FOUND";
    }
    return "تعذر الحصول على تحليل الذكاء الاصطناعي حالياً. يرجى التأكد من صلاحية مفتاح الـ API.";
  }
};
