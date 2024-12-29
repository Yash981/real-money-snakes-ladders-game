import { WebSocketServer } from "ws";
import { handleClientMessage } from "./game-events";
import { ClientMessage, EventTypes } from "./event-types";
import { verifyWSToken } from "../services/auth-service";

export const setupWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection",  async function connection(ws, req) {
    const clientId = await verifyWSToken(ws,req);
    if(!clientId){
      ws.send(JSON.stringify({ event: EventTypes.ERROR, payload: { error: 'Unauthorized' } }));
      ws.close();
      return;
    }
    // console.log('yaha jara Unauthorized',)
    ws.on("message", async function message(data) {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        const response = await handleClientMessage(message, clientId?.id ?? '',ws);
        
        if(response && !response.payload.error && response.event === EventTypes.ROLL_DICE){
           response.payload.result.forEach((event:any) => {
            ws.send(JSON.stringify(event));
          });
          return;
        }
        ws.send(JSON.stringify(response));
    } catch (err) {
      console.log(err,'going here');
        ws.send(JSON.stringify({ event: EventTypes.ERROR, payload: err }));
    }
    });
    ws.on("close", (event) => {
      console.log(event,'event')
      console.log("Client disconnected");
    });
    ws.on("error", (err) => {
      console.error(err);
    });
  });
  console.log("WebSocket server is running");
  return wss;
};

