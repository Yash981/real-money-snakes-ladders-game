'use client'

import React from 'react';

interface PlayerProfileProps {
  name: string;
  score: number;
}

const DemoUserSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-12 h-12 text-gray-400"
    fill="currentColor"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
  </svg>
);

const PlayerProfile: React.FC<PlayerProfileProps> = ({ name, score }) => {
  return (
    <div className='flex justify-center flex-col items-center'>
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <DemoUserSVG />
        <div>
          <p className="text-lg font-semibold">{name}</p>
        </div>
      </div>
      <span className='w-16 h-16 m-2 border-2 flex justify-center items-center'>{score}</span>
    </div>
  );
};

export default PlayerProfile;

