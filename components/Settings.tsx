import React from 'react';
import XMarkIcon from './icons/XMarkIcon';
import type { Integration } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  isDriveConnected: boolean;
  connectToDrive: () => void;
  disconnectFromDrive: () => void;
  driveError: string | null;
  isFriendlyMode: boolean;
  onToggleFriendlyMode: () => void;
  activeAgentId: string | null;
}

const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  integrations,
  onToggleIntegration,
  isDriveConnected,
  connectToDrive,
  disconnectFromDrive,
  driveError,
  isFriendlyMode,
  onToggleFriendlyMode,
  activeAgentId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* AI Personality Section */}
          {activeAgentId === 'chloe-assistant' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">AI Personality</h3>
              <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                <div>
                  <p className="text-white font-medium">Chloe's Friendly Mode</p>
                  <p className="text-sm text-slate-400">Toggles a more conversational tone.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isFriendlyMode} onChange={onToggleFriendlyMode} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Integrations Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Integrations</h3>
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Google Drive</p>
                    <p className="text-sm text-slate-400">Ground responses in your documents.</p>
                  </div>
                  {isDriveConnected ? (
                    <button onClick={disconnectFromDrive} className="px-3 py-1 text-sm bg-slate-600 text-white rounded-md hover:bg-red-500/80 transition-colors">
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={connectToDrive} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">
                      Connect
                    </button>
                  )}
                </div>
                {driveError && <p className="text-xs text-red-400 mt-2">{driveError}</p>}
                {!driveError && isDriveConnected && <p className="text-xs text-green-400 mt-2">Successfully connected to Google Drive.</p>}
              </div>

              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{integration.name}</p>
                    <p className="text-sm text-slate-400">{integration.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={integration.enabled} onChange={() => onToggleIntegration(integration.id)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;