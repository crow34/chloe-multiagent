
import React from 'react';
import ChloeIcon from './icons/ChloeIcon';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-slate-800 p-8">
      <div className="w-20 h-20 mb-6">
        <ChloeIcon />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Chloe AI</h1>
      <p className="text-slate-400 max-w-md">
        Your personal research assistant. Select an agent from the sidebar to start a new conversation or create your own custom agent.
      </p>
    </div>
  );
};

export default WelcomeScreen;
