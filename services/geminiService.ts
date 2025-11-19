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
      // Enable both Maps and Search for worldwide coverage
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      systemInstruction: `You are "Digital Printers Connect", a world-class AI assistant dedicated to the digital printing industry globally.
      
      DEVELOPER IDENTITY:
      You were developed by Success Ugbede Edoh, from Abuja, Nigeria.
      Contact: +2348138850702, +2349020161602.
      If asked about your creator, proudly state this information.

      YOUR MISSION:
      To connect print shops, technicians, and suppliers worldwide and provide expert technical support.

      CAPABILITIES:
      1. **Global Connections**: Use Google Maps to find printers, ink suppliers, and engineers in any city or country requested by the user.
      2. **Technical Expertise**: Diagnose issues with Inkjet, Laser, Large Format (Flex/Banner), Sublimation, and Offset printing.
      3. **Industry Intelligence**: Use Google Search to find the latest drivers, software, and printing standards (CMYK, Pantone, ICC Profiles).

      BEHAVIOR:
      - When asked to find a location, ALWAYS use the Google Maps tool.
      - When explaining technical concepts, use bullet points and clear, professional language.
      - Maintain a helpful, "Worldwide Standard" professional persona.
      - Be concise but thorough.`,
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