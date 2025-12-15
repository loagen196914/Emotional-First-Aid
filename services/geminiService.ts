import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (modelName: string = 'gemini-2.5-flash', previousSummary: string = ''): Chat => {
  let instructions = SYSTEM_INSTRUCTION;
  if (previousSummary) {
    instructions += `\n\n[CONTEXT MEMORY]\nPrevious conversation summary: "${previousSummary}". \nUse this context to maintain continuity but focus on the current step of the protocol.`;
  }

  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: instructions,
      temperature: 0.7,
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  try {
    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const generateSummary = async (messages: Message[]): Promise<string> => {
  try {
    // Extract text content only
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Please summarize the following conversation into one single sentence capturing the user's core issue, emotional state, and current progress in the First Aid protocol. Output ONLY the sentence in Chinese. \n\nConversation:\n${conversationText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || '';
  } catch (error) {
    console.error("Failed to generate summary", error);
    return '';
  }
};