import React, { useState, useEffect } from 'react';
import GlobeAltIcon from './icons/GlobeAltIcon';
import XMarkIcon from './icons/XMarkIcon';

interface BrowserProps {
  thought: string;
  searchQuery: string;
  onClose: () => void;
}

const Browser: React.FC<BrowserProps> = ({ thought, searchQuery, onClose }) => {
  const [status, setStatus] = useState('Thinking...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const thinkingTimer = setTimeout(() => {
      setStatus(`Searching for "${searchQuery}"`);
    }, 2000); // Wait 2s before showing search

    const loadingTimer = setTimeout(() => {
        // In a real scenario, this would close when the API returns results.
        // Here we just simulate it.
        onClose();
    }, 4500); // Close after 4.5s total

    const dotsInterval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    
    return () => {
        clearTimeout(thinkingTimer);
        clearTimeout(loadingTimer);
        clearInterval(dotsInterval);
    };
  }, [searchQuery, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl h-96 border border-slate-700 flex flex-col">
        {/* Browser Chrome */}
        <div className="flex items-center justify-between p-2 bg-slate-900 rounded-t-lg border-b border-slate-700">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 mx-4">
                <div className="bg-slate-700/80 rounded-full px-4 py-1 text-sm text-slate-300 text-center truncate">
                    https://search.chloe.ai/{searchQuery.replace(/\s/g, '_')}
                </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 overflow-y-auto">
            <GlobeAltIcon className="w-16 h-16 text-indigo-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-white mb-2">{status}{dots}</h2>
            <p className="text-slate-400 max-w-md italic">"{thought}"</p>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default Browser;
