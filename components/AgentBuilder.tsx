import React, { useState } from 'react';
import XMarkIcon from './icons/XMarkIcon';
// FIX: Corrected import path for types
import type { Agent } from '../types';

interface AgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: Omit<Agent, 'id' | 'avatar'>) => void;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ isOpen, onClose, onAddAgent }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !systemInstruction) return;
    onAddAgent({ name, description, systemInstruction });
    setName('');
    setDescription('');
    setSystemInstruction('');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create New Agent</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="agent-name" className="block text-sm font-medium text-slate-300 mb-1">Agent Name</label>
            <input type="text" id="agent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Marketing Guru" className="w-full bg-slate-900 border border-slate-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div>
            <label htmlFor="agent-desc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <input type="text" id="agent-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Specializes in creating marketing copy." className="w-full bg-slate-900 border border-slate-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div>
            <label htmlFor="agent-prompt" className="block text-sm font-medium text-slate-300 mb-1">System Instruction</label>
            <textarea id="agent-prompt" value={systemInstruction} onChange={(e) => setSystemInstruction(e.target.value)} rows={5} placeholder="e.g., You are a witty and creative marketing expert..." className="w-full bg-slate-900 border border-slate-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
          </div>
        </div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-2xl">
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed" disabled={!name || !description || !systemInstruction}>
            Create Agent
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentBuilder;
