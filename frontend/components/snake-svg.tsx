import React from 'react';
interface SnakeSvgProps {
  className?: string;
  width?: number;
  height?: number;
}
const SnakeSvg: React.FC<SnakeSvgProps> = ({ className = "", width = 40, height = 100 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Snake body - curved path */}
      <path
        d="M20,0 
           C35,25 5,50 20,75 
           C35,100 5,125 20,150"
        fill="none"
        stroke="#2F8C3C"
        strokeWidth="8"
        strokeLinecap="round"
      />
      
      {/* Snake head */}
      <circle cx="20" cy="5" r="6" fill="#2F8C3C" />
      
      {/* Snake eyes */}
      <circle cx="18" cy="3" r="1" fill="white" />
      <circle cx="22" cy="3" r="1" fill="white" />
      
      {/* Snake tongue */}
      <path
        d="M20,8 L20,12 L16,15 M20,12 L24,15"
        stroke="red"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
};
export default SnakeSvg;