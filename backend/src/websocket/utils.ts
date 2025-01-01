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
    console.log(`Dice roll: ${diceRoll}`, `Current position: ${currentPosition}`, `New position: ${newPosition}`);
    if (newPosition > BOARD_SIZE) {
      console.log("Roll exceeds board limit. Try again!");
      return board[currentPosition];
    }
  
    return board[newPosition]
  };