import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { initializeChat, sendMessageStream, resetChat } from './services/geminiService';
import { Message, Sender } from './types';
import { Printer } from 'lucide-react';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "# Hello! 👋\n\nI'm the **Digital Printers Connect AI**. \n\nI can help you with:\n* 🖨️ **Printer Troubleshooting**\n* 📍 **Finding Printers Worldwide** (with Google Maps)\n* 🎨 **Color Profiles & Calibration**\n* 🔍 **Industry Standards**\n\nHow can I assist your printing project today?",
  sender: Sender.Bot,
  timestamp: new Date(),
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini on mount
  useEffect(() => {
    try {
      initializeChat();
    } catch (e) {
      console.error("Failed to init chat", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder for the bot response
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      text: '',
      sender: Sender.Bot,
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages((prev) => [...prev, botMessagePlaceholder]);

    try {
      let accumulatedText = '';
      
      await sendMessageStream(
        text, 
        (chunk) => {
          accumulatedText += chunk;
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        },
        (metadata) => {
          // Handle grounding metadata (Maps)
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, groundingMetadata: metadata }
                : msg
            )
          );
        }
      );

      // Finalize message state
      setMessages((prev) => 
        prev.map((msg) => 
            msg.id === botMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (error) {
      console.error(error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, text: "Sorry, I encountered a connection error. Please try again.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    resetChat();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cmyk-cyan/30 selection:text-cyan-100">
      <Header onReset={handleReset} />
      
      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto pt-20 pb-4 px-4 scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
            
            {/* Empty State / Background Decoration if few messages */}
            {messages.length === 1 && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5 z-0">
                    <Printer size={400} className="text-slate-100" />
                 </div>
            )}

            <div className="relative z-10 space-y-2 pb-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                 <div className="animate-fade-in-up">
                    <TypingIndicator />
                 </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>
        </div>
      </main>

      {/* Footer Input Area */}
      <footer className="bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-10 pb-6 z-20">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </footer>

      {/* CMYK Decorative Lines at bottom */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/4 bg-cmyk-cyan"></div>
        <div className="h-full w-1/4 bg-cmyk-magenta"></div>
        <div className="h-full w-1/4 bg-cmyk-yellow"></div>
        <div className="h-full w-1/4 bg-cmyk-black"></div>
      </div>
    </div>
  );
}