
import { GoogleGenAI } from "@google/genai";

export const getSmartReplySuggestion = async (context: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI Suggestion unavailable (API Key missing)";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful customer support agent. Based on the following conversation history, suggest a professional, concise, and empathetic response. 
      History:
      ${context}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });

    return response.text?.trim() || "I'm sorry, I couldn't generate a suggestion right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to get AI suggestion.";
  }
};
