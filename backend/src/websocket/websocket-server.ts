import { WebSocketServer } from "ws";
import { verifyWSToken } from "../services/auth-service";
import { GameManager } from "./game-manager";
import redisService from "../services/redis-service";

export const setupWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });
  const gameManager = new GameManager();
  
  setupRedisSyncInterval();
  
  wss.on("connection", async function connection(ws, req) {
    try {
      const user = await verifyWSToken(ws, req);
      if (!user) {
        ws.close(1008, 'Authentication failed');
        return;
      }
      
      console.log(`User connected: ${user.name}`);
      gameManager.addUser(user);
      
      ws.on("close", (code, reason) => {
        console.log(`Client disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
        gameManager.removeUser(ws);
      });
      
      ws.on("error", (err) => {
        console.error("WebSocket error:", err);
        ws.close(1011, 'Server error');
      });
    } catch (error) {
      console.error("Error in WebSocket connection:", error);
      ws.close(1011, 'Server error');
    }
  });
  
  console.log("WebSocket server is running");
  return wss;
};

const setupRedisSyncInterval = () => {
  redisService.syncWithDatabase().catch(err => 
    console.error("Error in initial Redis-DB sync:", err)
  );
  
  console.log("Redis database sync configured");
};

