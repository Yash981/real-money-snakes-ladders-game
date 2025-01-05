import { BOARD_SIZE, snakesAndLadders } from "../utils/constants";

export const createBoard = () => {
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
      return {diceRoll,newPosition: board[currentPosition-1]};
    }
  
    console.log(createBoard())
    return {diceRoll,newPosition: board[newPosition-1]};
  };