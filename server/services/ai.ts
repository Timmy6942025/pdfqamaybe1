import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY not found. AI features may not work properly.');
}

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateResponse(question: string, context: string): Promise<string> {
    try {
      const prompt = `You are an AI assistant specialized in analyzing religious texts. You have been provided with relevant passages from a religious document to help answer the user's question.

Context from the religious text:
${context}

User Question: ${question}

Please provide a thoughtful, respectful, and informative response based on the provided context. If the context doesn't contain enough information to fully answer the question, acknowledge this and provide what insight you can. Focus on the theological, historical, or spiritual significance of the passages when relevant.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async summarizeChapter(content: string): Promise<string> {
    try {
      const prompt = `Please provide a concise summary of this religious text chapter, highlighting the main themes, key messages, and important passages:

${content}

Focus on the spiritual and theological significance of the content.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error summarizing chapter:', error);
      throw new Error('Failed to summarize chapter. Please try again.');
    }
  }

  async findThemes(content: string): Promise<string> {
    try {
      const prompt = `Analyze this religious text and identify the main themes, theological concepts, and spiritual messages:

${content}

Please list and explain the key themes found in this passage.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error finding themes:', error);
      throw new Error('Failed to analyze themes. Please try again.');
    }
  }
}

export const aiService = new AIService();
