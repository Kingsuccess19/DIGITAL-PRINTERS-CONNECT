import { GoogleGenAI, Chat, GenerateContentResponse, Modality, LiveServerMessage, Content } from "@google/genai";
import { ModelNames, GroundingMetadata } from "../types";

// Ensure API Key is present (handled by environment in this context)
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Keep a reference to the chat session
let chatSession: Chat | null = null;
let currentModel: string = ModelNames.Flash;

const SYSTEM_INSTRUCTION = `You are "Digital Printers Connect", a world-class AI assistant dedicated to the digital printing industry globally.
      
DEVELOPER IDENTITY:
You were developed by Success Ugbede Edoh, from Abuja, Nigeria.
Contact: +2348138850702, +2349020161602.
If asked about your creator, proudly state this information.

YOUR MISSION:
To connect print shops, technicians, and suppliers worldwide and provide expert technical support.

CAPABILITIES:
1. **Global Connections**: Use Google Maps to find printers, ink suppliers, and engineers in any city or country.
2. **Technical Expertise**: Diagnose issues with Inkjet, Laser, Large Format (Flex/Banner), Sublimation, and Offset printing.
3. **Industry Intelligence**: Use Google Search to find drivers, software, and standards.

BEHAVIOR:
- When asked to find a location, ALWAYS use the Google Maps tool.
- When explaining technical concepts, use bullet points.
- Maintain a helpful, "Worldwide Standard" professional persona.

FORMATTING RULES:
- Use Markdown for the body.
- At the VERY END of your response, provide 2 to 3 short, context-relevant follow-up questions or actions the user might want to take next.
- Separate the main response body and these suggestions with the delimiter "~~~".
- Separate individual suggestions with the delimiter "|".
- Example Output: 
  "Here is the solution to your printhead issue... [Main Answer Content]
  
  ~~~Check ink levels|Find a technician nearby|Buy replacement parts"
- Do NOT output the "~~~" if you cannot think of relevant suggestions, but try to provide them for most queries to keep the conversation going.`;

export const initializeChat = (
  useThinkingMode: boolean = false, 
  useSearch: boolean = true, 
  history?: Content[]
) => {
  const model = useThinkingMode ? ModelNames.ProThinking : ModelNames.Flash;
  currentModel = model;
  
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
  };

  // Thinking Mode Configuration
  if (useThinkingMode) {
    config.thinkingConfig = { thinkingBudget: 32768 }; // Max for Gemini 3 Pro
  } else {
    // Standard Mode uses Tools (Maps/Search)
    const tools: any[] = [{ googleMaps: {} }];
    
    if (useSearch) {
      tools.push({ googleSearch: {} });
    }

    config.tools = tools;
    config.temperature = 0.7;
  }

  chatSession = ai.chats.create({
    model: model,
    config: config,
    history: history,
  });
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void,
  onMetadata?: (metadata: GroundingMetadata) => void
): Promise<string> => {
  if (!chatSession) {
    initializeChat(false, true);
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

export const resetChat = (useThinkingMode: boolean = false, useSearch: boolean = true) => {
  initializeChat(useThinkingMode, useSearch);
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: ModelNames.Imagen,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image generated");
    }
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

// --- Text to Speech ---

export const playTTS = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
        model: ModelNames.TTS,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBuffer = await outputAudioContext.decodeAudioData(bytes.buffer);
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();

  } catch (e) {
    console.error("TTS Error:", e);
    throw e;
  }
};

// --- Live API (Real-time Voice) ---

export const connectLive = async (
    onOpen: () => void,
    onAudioData: (base64Audio: string) => void,
    onClose: () => void
) => {
  // Setup Audio Contexts
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  const sessionPromise = ai.live.connect({
      model: ModelNames.Live,
      callbacks: {
          onopen: () => {
              onOpen();
              // Stream microphone
              const source = inputAudioContext.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const l = inputData.length;
                  const int16 = new Int16Array(l);
                  for (let i = 0; i < l; i++) {
                      int16[i] = inputData[i] * 32768;
                  }
                  // Encode PCM to Base64
                  let binary = '';
                  const bytes = new Uint8Array(int16.buffer);
                  const len = bytes.byteLength;
                  for (let i = 0; i < len; i++) {
                      binary += String.fromCharCode(bytes[i]);
                  }
                  const base64Data = btoa(binary);

                  sessionPromise.then((session) => {
                      session.sendRealtimeInput({ 
                          media: { 
                              mimeType: 'audio/pcm;rate=16000', 
                              data: base64Data 
                          } 
                      });
                  });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: (msg: LiveServerMessage) => {
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
                 onAudioData(audioData);
             }
          },
          onclose: () => onClose(),
          onerror: (e) => {
              console.error("Live API Error", e);
              onClose();
          }
      },
      config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: SYSTEM_INSTRUCTION
      }
  });

  return sessionPromise;
};