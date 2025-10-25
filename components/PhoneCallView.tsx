
import React, { useEffect, useState } from 'react';
import PhoneIcon from './icons/PhoneIcon';
import type { Agent } from '../types';

interface PhoneCallViewProps {
  onHangup: () => void;
  transcription: string;
  agent: Agent | null;
}

const PhoneCallView: React.FC<PhoneCallViewProps> = ({ onHangup, transcription, agent }) => {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-slate-600 shadow-lg">
          {agent?.avatar || <div className="w-full h-full bg-slate-700"></div>}
        </div>
        <h2 className="text-3xl font-bold text-white mt-4">{agent?.name || 'Assistant'}</h2>
        <p className="text-slate-400 mt-1">Live Call - {formatDuration(callDuration)}</p>
      </div>

      <div className="my-8 p-6 bg-slate-800/50 rounded-lg w-full max-w-2xl min-h-[120px] text-center flex items-center justify-center">
        <p className="text-xl text-slate-200 transition-all duration-300">
            {transcription || <span className="text-slate-500">Listening...</span>}
        </p>
      </div>

      <button
        onClick={onHangup}
        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
        aria-label="Hang up call"
      >
        <PhoneIcon className="w-8 h-8 text-white transform rotate-[135deg]" />
      </button>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default PhoneCallView;
