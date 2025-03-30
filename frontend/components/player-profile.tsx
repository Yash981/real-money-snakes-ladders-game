'use client'

import React from 'react';

interface PlayerProfileProps {
  name: string;
  score: number;
  backgroundColor: string;
}

const DemoUserSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-8 h-8 text-white/90"
    fill="currentColor"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
  </svg>
);

const PlayerProfile: React.FC<PlayerProfileProps> = ({ name, score, backgroundColor }) => {
  return (
    <div className="flex flex-col items-center gap-3 w-[180px]">
      {/* Player Card */}
      <div className={`w-full ${backgroundColor} rounded-xl shadow-lg transition-transform hover:scale-105`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <DemoUserSVG />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {name}
            </p>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-25"></div>
        <div className="relative bg-white px-6 py-4 rounded-lg shadow-xl border border-gray-100">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 text-center">Score</div>
          <div className="text-2xl font-bold text-gray-800 text-center">{score ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;

