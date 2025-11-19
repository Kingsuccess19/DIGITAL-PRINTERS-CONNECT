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
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export enum ModelNames {
  Flash = 'gemini-2.5-flash',
}