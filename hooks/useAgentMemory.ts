import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, Agent } from '../types';

const MEMORY_STORAGE_KEY = 'agent-chat-memory';

type AgentMemory = Record<string, ChatMessage[]>;

export const useAgentMemory = (initialAgents: Agent[]) => {
  const [memory, setMemory] = useState<AgentMemory>(() => {
    try {
      const storedMemory = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (storedMemory) {
        return JSON.parse(storedMemory);
      }
    } catch (error) {
      console.error("Failed to parse agent memory from localStorage", error);
    }
    // Initialize memory for default agents
    const initialMemory: AgentMemory = {};
    initialAgents.forEach(agent => {
        initialMemory[agent.id] = [];
    });
    return initialMemory;
  });

  useEffect(() => {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memory));
    } catch (error) {
      console.error("Failed to save agent memory to localStorage", error);
    }
  }, [memory]);
  
  const getMessages = useCallback(
    (agentId: string | null): ChatMessage[] => {
      return agentId ? memory[agentId] || [] : [];
    },
    [memory]
  );
  
  const addMessage = useCallback(
    (agentId: string, message: ChatMessage) => {
      setMemory((prevMemory) => {
        const agentMessages = prevMemory[agentId] ? [...prevMemory[agentId]] : [];
        // Prevent duplicate messages if component re-renders
        if (agentMessages.some(m => m.id === message.id)) {
            return prevMemory;
        }
        return {
          ...prevMemory,
          [agentId]: [...agentMessages, message],
        };
      });
    },
    []
  );

  const updateMessage = useCallback(
    (agentId: string, messageId: string, updatedPartials: Partial<ChatMessage>) => {
      setMemory((prevMemory) => {
        const agentMessages = prevMemory[agentId] ? [...prevMemory[agentId]] : [];
        const messageIndex = agentMessages.findIndex(m => m.id === messageId);
        
        if (messageIndex === -1) return prevMemory;
        
        const updatedMessages = [...agentMessages];
        const existingMessage = updatedMessages[messageIndex];

        updatedMessages[messageIndex] = {
          ...existingMessage,
          ...updatedPartials,
          // Deep merge parts array if needed, but for now, replacement is fine
          parts: updatedPartials.parts || existingMessage.parts
        };
        
        return {
          ...prevMemory,
          [agentId]: updatedMessages,
        };
      });
    },
    []
  );

  const clearMemory = useCallback((agentId: string) => {
    setMemory((prev) => ({
      ...prev,
      [agentId]: [],
    }));
  }, []);
  
  const initializeMemoryForAgent = useCallback((agentId: string) => {
    setMemory(prev => {
        if (!prev[agentId]) {
            return {
                ...prev,
                [agentId]: []
            };
        }
        return prev;
    });
  }, []);

  return { getMessages, addMessage, updateMessage, clearMemory, initializeMemoryForAgent };
};
