"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { snakesAndLadders } from '@/lib/constants';
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
  const { sendMessage } = useWebSocket()
  const { boardState, usersStatus, rolledDiceDetails, playerTurnIndex } = useWebSocketStore();
  const router = useTransitionRouter()
  const pathname = usePathname()

  const createBoard = (): Square[] => {
    const board: Square[] = [];
    for (let i = 100; i >= 1; i--) {
      const square: Square = { number: i };

      if (snakesAndLadders[i]) {
        if (snakesAndLadders[i] > i) {
          square.hasLadder = true;
          square.ladderEnd = snakesAndLadders[i];
        } else {
          square.hasSnake = true;
          square.snakeEnd = snakesAndLadders[i];
        }
      }
      board.push(square);

    }
    return board
  };
  const board = createBoard();
  const getSquareColor = (square: Square) => {
    if (square.hasSnake) {
      return 'bg-red-200 hover:bg-red-300';
    }
    if (square.hasLadder) return 'bg-green-200 hover:bg-green-300';
    return 'bg-white hover:bg-gray-100';
  };
  const renderPawn = (squareNumber: number) => {
    // const currentPlayer = rolledDiceDetails.username;
    // const diceResult = rolledDiceDetails.diceResults;
    // const currentPosition = rolledDiceDetails.nextPosition - diceResult;
    // const targetPosition = rolledDiceDetails.nextPosition;
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
  return (
    <div className="flex flex-wrap justify-evenly items-center min-h-screen min-w-screen  space-y-4 lg:space-y-0">
      <div className="flex flex-col justify-between p-2 h-screen items-center">
        <div className="flex flex-col items-center justify-center w-full md:w-1/4 space-y-4">
          <PlayerProfile
            name={`${usersStatus?.[0]?.name || "Player 1"} ${usersStatus?.[0]?.isActive === "true" ? "🟢" : "🔴"
              }`}
            score={
              usersStatus?.[0]?.name === rolledDiceDetails.username
                ? rolledDiceDetails.nextPosition
                : boardState?.[0]?.position
            }
            backgroundColor={`${usersStatus?.[0]?.isActive === "true" ? "bg-blue-500" : "bg-gray-400"
              } text-white`}
          />
        </div>
        <div className="w-28">
          <RollDice onRoll={handleRollDice} diceColour={usersStatus?.[1 - playerTurnIndex!]?.isActive === "true"
            ? 1 - playerTurnIndex! === 0
              ? "text-blue-500"
              : "text-red-500"
            : "text-gray-400"} />
        </div>
        <div className="flex flex-col items-center justify-around w-full md:w-1/4 space-y-4">
          <PlayerProfile
            name={`${usersStatus?.[1]?.name || "Player 2"} ${usersStatus?.[1]?.isActive === "true" ? "🟢" : "🔴"
              }`}
            score={
              usersStatus?.[1]?.name === rolledDiceDetails.username
                ? rolledDiceDetails.nextPosition
                : boardState?.[1]?.position
            }
            backgroundColor={`${usersStatus?.[1]?.isActive === "true" ? "bg-red-500" : "bg-gray-400"
              } text-white`}
          />
        </div>
      </div>

      <div className="flex w-full md:w-2/4 justify-center">
        <div className="grid grid-cols-10 gap-1 max-w-full w-full border-2 border-gray-300 p-2 bg-gray-100 rounded-lg">
          {board.map((square) => (
            <div
              key={square.number}
              className={`aspect-square flex items-center justify-center p-1 border border-gray-300 rounded ${getSquareColor(
                square
              )} relative`}
            >
              {renderPawn(square.number)}
              <span className="text-xs md:text-sm font-semibold">{square.number}</span>
              {square.hasSnake && (
                <div className="absolute top-0 right-0">
                  <span className="text-xs text-red-600">→{square.snakeEnd}</span>
                </div>
              )}
              {square.hasLadder && (
                <div className="absolute top-0 right-0">
                  <span className="text-xs text-green-600">→{square.ladderEnd}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-1">
        <AbondonGame />
      </div>
      


      <WinnerDialog />
      <LoserDialog />
    </div>
  );
};
export default GameBoard;