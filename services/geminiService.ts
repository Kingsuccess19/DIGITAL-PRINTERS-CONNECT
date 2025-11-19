import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelNames, GroundingMetadata } from "../types";

// Ensure API Key is present (handled by environment in this context)
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Keep a reference to the chat session to maintain history
let chatSession: Chat | null = null;

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: ModelNames.Flash,
    config: {
      tools: [{ googleMaps: {} }],
      systemInstruction: `You are "Digital Printers Connect", an AI assistant dedicated to the digital printing industry. 
      Your persona is professional, technically proficient, yet accessible and friendly.
      
      You have expertise in:
      1. Digital Printing Technologies (Inkjet, Laser, 3D, Large Format, Sublimation).
      2. Troubleshooting common printing errors (color calibration, paper jams, driver issues).
      3. Design file preparation (CMYK vs RGB, bleed, resolution).
      4. Connecting users with printers, print shops, and suppliers worldwide using Google Maps.

      When asked to find printers, suppliers, or technicians, use the Google Maps tool to provide real-world locations.
      
      When answering, use clear formatting. Use bullet points for steps. 
      If asked about something outside of printing or technology, politely steer the conversation back to your expertise, 
      but you can answer general queries briefly.
      
      Always aim to be concise but thorough.`,
      temperature: 0.7,
    },
  });
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void,
  onMetadata?: (metadata: GroundingMetadata) => void
): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });
    
    let fullText = '';
    
    for await (const chunk of resultStream) {
      const responseChunk = chunk as GenerateContentResponse;
      
      // Check for text content
      const text = responseChunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }

      // Check for grounding metadata (Maps/Web results)
      if (responseChunk.candidates?.[0]?.groundingMetadata && onMetadata) {
        onMetadata(responseChunk.candidates[0].groundingMetadata as GroundingMetadata);
      }
    }
    
    return fullText;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const resetChat = () => {
  initializeChat();
};