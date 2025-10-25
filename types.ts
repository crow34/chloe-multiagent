import React from 'react';

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  avatar: React.ReactElement;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface User {
  name: string;
  email: string;
  photoURL: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'done';
}

export interface GroundingSource {
    uri: string;
    title: string;
}
  
export interface GroundingChunk {
    web?: GroundingSource;
    maps?: {
        uri: string;
        title: string;
        placeAnswerSources?: {
            reviewSnippets?: GroundingSource[];
        }[];
    };
}

export interface ChatMessagePart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: ChatMessagePart[];
  groundingChunks?: GroundingChunk[];
  isThinking?: boolean;
  browserContent?: {
    thought: string;
    searchQuery: string;
  } | null;
}


// Augment window object for aistudio and webkit
declare global {
    // FIX: Define a named interface for `aistudio` to avoid conflicts with
    // a pre-existing global type and to allow for augmenting its properties.
    interface AIStudio {
      auth?: {
        getOAuthToken: () => Promise<string>;
      };
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    }
    interface Window {
      aistudio?: AIStudio;
      webkitAudioContext: typeof AudioContext;
    }
}
