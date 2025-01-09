"use client"
import React from 'react';
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
import SnakeSvg from './snake-svg';
import LadderSvg from './ladder-svg';
interface Square {
  number: number;
  hasSnake?: boolean;
  hasLadder?: boolean;
  snakeEnd?: number;
  ladderEnd?: number;
}


const GameBoard = () => {
  const { sendMessage } = useWebSocket()
  const { boardState, usersStatus,rolledDiceDetails } = useWebSocketStore();
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
          <div className="w-4 h-4 bg-blue-500 rounded-full absolute top-1 left-1"></div>
        )}
        {isPlayer2Here && (
          <div className="w-4 h-4 bg-red-500 rounded-full absolute top-1 right-1"></div>
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
    <div className="flex justify-center items-center min-h-screen min-w-screen">
      <div className="flex flex-col items-center justify-center h-full w-3/12">
      <RollDice onRoll={handleRollDice}  />
        <PlayerProfile
          name={`${usersStatus ? usersStatus[0]?.name : "Player 1"
            } ${usersStatus && usersStatus[0]?.isActive === "true" ? "🟢" : "🔴"}`}
          score={usersStatus && usersStatus[0]?.name === rolledDiceDetails.username ? rolledDiceDetails.nextPosition:boardState.map((x: any) => x?.position)[0]}
          backgroundColor={`${
            usersStatus && usersStatus[0]?.isActive === "true"
              ? "text-white bg-blue-500"
              : "text-white bg-gray-400"
          }`}
    
        />
      </div>
      {/* <h1 className="text-3xl font-bold mb-6">Snakes and Ladders</h1> */}
      <div className="flex mx-auto w-3/5 h-full">
        <div className="grid grid-cols-10 gap-1 max-w-3xl w-full border-2 border-gray-300 p-2 bg-gray-100 rounded-lg">
          {board.map((square) => {
            // console.log(square,'square rendering',rolledDiceDetails.username,rolledDiceDetails.currentPosition,rolledDiceDetails.diceResults,rolledDiceDetails.nextPosition)
            return (
            <div
              key={square.number}
              className={`aspect-square flex items-center justify-center p-1 border border-gray-300 rounded ${getSquareColor(
                square
              )} relative`}
            >
              {renderPawn(square.number)}
              <span className="text-sm font-semibold">{square.number}</span>
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
          )})}
        </div>
      </div>
      <div className="flex flex-col items-center justify-around h-full w-3/12">
        <div className="flex items-center mt-6 justify-center w-full max-w-4xl m-2">
          <Button className="" variant={"destructive"} onClick={() => { router.push('/lobby'); sessionStorage.removeItem('gameId') }}>End Game</Button>
        </div>
        <PlayerProfile
          name={`${usersStatus ? usersStatus[1]?.name : "Player 2"
            } ${usersStatus && usersStatus[1]?.isActive === "true" ? "🟢" : "🔴"}`}
          score={usersStatus && usersStatus[1]?.name === rolledDiceDetails.username ? rolledDiceDetails.nextPosition : boardState.map((x: any) => x?.position)[1]}
          backgroundColor={`${
            usersStatus && usersStatus[1]?.isActive === "true"
              ? "text-white bg-red-500"
              : "text-white bg-gray-400"
          }`}
        />
      </div>
      <WinnerDialog />
      <LoserDialog />
        {/* <LadderSvg/> */}
    </div>
  );
};
export default GameBoard;