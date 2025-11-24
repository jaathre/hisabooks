import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, TransactionType } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSpendingInsight = async (
  transactions: Transaction[],
  categories: Category[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Unable to access AI service. Please check API Key configuration.";

  // Prepare a minimized version of data to save tokens
  const recentTransactions = transactions
    .slice(0, 50) // Analyze last 50 transactions
    .map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return `${t.date}: ${t.description} (${cat?.name || 'Unknown'}) - $${t.amount} [${t.type}]`;
    })
    .join('\n');

  const prompt = `
    You are a financial assistant. Analyze the following list of recent transactions.
    
    Data:
    ${recentTransactions}

    Please provide a brief, friendly, and actionable summary in 3 bullet points.
    Focus on:
    1. Spending trends.
    2. Unusual expenses (if any).
    3. One tip for saving money based on this data.

    Keep it under 150 words total. Do not use markdown bolding too heavily.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Sorry, I couldn't generate insights right now. Please try again later.";
  }
};