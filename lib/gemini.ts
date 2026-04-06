import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiInstance: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!geminiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    geminiInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiInstance;
}

export function getGeminiModel() {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: 'gemini-1.5-flash' });
}
