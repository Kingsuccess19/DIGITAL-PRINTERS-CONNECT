
export enum Sender {
  User = 'user',
  Bot = 'bot'
}

export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string; placeAnswerSources?: any };
  }>;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isStreaming?: boolean;
  groundingMetadata?: GroundingMetadata;
  feedback?: 'up' | 'down';
  suggestions?: string[];
  image?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export enum ModelNames {
  Flash = 'gemini-2.5-flash',
  FlashLite = 'gemini-2.5-flash-lite-latest',
  ProThinking = 'gemini-3-pro-preview',
  TTS = 'gemini-2.5-flash-preview-tts',
  Live = 'gemini-2.5-flash-native-audio-preview-09-2025',
  Imagen = 'imagen-4.0-generate-001'
}
