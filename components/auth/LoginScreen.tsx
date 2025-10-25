import React from 'react';
import GoogleIcon from '../icons/GoogleIcon';

interface LoginScreenProps {
  onLogin: () => void;
  isInitializing: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isInitializing }) => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-slate-900">
      <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">C</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Chloe AI</h1>
        <p className="text-slate-400 mb-8">Your Personal Research Assistant</p>
        {isInitializing ? (
          <div className="h-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-200 transition-colors"
          >
            <GoogleIcon className="w-6 h-6" />
            Sign in with Google
          </button>
        )}
         <p className="text-xs text-slate-500 mt-8">This is a demo application. Sign-in is simulated.</p>
      </div>
    </div>
  );
};

export default LoginScreen;
