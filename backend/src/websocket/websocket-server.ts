import { WebSocketServer } from "ws";
import { verifyWSToken } from "../services/auth-service";
import { GameManager } from "./game-manager";

export const setupWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });
  const gameManager = new GameManager();
  wss.on("connection",  async function connection(ws, req) {
    const user = await verifyWSToken(ws,req);
    if(!user){
      return;
    }
    gameManager.addUser(user)
    ws.on("close", (event) => {
      console.log(event,'event')
      console.log("Client disconnected");
      gameManager.removeUser(ws);
    });
    ws.on("error", (err) => {
      console.error(err);
    });
  });
  console.log("WebSocket server is running");
  return wss;
};

