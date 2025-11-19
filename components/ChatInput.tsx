import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-2 rounded-3xl bg-slate-900/90 border border-slate-700/50 shadow-2xl backdrop-blur-md focus-within:border-cmyk-cyan/50 focus-within:ring-1 focus-within:ring-cmyk-cyan/20 transition-all duration-300"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find printers, troubleshooting, or specs..."
          className="w-full bg-transparent text-slate-200 placeholder-slate-500 text-base px-4 py-3 max-h-[120px] resize-none focus:outline-none scrollbar-hide rounded-2xl"
          rows={1}
          disabled={isLoading}
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`
            flex items-center justify-center w-12 h-12 rounded-2xl mb-1 mr-1 transition-all duration-200
            ${!input.trim() || isLoading 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-tr from-cmyk-cyan to-indigo-600 text-white shadow-lg hover:shadow-cmyk-cyan/25 hover:scale-105 active:scale-95'
            }
          `}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <SendHorizontal size={22} />}
        </button>
      </form>
      <div className="mt-4 text-center space-y-1">
        <div className="text-xs text-slate-400">
          Developed By <span className="text-cmyk-cyan font-medium">Success Ugbede Edoh</span>, from Abuja Nigeria
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Contact: +2348138850702, +2349020161602
        </div>
      </div>
    </div>
  );
};