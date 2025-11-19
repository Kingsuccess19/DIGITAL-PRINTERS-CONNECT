import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender } from '../types';
import { User, Bot, MapPin, ExternalLink, Globe, Search, ThumbsUp, ThumbsDown, Volume2, Loader2, Sparkles, Download } from 'lucide-react';
import { playTTS } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (messageId: string, type: 'up' | 'down') => void;
  onSuggestionClick?: (suggestion: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onFeedback, onSuggestionClick }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.sender === Sender.User;
  const hasMaps = message.groundingMetadata?.groundingChunks?.some(chunk => chunk.maps);
  const hasWeb = message.groundingMetadata?.groundingChunks?.some(chunk => chunk.web);

  const handleSpeak = async () => {
    if (isSpeaking || isUser) return;
    try {
        setIsSpeaking(true);
        await playTTS(message.text);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSpeaking(false);
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in-up`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gradient-to-br from-cmyk-cyan via-cmyk-magenta to-cmyk-yellow p-[2px]' 
        }`}>
           <div className={`w-full h-full rounded-full flex items-center justify-center ${!isUser ? 'bg-slate-900' : ''}`}>
             {isUser ? <User size={16} /> : <Bot size={16} className="text-white" />}
           </div>
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col px-5 py-3.5 shadow-xl
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
            : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm'
          }
        `}>
          <div className={`prose prose-invert prose-sm max-w-none leading-relaxed ${isUser ? 'text-white' : 'text-slate-200'}`}>
            <ReactMarkdown
               components={{
                code({className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <div className="rounded-md bg-slate-950 p-2 my-2 border border-slate-700 overflow-x-auto">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </div>
                  ) : (
                    <code className="bg-black/20 rounded px-1 py-0.5 text-cmyk-yellow font-mono text-xs" {...props}>
                      {children}
                    </code>
                  )
                },
                ul: ({children}) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
                a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cmyk-cyan hover:underline break-all">{children}</a>,
                strong: ({children}) => <strong className="font-bold text-cmyk-magenta">{children}</strong>
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          
          {/* Generated Image Display */}
          {message.image && (
            <div className="mt-3 relative group">
               <img 
                 src={message.image} 
                 alt="Generated content" 
                 className="rounded-xl shadow-lg border border-slate-700 w-full object-cover max-h-[400px]"
               />
               <a 
                 href={message.image} 
                 download={`generated-image-${message.id}.jpg`}
                 className="absolute bottom-2 right-2 p-2 bg-slate-900/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cmyk-cyan"
                 title="Download Image"
               >
                 <Download size={16} />
               </a>
            </div>
          )}

          {/* Grounding Sources (Maps & Web) */}
          {(hasMaps || hasWeb) && (
            <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-3">
              {/* Google Maps Results */}
              {hasMaps && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} />
                    Locations Found
                  </div>
                  <div className="grid gap-2">
                    {message.groundingMetadata?.groundingChunks?.map((chunk, i) => {
                      if (chunk.maps) {
                        return (
                          <a 
                            key={`map-${i}`} 
                            href={chunk.maps.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-cmyk-cyan/50 transition-all group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-cmyk-cyan shrink-0">
                                <MapPin size={14} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white truncate">
                                  {chunk.maps.title}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate">Google Maps</span>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-slate-500 group-hover:text-cmyk-cyan shrink-0" />
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Google Search Results */}
              {hasWeb && (
                <div>
                   <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Globe size={10} />
                    Web Sources
                  </div>
                  <div className="grid gap-2">
                    {message.groundingMetadata?.groundingChunks?.map((chunk, i) => {
                      if (chunk.web) {
                        return (
                          <a 
                            key={`web-${i}`} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-cmyk-magenta/50 transition-all group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-cmyk-magenta shrink-0">
                                <Search size={14} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white truncate">
                                  {chunk.web.title}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate">{new URL(chunk.web.uri).hostname}</span>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-slate-500 group-hover:text-cmyk-magenta shrink-0" />
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggested Actions */}
          {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
             <div className="mt-4 pt-3 border-t border-slate-700/30">
                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} className="text-cmyk-yellow" />
                    Suggested Actions
                </div>
                <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSuggestionClick?.(suggestion.trim())}
                            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-cmyk-cyan/50 hover:bg-slate-800 hover:text-cmyk-cyan text-xs font-medium text-slate-300 transition-all duration-200 active:scale-95 text-left"
                        >
                            {suggestion.trim()}
                        </button>
                    ))}
                </div>
             </div>
          )}

          {/* Feedback & TTS Controls (Bot Only) */}
          {!isUser && !message.isStreaming && (
             <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30 w-full">
                <button
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className={`p-1.5 rounded-full transition-all duration-200 focus:outline-none hover:bg-slate-700 text-slate-500 hover:text-cmyk-cyan ${isSpeaking ? 'animate-pulse text-cmyk-cyan' : ''}`}
                    title="Read Aloud"
                >
                    {isSpeaking ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mr-2 select-none">Helpful?</span>
                    <button
                        onClick={() => onFeedback?.(message.id, 'up')}
                        className={`p-1.5 rounded-full transition-all duration-200 focus:outline-none ${
                            message.feedback === 'up'
                                ? 'bg-green-500/20 text-green-400'
                                : 'hover:bg-slate-700 text-slate-500 hover:text-green-400'
                        }`}
                    >
                        <ThumbsUp size={14} />
                    </button>
                    <button
                        onClick={() => onFeedback?.(message.id, 'down')}
                        className={`p-1.5 rounded-full transition-all duration-200 focus:outline-none ${
                            message.feedback === 'down'
                                ? 'bg-red-500/20 text-red-400'
                                : 'hover:bg-slate-700 text-slate-500 hover:text-red-400'
                        }`}
                    >
                        <ThumbsDown size={14} />
                    </button>
                </div>
             </div>
          )}

          <span className={`text-[10px] mt-2 opacity-60 block text-right ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
