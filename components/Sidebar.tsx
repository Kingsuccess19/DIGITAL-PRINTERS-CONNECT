import React from 'react';
import { X, Flag, MapPin, Globe, Award, MessageSquare, BrainCircuit, Palette, Search } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  isThinkingMode: boolean;
  onToggleThinking: () => void;
  isSearchEnabled: boolean;
  onToggleSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onAction, 
  isThinkingMode, 
  onToggleThinking,
  isSearchEnabled,
  onToggleSearch
}) => {
  const menuItems = [
    { 
      icon: Palette, 
      label: 'Generate Design AI', 
      action: 'CMD_GENERATE_IMAGE', 
      color: 'text-purple-400 group-hover:text-purple-300' 
    },
    { 
      icon: Flag, 
      label: 'Report Any Abuse', 
      action: 'I need to report abuse regarding this service.',
      color: 'text-red-400 group-hover:text-red-300'
    },
    { 
      icon: MapPin, 
      label: 'Get A Nearby Printer', 
      action: 'Find professional printing services near my current location.',
      color: 'text-cmyk-cyan group-hover:text-cyan-200'
    },
    { 
      icon: Globe, 
      label: 'Google Location', 
      action: 'Show my current location on Google Maps.',
      color: 'text-green-400 group-hover:text-green-300'
    },
    { 
      icon: Award, 
      label: 'Best Printing Company', 
      action: 'Who are the highest-rated printing companies worldwide?',
      color: 'text-cmyk-yellow group-hover:text-yellow-200'
    },
    { 
      icon: MessageSquare, 
      label: 'Comment', 
      action: 'I would like to leave a feedback comment.',
      color: 'text-cmyk-magenta group-hover:text-pink-300'
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
          <span className="font-bold text-slate-100 tracking-wide">Menu</span>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Section */}
        <div className="p-4 border-b border-slate-800/50 space-y-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Configuration</div>
            
            {/* Deep Thinking Toggle */}
            <button 
                onClick={onToggleThinking}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isThinkingMode ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isThinkingMode ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <BrainCircuit size={18} />
                    </div>
                    <div className="text-left">
                        <div className={`text-sm font-medium ${isThinkingMode ? 'text-indigo-300' : 'text-slate-300'}`}>Deep Thinking</div>
                        <div className="text-[10px] text-slate-500">Gemini 3.0 Pro</div>
                    </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isThinkingMode ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isThinkingMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: isThinkingMode ? '18px' : '2px' }}></div>
                </div>
            </button>

            {/* Search Grounding Toggle */}
            <button 
                onClick={onToggleSearch}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSearchEnabled ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSearchEnabled ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Search size={18} />
                    </div>
                    <div className="text-left">
                        <div className={`text-sm font-medium ${isSearchEnabled ? 'text-blue-300' : 'text-slate-300'}`}>Search Grounding</div>
                        <div className="text-[10px] text-slate-500">Google Search</div>
                    </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isSearchEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isSearchEnabled ? 'left-4.5' : 'left-0.5'}`} style={{ left: isSearchEnabled ? '18px' : '2px' }}></div>
                </div>
            </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-18rem)]">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                onAction(item.action);
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-300 hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all group text-left"
            >
              <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-slate-600 transition-colors ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-medium group-hover:text-white transition-colors">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-sm">
            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Developer Contact</div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-2">
              <div className="text-slate-300 font-bold">Success Ugbede Edoh</div>
              <div className="text-slate-500 flex flex-col gap-1">
                 <a href="tel:+2348138850702" className="hover:text-cmyk-cyan transition-colors">+234 813 885 0702</a>
                 <a href="tel:+2349020161602" className="hover:text-cmyk-cyan transition-colors">+234 902 016 1602</a>
              </div>
            </div>
        </div>
      </div>
    </>
  );
};