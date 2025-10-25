import React from 'react';
import { Agent, Integration } from './types';
import UserIcon from './components/icons/UserIcon';
import ChloeIcon from './components/icons/ChloeIcon';

export const USER_AGENT: Agent = {
  id: 'user',
  name: 'You',
  description: '',
  systemInstruction: '',
  avatar: <UserIcon className="w-full h-full p-1.5 text-slate-400" />,
};

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'chloe-assistant',
    name: 'Chloe',
    description: 'Advanced research and problem-solving agent.',
    systemInstruction: `You are Chloe, a female AI research and problem-solving agent. Your primary objective is to solve user problems by performing deep research using the internet.
- Analyze the user's problem carefully.
- Formulate a research plan.
- Use your web search tools to gather accurate, up-to-date, and relevant information.
- Synthesize the research into a coherent, actionable solution or report.
- Present the solution clearly and professionally. Ensure your answers are accurate and the solutions you provide are favorable and effective.`,
    avatar: <ChloeIcon />,
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'A coding assistant for developers.',
    systemInstruction:
      'You are a professional software developer. Provide clear, efficient, and well-documented code. When asked for code, provide it directly in a markdown block with the correct language identifier.',
    avatar: (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <span className="text-lg font-mono text-gray-300">{'</>'}</span>
      </div>
    ),
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Helps with writing stories, poems, and scripts.',
    systemInstruction:
      'You are an acclaimed creative writer. Your responses should be imaginative, eloquent, and emotionally resonant. Adapt your writing style to the user\'s request, whether it be for a poem, short story, or script.',
    avatar: (
      <div className="w-full h-full bg-amber-600 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
        </svg>
      </div>
    ),
  },
];

export const INITIAL_INTEGRATIONS: Integration[] = [
    {
        id: 'google-search',
        name: 'Google Search',
        description: 'Find up-to-date information from the web.',
        enabled: true,
    },
    {
        id: 'google-maps',
        name: 'Google Maps',
        description: 'Find place information and get recommendations.',
        enabled: true,
    },
];