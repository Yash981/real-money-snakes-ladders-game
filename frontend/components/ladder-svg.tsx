import React from 'react';
interface LadderSvgProps {
  className?: string;
  width?: number;
  height?: number;
}
const LadderSvg: React.FC<LadderSvgProps> = ({ className = "", width = 80, height = 100 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left pole */}
      <line x1="10" y1="0" x2="10" y2="100" stroke="#8B4513" strokeWidth="4" />
      
      {/* Right pole */}
      <line x1="30" y1="0" x2="30" y2="100" stroke="#8B4513" strokeWidth="4" />
      
      {/* Rungs */}
      <line x1="10" y1="10" x2="30" y2="10" stroke="#8B4513" strokeWidth="3" />
      <line x1="10" y1="30" x2="30" y2="30" stroke="#8B4513" strokeWidth="3" />
      <line x1="10" y1="50" x2="30" y2="50" stroke="#8B4513" strokeWidth="3" />
      <line x1="10" y1="70" x2="30" y2="70" stroke="#8B4513" strokeWidth="3" />
      <line x1="10" y1="90" x2="30" y2="90" stroke="#8B4513" strokeWidth="3" />
    </svg>
  );
};
export default LadderSvg;