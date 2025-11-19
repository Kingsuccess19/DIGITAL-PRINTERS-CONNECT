import React from 'react';
import { Printer, Sparkles } from 'lucide-react';

export const Header: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center px-4 lg:px-8 justify-between">
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer" onClick={onReset}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cmyk-cyan via-cmyk-magenta to-cmyk-yellow rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Printer className="text-white" size={20} />
            </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            Digital Printers <span className="text-transparent bg-clip-text bg-gradient-to-r from-cmyk-cyan to-cmyk-magenta">Connect</span>
          </h1>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <Sparkles size={10} className="text-cmyk-yellow" />
            <span>Interactive Intelligence</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            System Online
        </div>
        <span className="text-slate-700">|</span>
        <span>v2.5 Flash</span>
      </div>
    </header>
  );
};