export type NumberMap = {
    [key: number]: number;
  };
export const snakesAndLadders1:NumberMap = {
    16: 6,  // Snake from 16 to 6
    47: 26, // Snake from 47 to 26
    49: 11, // Snake from 49 to 11
    56: 53, // Snake from 56 to 53
    62: 19, // Snake from 62 to 19
    64: 60, // Snake from 64 to 60
    87: 24, // Snake from 87 to 24
    93: 73, // Snake from 93 to 73
    95: 75, // Snake from 95 to 75
    98: 78, // Snake from 98 to 78
    1: 38,  // Ladder from 1 to 38
    4: 14,  // Ladder from 4 to 14
    9: 31,  // Ladder from 9 to 31
    21: 42, // Ladder from 21 to 42
    28: 84, // Ladder from 28 to 84
    36: 44, // Ladder from 36 to 44
    51: 67, // Ladder from 51 to 67
    71: 91, // Ladder from 71 to 91
    80: 100 // Ladder from 80 to 100
};
const snakesAndLadders2: NumberMap = {
  14: 4,   // Snake
  31: 9,   // Snake
  43: 22,  // Snake
  66: 45,  // Snake
  74: 53,  // Snake
  89: 68,  // Snake
  99: 78,  // Snake
  3: 21,   // Ladder
  8: 30,   // Ladder
  20: 41,  // Ladder
  27: 56,  // Ladder
  39: 60,  // Ladder
  50: 72,  // Ladder
  63: 82,  // Ladder
  76: 97   // Ladder
};
const snakesAndLadders3: NumberMap = {
  17: 7,   // Snake
  29: 11,  // Snake
  40: 18,  // Snake
  54: 34,  // Snake
  66: 48,  // Snake
  83: 61,  // Snake
  96: 77,  // Snake
  2: 23,   // Ladder
  10: 32,  // Ladder
  25: 47,  // Ladder
  37: 58,  // Ladder
  44: 64,  // Ladder
  57: 76,  // Ladder
  70: 90,  // Ladder
  81: 99   // Ladder
};
const snakesAndLadders4: NumberMap = {
  15: 5,   // Snake
  38: 17,  // Snake
  52: 31,  // Snake
  65: 42,  // Snake
  79: 58,  // Snake
  92: 71,  // Snake
  97: 80,  // Snake
  6: 25,   // Ladder
  12: 35,  // Ladder
  24: 46,  // Ladder
  33: 55,  // Ladder
  48: 68,  // Ladder
  59: 78,  // Ladder
  72: 94,  // Ladder
  85: 100  // Ladder
};
const snakesAndLadders5: NumberMap = {
  18: 8,   // Snake
  35: 13,  // Snake
  46: 25,  // Snake
  60: 40,  // Snake
  75: 52,  // Snake
  88: 67,  // Snake
  94: 74,  // Snake
  99: 79,  // Snake
  5: 26,   // Ladder
  11: 33,  // Ladder
  22: 44,  // Ladder
  34: 54,  // Ladder
  49: 69,  // Ladder
  62: 83,  // Ladder
  77: 98   // Ladder
};

const allSnakesAndLadders = [
  snakesAndLadders1,
  snakesAndLadders2,
  snakesAndLadders3,
  snakesAndLadders4,
  snakesAndLadders5
];
export const getRandomSnakesAndLadders = (): { board: NumberMap, index: number } => {
  const randomIndex = Math.floor(Math.random() * allSnakesAndLadders.length);
  return { board: allSnakesAndLadders?.[randomIndex] ?? snakesAndLadders1, index: randomIndex };
};
export const BOARD_SIZE = 100;
