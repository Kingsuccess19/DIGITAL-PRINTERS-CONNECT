import React, { useEffect, useState, useRef } from 'react';
import { Mic, X, Activity, Volume2 } from 'lucide-react';
import { connectLive } from '../services/geminiService';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'active' | 'error'>('connecting');
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    let session: any = null;

    if (isOpen) {
      setStatus('connecting');
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const startSession = async () => {
        try {
          session = await connectLive(
            () => setStatus('active'), // onOpen
            async (base64Audio) => { // onAudioData
                if (!audioContextRef.current) return;
                
                // Simple volume visualizer logic
                setVolume(Math.random() * 100); // Simulated for visual effect on incoming data
                setTimeout(() => setVolume(0), 200);

                // Decode and Play
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Custom PCM decoding to Float32
                const dataInt16 = new Int16Array(bytes.buffer);
                const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
                const channelData = buffer.getChannelData(0);
                for(let i=0; i<dataInt16.length; i++) {
                    channelData[i] = dataInt16[i] / 32768.0;
                }

                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContextRef.current.destination);
                
                const currentTime = audioContextRef.current.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                }
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
            },
            () => {
                setStatus('error');
                setTimeout(onClose, 2000);
            } // onClose
          );
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
      };
      
      startSession();
    }

    return () => {
      if (session) {
        // session.close() isn't directly exposed in the promise result easily in this simplified wrapper,
        // but generally we assume closing the modal stops the context which stops playback.
        // Ideally we'd call session.close() here.
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center text-center">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
            <X size={24} />
        </button>

        <div className="mb-8 relative">
            {/* Pulse Rings */}
            <div className={`absolute inset-0 rounded-full bg-cmyk-cyan/20 blur-xl transition-all duration-500 ${status === 'active' ? 'animate-pulse scale-150' : 'scale-100'}`}></div>
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                {status === 'connecting' && <Activity className="text-cmyk-yellow animate-spin" size={32} />}
                {status === 'active' && <Mic className={`text-cmyk-cyan transition-all duration-100`} size={32} style={{ transform: `scale(${1 + volume/100})` }} />}
                {status === 'error' && <Volume2 className="text-red-500" size={32} />}
            </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'connecting' && 'Establishing Connection...'}
            {status === 'active' && 'Live Voice Active'}
            {status === 'error' && 'Connection Failed'}
        </h2>
        <p className="text-slate-400 text-sm mb-8">
            {status === 'active' 
                ? "Speak naturally. I'm listening." 
                : "Connecting to Gemini Live Audio..."}
        </p>

        {status === 'active' && (
            <div className="flex gap-1 h-8 items-center justify-center">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1 bg-cmyk-magenta rounded-full transition-all duration-75"
                        style={{ 
                            height: `${Math.max(20, Math.random() * (volume + 20))}%`,
                            opacity: 0.5 + (volume/200)
                        }}
                    />
                ))}
            </div>
        )}
        
        <div className="mt-8 text-[10px] font-mono text-slate-500">
            Powered by Gemini 2.5 Native Audio
        </div>
      </div>
    </div>
  );
};
