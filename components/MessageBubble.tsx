import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender } from '../types';
import { User, Bot, MapPin, ExternalLink, Globe, Search } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;
  const hasMaps = message.groundingMetadata?.groundingChunks?.some(chunk => chunk.maps);
  const hasWeb = message.groundingMetadata?.groundingChunks?.some(chunk => chunk.web);

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

          <span className={`text-[10px] mt-2 opacity-60 block text-right ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};