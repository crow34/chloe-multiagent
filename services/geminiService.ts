import { GoogleGenAI, Content, Part, Tool, ToolConfig, GenerateContentResponse } from '@google/genai';
import type { Agent, ChatMessage, Integration } from '../types';
import { GeolocationState } from '../hooks/useGeolocation';

// The API key is injected via process.env.API_KEY.
// We assume this is handled by the build environment.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI;
if (API_KEY) {
  // FIX: Initialize GoogleGenAI with named apiKey parameter as per guidelines.
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY environment variable is not set. Gemini API calls will fail.");
  // For this app to function visually without an API key, we will let it proceed
  // but API calls will fail at runtime.
}


const buildTools = (
  integrations: Integration[],
  isDriveConnected: boolean
): Tool[] | undefined => {
  const tools: Tool[] = [];
  const googleSearch = integrations.find(i => i.id === 'google-search' && i.enabled);
  const googleMaps = integrations.find(i => i.id === 'google-maps' && i.enabled);

  // Per grounding guidelines, only googleSearch and googleMaps are allowed together.
  if (googleSearch) {
    tools.push({ googleSearch: {} });
  }
  if (googleMaps) {
    tools.push({ googleMaps: {} });
  }

  return tools.length > 0 ? tools : undefined;
};

const buildToolConfig = (
  integrations: Integration[],
  location: GeolocationState
): ToolConfig | undefined => {
  const mapsEnabled = integrations.find(i => i.id === 'google-maps' && i.enabled);
  if (mapsEnabled && location.latitude && location.longitude) {
    return {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      }
    };
  }
  return undefined;
};

const convertMessagesToHistory = (messages: ChatMessage[]): Content[] => {
  // Omit the last message if it's from the model and is a placeholder for a thinking response.
  const filteredMessages = messages.filter(msg => !msg.isThinking);

  return filteredMessages.map((msg) => {
    return {
      role: msg.role,
      parts: msg.parts.map((part) => {
        if (part.text) {
          return { text: part.text };
        }
        if (part.inlineData) {
          return {
            inlineData: {
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType,
            },
          };
        }
        return { text: '' };
      }),
    };
  });
};

export const generateResponseStream = async (
  prompt: string,
  image: { base64: string; mimeType: string } | null,
  history: ChatMessage[],
  agent: Agent,
  integrations: Integration[],
  isDriveConnected: boolean,
  location: GeolocationState
): Promise<AsyncGenerator<GenerateContentResponse>> => {

  if (!ai) {
    throw new Error("GoogleGenAI not initialized. Check API_KEY.");
  }
  
  const tools = buildTools(integrations, isDriveConnected);
  
  const userMessageParts: Part[] = [];

  if (image) {
    userMessageParts.push({
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    });
  }
  // Ensure prompt is not empty. Some models require a text part.
  if (prompt || userMessageParts.length === 0) {
    userMessageParts.push({ text: prompt });
  }

  const contents: Content[] = [
    ...convertMessagesToHistory(history),
    { role: 'user', parts: userMessageParts }
  ];

  // FIX: Use appropriate model based on agent's purpose, following guidelines.
  // Complex tasks for chloe/code-helper, flash for others.
  const modelName = ['chloe-assistant', 'code-helper'].includes(agent.id) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const response = await ai.models.generateContentStream({
    model: modelName,
    contents: contents,
    config: {
        systemInstruction: agent.systemInstruction,
        tools: tools,
        toolConfig: buildToolConfig(integrations, location),
    }
  });

  return response;
};
