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
  export const movePlayer = (currentPosition: number, diceRoll: number) => {
    let newPosition = currentPosition + diceRoll;
  
    if (newPosition > BOARD_SIZE) {
      console.log("Roll exceeds board limit. Try again!");
      return currentPosition;
    }
  
    if (snakesAndLadders[newPosition]) {
      console.log(
        `Hit a ${newPosition > currentPosition ? "ladder" : "snake"}! Moving to ${
          snakesAndLadders[newPosition]
        }`
      );
      return snakesAndLadders[newPosition];
    }
  
    return newPosition;
  };