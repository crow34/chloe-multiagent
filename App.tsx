import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Agent, ChatMessage, ChatMessagePart, Integration, User } from './types';
import { INITIAL_AGENTS, INITIAL_INTEGRATIONS, USER_AGENT } from './constants';
import { useAuth } from './hooks/useAuth';
import { useAgentMemory } from './hooks/useAgentMemory';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { useGeolocation } from './hooks/useGeolocation';
import * as geminiService from './services/geminiService';

// Components
import LoginScreen from './components/auth/LoginScreen';
import ChatInterface from './components/ChatInterface';
import Settings from './components/Settings';
import AgentBuilder from './components/AgentBuilder';
import Browser from './components/Browser';
import Bars3Icon from './components/icons/Bars3Icon';
import AgentCard from './components/AgentCard';
import PlusIcon from './components/icons/PlusIcon';
import CogIcon from './components/icons/CogIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import UserIcon from './components/icons/UserIcon';
import ChloeIcon from './components/icons/ChloeIcon';

// Sidebar component defined inside App.tsx to avoid creating new files
interface SidebarProps {
  user: User;
  agents: Agent[];
  activeAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onNewAgent: () => void;
  onSettings: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, agents, activeAgentId, onSelectAgent, onNewAgent, onSettings, onLogout, isOpen, onClose }) => {
  return (
    <>
      <aside className={`absolute md:relative z-40 flex flex-col h-full w-72 bg-slate-800/80 backdrop-blur-md border-r border-slate-700/60 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChloeIcon />
            <span className="font-bold text-lg">Chloe AI</span>
          </div>
        </div>

        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agents</p>
          {agents.map(agent => (
            <div key={agent.id} onClick={() => onSelectAgent(agent.id)} className={`${activeAgentId === agent.id ? 'bg-slate-700/80' : ''} rounded-lg`}>
              <AgentCard agent={agent} />
            </div>
          ))}
          <button onClick={onNewAgent} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center">
              <PlusIcon className="w-5 h-5" />
            </div>
            <span className="font-semibold">New Agent</span>
          </button>
        </div>

        <div className="p-3 border-t border-slate-700/60 space-y-1">
          <button onClick={onSettings} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors text-slate-300">
            <CogIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center">
              {user.photoURL === 'mock_photo_url' ? <UserIcon className="w-6 h-6 text-slate-300" /> : <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full" />}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button onClick={onLogout} className="ml-auto p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors" aria-label="Logout">
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
    </>
  );
};


const App: React.FC = () => {
    const { user, initializing: authInitializing, login, logout } = useAuth();
    const { getMessages, addMessage, updateMessage, initializeMemoryForAgent } = useAgentMemory(INITIAL_AGENTS);
    const { isDriveConnected, driveError, connectToDrive, disconnectFromDrive } = useGoogleDrive();
    const location = useGeolocation();

    const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAgentBuilderOpen, setIsAgentBuilderOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFriendlyMode, setIsFriendlyMode] = useState(false);
    const [browserContent, setBrowserContent] = useState<{ thought: string, searchQuery: string } | null>(null);

    const activeAgent = useMemo(() => agents.find(agent => agent.id === activeAgentId) || null, [agents, activeAgentId]);
    const messages = useMemo(() => getMessages(activeAgentId), [getMessages, activeAgentId]);

    const handleAddAgent = (newAgentData: Omit<Agent, 'id' | 'avatar'>) => {
        const newAgent: Agent = {
            id: `custom-${Date.now()}`,
            ...newAgentData,
            avatar: (
                <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{newAgentData.name.charAt(0).toUpperCase()}</span>
                </div>
            ),
        };
        setAgents(prev => [...prev, newAgent]);
        initializeMemoryForAgent(newAgent.id);
        setActiveAgentId(newAgent.id);
    };
    
    const handleSelectAgent = (id: string) => {
        setActiveAgentId(id);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const handleSendMessage = useCallback(async (prompt: string, image: { base64: string; mimeType: string } | null) => {
        if (!activeAgent) return;
        
        setIsLoading(true);

        const userMessageParts: ChatMessagePart[] = [];
        if (prompt.trim()) {
            userMessageParts.push({ text: prompt });
        }
        if (image) {
            userMessageParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
        }
        
        if (userMessageParts.length === 0) {
            setIsLoading(false);
            return;
        }

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', parts: userMessageParts };
        addMessage(activeAgent.id, userMessage);
        
        const modelMessageId = `model-${Date.now()}`;
        addMessage(activeAgent.id, { id: modelMessageId, role: 'model', parts: [], isThinking: true });

        try {
            const agentForAPI = {...activeAgent};
            if(agentForAPI.id === 'chloe-assistant' && isFriendlyMode) {
                agentForAPI.systemInstruction = `${agentForAPI.systemInstruction}\n- IMPORTANT: Be friendly, conversational, and add a bit of personality to your responses.`;
            }

            const stream = await geminiService.generateResponseStream(
                prompt, image, getMessages(activeAgent.id), agentForAPI,
                integrations, isDriveConnected, location
            );
            
            let fullResponseText = '';
            let finalResponse: any = null;
            
            for await (const chunk of stream) {
                // FIX: Per docs, access text via the .text property
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    updateMessage(activeAgent.id, modelMessageId, {
                        parts: [{ text: fullResponseText }],
                        isThinking: false,
                    });
                }
                finalResponse = chunk;
            }
            
            // FIX: Per docs, get grounding chunks from candidates array.
            const groundingChunks = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
            updateMessage(activeAgent.id, modelMessageId, {
                parts: [{ text: fullResponseText || " " }], // Ensure parts is not empty
                isThinking: false,
                groundingChunks: groundingChunks || [],
            });

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            updateMessage(activeAgent.id, modelMessageId, {
                parts: [{ text: `Sorry, I encountered an error: ${errorMessage}` }],
                isThinking: false
            });
        } finally {
            setIsLoading(false);
        }

    }, [activeAgent, addMessage, updateMessage, getMessages, integrations, isDriveConnected, location, isFriendlyMode]);

    if (authInitializing) {
        return <LoginScreen isInitializing={true} onLogin={() => {}} />;
    }

    if (!user) {
        return <LoginScreen isInitializing={false} onLogin={login} />;
    }
    
    return (
        <div className="flex h-screen w-screen bg-slate-900 text-white font-sans antialiased overflow-hidden">
            <Sidebar
                user={user}
                agents={agents}
                activeAgentId={activeAgentId}
                onSelectAgent={handleSelectAgent}
                onNewAgent={() => setIsAgentBuilderOpen(true)}
                onSettings={() => setIsSettingsOpen(true)}
                onLogout={logout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            
            <main className="flex-1 flex flex-col h-full relative">
                <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-700/80 bg-slate-800/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-slate-400 hover:text-white md:hidden">
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        {activeAgent && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden">{activeAgent.avatar}</div>
                                <h1 className="text-lg font-bold text-slate-200 truncate">{activeAgent.name}</h1>
                            </div>
                        )}
                    </div>
                </header>
                
                <div className="flex-1 overflow-y-auto">
                    <ChatInterface
                        activeAgent={activeAgent}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        integrations={integrations}
                        isDriveConnected={isDriveConnected}
                    />
                </div>
            </main>
            
            <Settings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                integrations={integrations}
                onToggleIntegration={(id) => setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, enabled: !i.enabled } : i)))}
                isDriveConnected={isDriveConnected}
                connectToDrive={connectToDrive}
                disconnectFromDrive={disconnectFromDrive}
                driveError={driveError}
                isFriendlyMode={isFriendlyMode}
                onToggleFriendlyMode={() => setIsFriendlyMode(p => !p)}
                activeAgentId={activeAgentId}
            />
            <AgentBuilder
                isOpen={isAgentBuilderOpen}
                onClose={() => setIsAgentBuilderOpen(false)}
                onAddAgent={handleAddAgent}
            />
            {browserContent && <Browser {...browserContent} onClose={() => setBrowserContent(null)} />}
        </div>
    );
};

export default App;
