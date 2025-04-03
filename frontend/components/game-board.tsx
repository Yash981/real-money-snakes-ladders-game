"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { allSnakesAndLadders } from '@/lib/constants';
import { useWebSocket } from '@/hooks/use-socket-hook';
import PlayerProfile from './player-profile';
import { EventTypes } from '@/lib/types/event-types';
import { toast } from 'sonner';
import useWebSocketStore from '@/state-management/ws-state';
import { useTransitionRouter } from 'next-view-transitions';
import RollDice from './roll-dice';
import WinnerDialog from './winner-card';
import LoserDialog from './losser-card';
import { usePathname } from 'next/navigation';
import PawnSvg from './pawn';
import AbondonGame from './abondon-game';
interface Square {
  number: number;
  hasSnake?: boolean;
  hasLadder?: boolean;
  snakeEnd?: number;
  ladderEnd?: number;
}


const GameBoard = () => {
  const { sendMessage, connected } = useWebSocket()
  const { boardState, usersStatus, rolledDiceDetails, playerTurnIndex } = useWebSocketStore();
  const router = useTransitionRouter()
  const pathname = usePathname()
  const resumedGameId = pathname.split('/').pop();
  const createBoard = (): Square[] => {
    let currentGameIndex = Number(sessionStorage.getItem('gameBoardIndex'))
    console.log(currentGameIndex)
    if (!currentGameIndex) {
      currentGameIndex = 0
    }
    const board: Square[] = [];
    for (let i = 100; i >= 1; i--) {
      const square: Square = { number: i };

      if (allSnakesAndLadders[Number(currentGameIndex)][i]) {
        if (allSnakesAndLadders[Number(currentGameIndex)][i] > i) {
          square.hasLadder = true;
          square.ladderEnd = allSnakesAndLadders[Number(currentGameIndex)][i];
        } else {
          square.hasSnake = true;
          square.snakeEnd = allSnakesAndLadders[Number(currentGameIndex)][i];
        }
      }
      board.push(square);

    }
    return board
  };
  const board = createBoard();
  const getSquareColor = (square: Square) => {
    if (square.hasSnake) {
      return 'bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300';
    }
    if (square.hasLadder) {
      return 'bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300';
    }
    return square.number % 2 === 0
      ? 'bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50'
      : 'bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50';
  };
  const renderPawn = (squareNumber: number) => {
    const isPlayer1Here = boardState.map((x: any) => x?.position)[0] === squareNumber;
    const isPlayer2Here = boardState.map((x: any) => x?.position)[1] === squareNumber;
    return (
      <>
        {isPlayer1Here && (
          <PawnSvg base={"#000066"} topSphere={"#0000ff"} body={"#0000cc"} />
        )}
        {isPlayer2Here && (
          <PawnSvg base={"#cc0000"} topSphere={"#ff0000"} body={"#ff0000"} />
        )}
      </>
    );
  };
  const handleRollDice = () => {
    const gameId = pathname.split('/').slice(-1)[0]
    if (!gameId) {
      toast.error('Game not started');
      return;
    }
    sendMessage({
      event: EventTypes.ROLL_DICE,
      payload: {
        gameId
      }
    })

  }
  console.log(usersStatus,'all details',rolledDiceDetails)
  return (
    <div className="flex flex-wrap justify-evenly items-center lg:min-h-screen lg:min-w-screen  space-y-4 lg:space-y-0 sm:w-full">
      <div className="flex lg:flex-col lg:justify-between p-2 lg:h-screen items-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <PlayerProfile
            name={`${usersStatus?.[0]?.name.split('@').map(word => word.charAt(0).toUpperCase() + word.slice(1))[0] || "Player 1"} ${usersStatus?.[0]?.isActive === "active" ? "🟢" : "🔴"
              }`}
            score={
              usersStatus?.[0]?.name === rolledDiceDetails.username
                ? rolledDiceDetails.nextPosition
                : boardState?.[0]?.position
            }
            backgroundColor={`${usersStatus?.[0]?.isActive === "active"
                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                : "bg-gradient-to-r from-gray-400 to-gray-500"
              }`}
          />
        </div>
        <div className="w-28 max-sm:mt-auto sm:mt-auto lg:mt-0">
          <RollDice onRoll={handleRollDice} diceColour={usersStatus?.[1 - playerTurnIndex!]?.isActive === "active"
            ? 1 - playerTurnIndex! === 0
              ? "text-blue-500"
              : "text-red-500"
            : "text-gray-400"} />
        </div>
        <div className="flex flex-col items-center justify-around w-full md:w-1/4 space-y-4">
          <PlayerProfile
            name={`${usersStatus?.[1]?.name.split('@').map(word => word.charAt(0).toUpperCase() + word.slice(1))[0] || "Player 2"} ${usersStatus?.[1]?.isActive === "active" ? "🟢" : "🔴"
              }`}
            score={
              usersStatus?.[1]?.name === rolledDiceDetails.username
                ? rolledDiceDetails.nextPosition
                : boardState?.[1]?.position
            }
            backgroundColor={`${usersStatus?.[1]?.isActive === "active" ? "bg-red-500" : "bg-gray-400"
              } text-white`}
          />
        </div>
      </div>

      <div className="flex w-full md:w-2/4 justify-center p-4">
        <div className="grid grid-cols-10 gap-2 max-w-full w-full border-4 border-amber-700/30 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-xl max-sm:w-[580px]">
          {board.map((square) => (
            <div
              key={square.number}
              className={`aspect-square flex items-center justify-center p-1 border border-amber-200/50 rounded-lg ${getSquareColor(
                square
              )} relative max-sm:w-full max-sm:h-full max-sm:p-1 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
            >
              {renderPawn(square.number)}
              <span className="text-xs md:text-sm font-bold text-gray-700">{square.number}</span>
              {square.hasSnake && (
                <div className="absolute top-0 right-0">
                  <span className="text-xs font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    ↓{square.snakeEnd}
                  </span>
                </div>
              )}
              {square.hasLadder && (
                <div className="absolute top-0 right-0">
                  <span className="text-xs font-semibold bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                    ↑{square.ladderEnd}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="lg:absolute lg:top-0 lg:right-1  ">
        <AbondonGame />
      </div>
      <WinnerDialog />
      <LoserDialog />
    </div>
  );
};
export default GameBoard;