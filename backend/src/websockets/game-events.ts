import { WebSocket } from "ws";
import { ClientMessage, EventTypes } from "./event-types";
import { lobbyManager } from "./lobby-manager";
const roomClients = new Map<string, Set<WebSocket>>();
export const handleClientMessage = async (
  message: ClientMessage,
  clientId: string,
  ws: WebSocket
) => {
  const { event, payload } = message;
  switch (event) {
    case EventTypes.JOIN_GAME:
      const { gameId } = payload;
      const result = await lobbyManager.joinGame(gameId, clientId);
      if (!roomClients.has(gameId)) {
        roomClients.set(gameId, new Set());
      }
      roomClients.get(gameId)!.add(ws);

      return { event: EventTypes.JOIN_GAME, payload: { result } };
    case EventTypes.ROLL_DICE:
      const { roomId } = payload;
      const diceResult = await lobbyManager.rollDice(roomId, clientId);
      // console.log(JSON.stringify(diceResult), "diceResult");
      // console.log(roomClients, "roomClients");
      const clientsInRoom = roomClients.get(roomId);
      // console.log(clientsInRoom,clientId, "clientskjhgcInRoomjj,",diceResult,"diceResult");
      if (clientsInRoom) {
        clientsInRoom.forEach((clientWs) => {
          if (clientWs !== ws) {
            const diceResultsPayload = diceResult.result.find(
              (item:ClientMessage) => item.event === "DICE_RESULTS"
            )?.payload;
      
            const boardStatePayload = diceResult.result.find(
              (item:ClientMessage) => item.event === "BOARD_STATE"
            )?.payload;
            const players = boardStatePayload?.players || [];
            const turn = boardStatePayload?.turn;
            if (diceResultsPayload) {
              clientWs.send(
                JSON.stringify({
                  event: EventTypes.DICE_RESULTS,
                  payload: diceResultsPayload,
                })
              );
            }

            if (players.length > 0 && turn) {
              clientWs.send(
                JSON.stringify({
                  event: EventTypes.BOARD_STATE,
                  payload: {
                    roomId: boardStatePayload.roomId,
                    players: players.map(({ userId, position }:{userId:string,position:number}) => ({
                      userId,
                      position,
                    })),
                    turn,
                  },
                })
              );
            }
            if(diceResult.result.find((item:ClientMessage) => item.event === "GAME_FINISHED")){
              const winner = diceResult.result.find((item:ClientMessage) => item.event === "GAME_FINISHED")?.payload.winner;
              clientWs.send(
                JSON.stringify({
                  event: EventTypes.GAME_FINISHED,
                  payload: {
                    roomId: boardStatePayload.roomId,
                    winner,
                  },
                })
              );
            }
          }
        });
      }
      console.log(diceResult, "diceResulttttt");
      return { event: EventTypes.ROLL_DICE, payload: diceResult?.error ? { error: diceResult.error } : diceResult };
    default:
      return {
        event: EventTypes.ERROR,
        payload: { error: "Invalid event type" },
      };
  }
};
