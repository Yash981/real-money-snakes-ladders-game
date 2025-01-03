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
interface Square {
  number: number;
  hasSnake?: boolean;
  hasLadder?: boolean;
  snakeEnd?: number;
  ladderEnd?: number;
}
type GameBoardProps = {
  playerName?: string;
  player2Name?: string;
}

const GameBoard = ({ playerName, player2Name }: GameBoardProps) => {
  const { sendMessage, connected } = useWebSocket()
  const { boardState } = useWebSocketStore();
  const router = useTransitionRouter()
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
    return board.reverse();
  };
  const board = createBoard();
  const getSquareColor = (square: Square) => {
    if (square.hasSnake) return 'bg-red-200 hover:bg-red-300';
    if (square.hasLadder) return 'bg-green-200 hover:bg-green-300';
    return 'bg-white hover:bg-gray-100';
  };
  const renderPawn = (squareNumber: number) => {
    console.log(Object.entries(boardState).map(([x,y])=>[x,y]), 'boardState')
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
    const gameId = sessionStorage.getItem('gameId');
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex justify-between w-full max-w-4xl mb-6">
        <PlayerProfile name={`${'Player1'} ${connected ? '🟢' : '🔴'}`} score={0} />
        <div className=" flex justify-end">
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleRollDice}>Roll Dice</Button>
        </div>
        <PlayerProfile name={`${'Player2'} ${connected ? '🟢' : '🔴'}`} score={0} />
      </div>
      <h1 className="text-3xl font-bold mb-6">Snakes and Ladders</h1>
      <div className="grid grid-cols-10 gap-1 max-w-4xl w-full border-2 border-gray-300 p-2 bg-gray-100 rounded-lg">
        {board.map((square) => (
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
        ))}
      </div>
      <div className="flex items-center mt-6 justify-center w-full max-w-4xl">
        <Button className="" variant={"destructive"} onClick={() => {router.push('/lobby');sessionStorage.removeItem('gameId')}}>End Game</Button>
      </div>
    </div>
  );
};
export default GameBoard;