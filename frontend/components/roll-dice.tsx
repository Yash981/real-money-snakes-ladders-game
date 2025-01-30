"use client";
import useWebSocketStore from "@/state-management/ws-state";
import React, { useEffect, useState } from "react";

const RollDice = ({ onRoll,diceColour}: { onRoll: () => void,diceColour:string }) => {
  const [currentDiceColour,setcurrentDiceColour] = useState(diceColour)
  const [isRolling, setIsRolling] = useState(false);
  const [currentUser,setCurrentUser] = useState('')
  const {rolledDiceDetails} = useWebSocketStore()
  const handleClick = () => {
    if (isRolling) return;

    setIsRolling(true);

    onRoll();

    setTimeout(() => {
      setIsRolling(false);
    }, 1000);
  };
  useEffect(()=>{
    if(rolledDiceDetails.username && rolledDiceDetails.username !== currentUser){
      setCurrentUser(rolledDiceDetails.username)
      setTimeout(() => {
        setcurrentDiceColour(diceColour === 'text-blue-500' ? 'text-red-500':'text-blue-500')
      }, 1100);
    }
    //eslint-disable-next-line
  },[rolledDiceDetails])
  const diceDots: { [key: number]: { cx: number; cy: number }[] } = {
    1: [{ cx: 12, cy: 12 }],
    2: [
      { cx: 8, cy: 8 },
      { cx: 16, cy: 16 },
    ],
    3: [
      { cx: 8, cy: 8 },
      { cx: 12, cy: 12 },
      { cx: 16, cy: 16 },
    ],
    4: [
      { cx: 8, cy: 8 },
      { cx: 8, cy: 16 },
      { cx: 16, cy: 8 },
      { cx: 16, cy: 16 },
    ],
    5: [
      { cx: 8, cy: 8 },
      { cx: 8, cy: 16 },
      { cx: 12, cy: 12 },
      { cx: 16, cy: 8 },
      { cx: 16, cy: 16 },
    ],
    6: [
      { cx: 8, cy: 8 },
      { cx: 8, cy: 12 },
      { cx: 8, cy: 16 },
      { cx: 16, cy: 8 },
      { cx: 16, cy: 12 },
      { cx: 16, cy: 16 },
    ],
  };
  return (
    <button
      onClick={handleClick}
      disabled={isRolling}
      className={`p-2 rounded-lg focus:outline-none ${
        isRolling ? "animate-spin" : ""
      } transition-transform duration-300 ease-in-out`}
      aria-label="Roll Dice"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={currentDiceColour || diceColour}
      >
        <rect x="3" y="3" width="20" height="20" rx="2" ry="2" />
        {diceDots[rolledDiceDetails.diceResults]?.map((dot, index) => (
          <circle key={index} cx={dot.cx} cy={dot.cy} r="1" fill="black" />
        ))}
      </svg>
    </button>
  );
};

export default RollDice;