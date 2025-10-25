
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Agent, ChatMessage } from '../types';
import { USER_AGENT } from '../constants';
import { useCamera } from '../hooks/useCamera';
import { useLiveConversation } from '../hooks/useLiveConversation';
import WelcomeScreen from './WelcomeScreen';
import SendIcon from './icons/SendIcon';
import CameraIcon from './icons/CameraIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import XMarkIcon from './icons/XMarkIcon';
import GroundingSources from './GroundingSources';
import PhoneCallView from './PhoneCallView';

interface ChatInterfaceProps {
  activeAgent: Agent | null;
  messages: ChatMessage[];
  onSendMessage: (prompt: string, image: { base64: string; mimeType: string } | null) => void;
  isLoading: boolean;
  integrations: any[]; // Passed but not used directly here, for future use maybe
  isDriveConnected: boolean; // Passed but not used directly here
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeAgent, messages, onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<{ base64: string; mimeType: string } | null>(null);
  const [liveTranscription, setLiveTranscription] = useState('');

  const { videoRef, isCameraOn, error: cameraError, startCamera, stopCamera, captureFrame } = useCamera();
  const { isLive, error: liveError, startConversation, stopConversation } = useLiveConversation(setLiveTranscription);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = useCallback(() => {
    if ((!prompt.trim() && !imagePreview) || isLoading) return;
    onSendMessage(prompt, imagePreview);
    setPrompt('');
    setImagePreview(null);
  }, [prompt, imagePreview, isLoading, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCapture = () => {
    const frame = captureFrame();
    if (frame) {
      setImagePreview(frame);
    }
    stopCamera();
  };

  const handleMicClick = () => {
    if (isLive) {
      stopConversation();
    } else {
      startConversation();
    }
  };
  
  const handleCameraClick = () => {
      if (isCameraOn) {
          stopCamera();
      } else {
          startCamera();
      }
  };

  if (!activeAgent) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {isLive && (
        <PhoneCallView onHangup={stopConversation} transcription={liveTranscription} agent={activeAgent} />
      )}
      
      {isCameraOn && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl h-auto rounded-lg shadow-2xl mb-4"></video>
            {cameraError && <p className="text-red-400 mb-4">{cameraError}</p>}
            <div className="flex gap-4">
                <button onClick={handleCapture} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors">
                    Capture
                </button>
                <button onClick={stopCamera} className="px-6 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((message) => {
          const agent = message.role === 'user' ? USER_AGENT : activeAgent;
          return (
            <div key={message.id} className="flex items-start gap-4">
              <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden mt-1 shadow-md">
                {agent.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-200 mb-1">{agent.name}</p>
                <div className="prose prose-invert prose-p:text-slate-300 prose-li:text-slate-300 prose-pre:bg-slate-900/70 max-w-none">
                  {message.parts.map((part, index) => {
                    if (part.text) {
                      return <Markdown key={index} remarkPlugins={[remarkGfm]}>{part.text}</Markdown>;
                    }
                    if (part.inlineData) {
                      return (
                        <img 
                          key={index} 
                          src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                          alt="User upload" 
                          className="mt-2 rounded-lg max-w-sm shadow-lg"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
                {message.groundingChunks && <GroundingSources chunks={message.groundingChunks} />}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden mt-1 shadow-md">{activeAgent.avatar}</div>
            <div className="flex-1">
              <p className="font-bold text-slate-200 mb-1">{activeAgent.name}</p>
              <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-slate-800 border-t border-slate-700/80">
        <div className="bg-slate-700/50 rounded-xl p-2 flex flex-col gap-2">
          {imagePreview && (
            <div className="relative w-24 h-24 m-2">
              <img src={`data:${imagePreview.mimeType};base64,${imagePreview.base64}`} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-0.5 text-slate-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeAgent.name}...`}
                className="w-full bg-transparent p-2 text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none overflow-y-hidden"
                rows={1}
              />
            </div>
            <div className="flex items-center gap-1">
                <button 
                  onClick={handleCameraClick} 
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-600/50 transition-colors"
                  aria-label="Use camera"
                >
                    <CameraIcon className="w-6 h-6" />
                </button>
                 <button 
                  onClick={handleMicClick} 
                  className={`p-2 rounded-full hover:bg-slate-600/50 transition-colors ${isLive ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                  aria-label={isLive ? 'Stop conversation' : 'Start conversation'}
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
                 <button
                    onClick={handleSubmit}
                    disabled={(!prompt.trim() && !imagePreview) || isLoading}
                    className="p-2 rounded-full transition-colors text-white bg-indigo-600 disabled:bg-slate-600 disabled:text-slate-400 hover:bg-indigo-500"
                    aria-label="Send message"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>
        {liveError && <p className="text-xs text-red-400 mt-2 px-2">{liveError}</p>}
      </div>
    </div>
  );
};

export default ChatInterface;
