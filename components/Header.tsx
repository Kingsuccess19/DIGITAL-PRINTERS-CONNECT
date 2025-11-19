import React from 'react';
import { Printer, Sparkles, Menu, Mic } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onMenuClick: () => void;
  onLiveClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onMenuClick, onLiveClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center px-4 lg:px-8 justify-between">
      <div className="flex items-center gap-4">
        {/* Menu Button */}
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cmyk-cyan/50"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo Area */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onReset}>
          <div className="relative">
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
      </div>

      <div className="flex items-center gap-4">
        {/* Live Voice Button */}
        <button 
            onClick={onLiveClick}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
        >
            <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-white">Live Voice</span>
            <Mic size={12} className="text-slate-500 group-hover:text-white" />
        </button>

        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="text-slate-700">|</span>
          <span>Worldwide</span>
        </div>
      </div>
    </header>
  );
};
