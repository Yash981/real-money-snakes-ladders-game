import { WebSocketServer } from "ws";
// import { removeFromLobby } from "./lobby-manager";
import { handleClientMessage } from "./game-events";
import { ClientMessage, EventTypes } from "./event-types";
import { PrismaClient } from "@prisma/client";
import prisma from "../db/client";
import { userMiddleware } from "../middleware/authMiddleware";
import jwt from 'jsonwebtoken'
import { snakesAndLadders } from "./constants";
const BOARD_SIZE = 100;
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
console.log(createBoard(),'createBoard')
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

const board = createBoard();
console.log(board);
export const setupWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection",  async function connection(ws, req) {
    const cookies = req.headers.cookie;
    const token = cookies;
    const user = jwt.verify(token!, process.env.JWT_SECRET as string) as any
    const clientId = await prisma.user.findUnique({
      where:{
        email:user.userId
      }
    })
    // console.log(clientId,'clientId')
    ws.on("message", async function message(data) {
      console.log("received: %s", data.toString());
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        console.log(message,'message')
        const response = await handleClientMessage(message, clientId?.id ?? '',ws);
        
        console.log(response,'reponse')
        if(!response.payload.error && response.event === EventTypes.ROLL_DICE){
           response.payload.result.forEach((event:any) => {
            ws.send(JSON.stringify(event));
          });
          return;
        }
        ws.send(JSON.stringify(response));
    } catch (err) {
      console.error(err,'error');
        ws.send(JSON.stringify({ event: EventTypes.ERROR, payload: { err } }));
    }
    });
    ws.on("close", () => {
      console.log("Client disconnected");
    });
    ws.on("error", (err) => {
      console.error(err);
    });
  });
  console.log("WebSocket server is running");
  return wss;
};

