import { BOARD_SIZE, NumberMap } from "../utils/constants";

export const createBoard = (snakesAndLadders:NumberMap) => {
    const board = new Array(BOARD_SIZE).fill(0);
  
    for (let i = 1; i <= BOARD_SIZE; i++) {
      if (snakesAndLadders[i]) {
        board[i - 1] = snakesAndLadders[i];
      } else {
        board[i - 1] = i;
      }
    }
  
    return board;
};

export const movePlayer = (currentPosition: number, board: number[]) => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    let newPosition = currentPosition + diceRoll;
    if (newPosition > BOARD_SIZE) {
      return {currentPosition,diceRoll,newPosition: board[currentPosition-1]};
    }
  
    return {currentPosition,diceRoll,newPosition: board[newPosition-1]};
  };