import React from 'react';
// FIX: Corrected import path for types
import type { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer">
      <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden">
        {agent.avatar}
      </div>
      <div>
        <p className="font-semibold text-slate-200">{agent.name}</p>
        <p className="text-sm text-slate-400 truncate">{agent.description}</p>
      </div>
    </div>
  );
};

export default AgentCard;