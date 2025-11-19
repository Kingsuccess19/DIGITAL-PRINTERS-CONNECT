import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-4 bg-slate-900 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl max-w-[100px] border border-slate-800">
      <div className="w-2 h-2 bg-cmyk-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-cmyk-magenta rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-cmyk-yellow rounded-full animate-bounce"></div>
    </div>
  );
};