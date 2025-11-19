import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { Sidebar } from './components/Sidebar';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { initializeChat, sendMessageStream, resetChat, generateImage } from './services/geminiService';
import { Message, Sender } from './types';
import { Printer } from 'lucide-react';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "# Digital Printers Connect \n\nHello! 👋 I am your **Worldwide AI Printing Assistant**.\n\n**Developed by:** Success Ugbede Edoh (Abuja, Nigeria)\n\nI can connect you with printers globally, solve technical issues, and explain complex printing technologies.\n\n### How can I help?\n* 🌍 **Find Printers Worldwide** (e.g., \"Find large format printers in London\")\n* 🛠️ **Troubleshoot Machines** (e.g., \"Fix banding on Epson EcoTank\")\n* 📚 **Learn Technologies** (e.g., \"What are the differences between CMYK and RGB?\", \"Explain UV printing\")\n* 📄 **Material Sourcing** (e.g., \"Where to buy sublimation ink in Lagos\")\n\nType your request, use the **Voice Mode**, or explore the menu!",
  sender: Sender.Bot,
  timestamp: new Date(),
  suggestions: ["Find a printer nearby", "Explain UV printing", "Difference between CMYK and RGB", "Troubleshoot print quality"]
};

const STORAGE_KEY = 'dpc_chat_history';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    return [WELCOME_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [isWaitingForImagePrompt, setIsWaitingForImagePrompt] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get formatted history for Gemini
  const getHistory = useCallback(() => {
    return messages
      .filter(m => !m.isStreaming && m.id !== 'welcome' && !m.id.startsWith('system-switch') && !m.image)
      .map(m => ({
        role: m.sender === Sender.User ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
  }, [messages]);

  // Initialize Gemini on mount (Standard Mode) with History
  useEffect(() => {
    try {
      initializeChat(false, true, getHistory() as any);
    } catch (e) {
      console.error("Failed to init chat", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save History
  useEffect(() => {
    try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
       console.warn("LocalStorage limit reached, cannot save history.");
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleToggleThinking = () => {
    const newMode = !isThinkingMode;
    setIsThinkingMode(newMode);
    // Re-initialize chat with new model config, keeping history
    initializeChat(newMode, isSearchEnabled, getHistory() as any);
    setMessages(prev => [...prev, {
        id: 'system-switch-' + Date.now(),
        text: `***System Update: ${newMode ? 'Deep Thinking Mode (Gemini 3 Pro)' : 'Standard Mode (Gemini 2.5 Flash)'} Activated.***`,
        sender: Sender.Bot,
        timestamp: new Date()
    }]);
  };

  const handleToggleSearch = () => {
    const newMode = !isSearchEnabled;
    setIsSearchEnabled(newMode);
    // Re-initialize chat with new tool config, keeping history
    initializeChat(isThinkingMode, newMode, getHistory() as any);
    setMessages(prev => [...prev, {
        id: 'system-switch-' + Date.now(),
        text: `***System Update: Search Grounding ${newMode ? 'Enabled' : 'Disabled'}.***`,
        sender: Sender.Bot,
        timestamp: new Date()
    }]);
  };

  const handleFeedback = useCallback((messageId: string, type: 'up' | 'down') => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === messageId 
          ? { ...msg, feedback: type } 
          : msg
      )
    );
  }, []);

  const handleSend = useCallback(async (text: string, promptOverride?: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Check for Image Generation Mode
    if (isWaitingForImagePrompt) {
        setIsWaitingForImagePrompt(false);
        
        const botMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, {
             id: botMessageId,
             text: "Creating your printing design concept using Imagen... 🎨",
             sender: Sender.Bot,
             timestamp: new Date(),
             isStreaming: true
        }]);

        try {
            const base64Image = await generateImage(text);
            setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === botMessageId 
                    ? { 
                        ...msg, 
                        text: `Here is the generated visualization for: **"${text}"**`,
                        image: base64Image,
                        isStreaming: false
                      }
                    : msg
                )
            );
        } catch (error) {
             setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === botMessageId 
                    ? { 
                        ...msg, 
                        text: "Sorry, I encountered an issue generating the image. Please try again.",
                        isStreaming: false
                      }
                    : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // Normal Chat Flow
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
      const textToSend = promptOverride || text;

      await sendMessageStream(
        textToSend, 
        (chunk) => {
          accumulatedText += chunk;
          
          // Parse out the suggestions delimiter '~~~'
          const parts = accumulatedText.split('~~~');
          const mainText = parts[0].trim();
          // If we have a second part, we have suggestions
          const rawSuggestions = parts.length > 1 ? parts[1].split('|').filter(s => s.trim().length > 0) : [];

          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { 
                    ...msg, 
                    text: mainText, 
                    suggestions: rawSuggestions.length > 0 ? rawSuggestions : undefined 
                  }
                : msg
            )
          );
        },
        (metadata) => {
          // Handle grounding metadata (Maps/Search)
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
  }, [isWaitingForImagePrompt]);

  const handleMenuAction = useCallback((action: string) => {
    // Image Generation Trigger
    if (action === 'CMD_GENERATE_IMAGE') {
        setIsWaitingForImagePrompt(true);
        setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            text: "**Image Generation Mode Active** 🎨\n\nPlease describe the printing machinery, workshop layout, or design concept you would like me to visualize.",
            sender: Sender.Bot,
            timestamp: new Date(),
            suggestions: ["Futuristic printing press", "CMYK color explosion", "Technician repairing printer"]
        }]);
        return;
    }

    // Special handling for location-based actions
    if (action.includes("near my current location") || action.includes("Show my current location")) {
      setIsLoading(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const promptWithLocation = `[User Location Context: Latitude ${latitude}, Longitude ${longitude}]\n\n${action}`;
            setIsLoading(false);
            handleSend(action, promptWithLocation);
          },
          (error) => {
            console.warn("Geolocation access denied or failed", error);
            setIsLoading(false);
            handleSend(action);
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      } else {
        setIsLoading(false);
        handleSend(action);
      }
    } else {
      handleSend(action);
    }
  }, [handleSend]);

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    resetChat(isThinkingMode, isSearchEnabled);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cmyk-cyan/30 selection:text-cyan-100">
      <Header 
        onReset={handleReset} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onLiveClick={() => setIsLiveModalOpen(true)}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onAction={handleMenuAction}
        isThinkingMode={isThinkingMode}
        onToggleThinking={handleToggleThinking}
        isSearchEnabled={isSearchEnabled}
        onToggleSearch={handleToggleSearch}
      />

      <LiveVoiceModal 
        isOpen={isLiveModalOpen} 
        onClose={() => setIsLiveModalOpen(false)} 
      />
      
      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto pt-20 pb-4 px-4 scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
            
            {messages.length === 1 && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5 z-0">
                    <Printer size={400} className="text-slate-100" />
                 </div>
            )}

            <div className="relative z-10 space-y-2 pb-4">
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onFeedback={handleFeedback}
                  onSuggestionClick={(text) => handleSend(text)}
                />
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
        <ChatInput onSend={(text) => handleSend(text)} isLoading={isLoading} />
      </footer>

      {/* CMYK Decorative Lines */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/4 bg-cmyk-cyan"></div>
        <div className="h-full w-1/4 bg-cmyk-magenta"></div>
        <div className="h-full w-1/4 bg-cmyk-yellow"></div>
        <div className="h-full w-1/4 bg-cmyk-black"></div>
      </div>
    </div>
  );
}