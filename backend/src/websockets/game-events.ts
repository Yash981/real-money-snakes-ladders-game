import { WebSocket } from "ws";
import { ClientMessage, EventTypes } from "./event-types";
import { lobbyManager } from "./lobby-manager";
const roomClients = new Map<string, Set<string>>();
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
      roomClients.get(gameId)!.add(clientId);

      return { event: EventTypes.JOIN_GAME, payload: { result } };
    case EventTypes.ROLL_DICE:
      const { roomId } = payload;
      const diceResult = await lobbyManager.rollDice(roomId, clientId);
      console.log(JSON.stringify(diceResult), "diceResult");
      console.log(roomClients, "roomClients");
      const clientsInRoom = roomClients.get(roomId);
      console.log(clientsInRoom, "clientsInRoom",diceResult,"diceResult");
      if (clientsInRoom) {
        // Broadcast to all other clients in the room
        clientsInRoom.forEach((clientWs) => {
          // Make sure you don't send the message back to the user who initiated the roll
          if (clientWs !== clientId) {
            // Send dice results and board state to the other clients
            ws.send(
              JSON.stringify({
                event: EventTypes.DICE_RESULTS,
                payload: diceResult,
              })
            );

            ws.send(
              JSON.stringify({
                event: EventTypes.BOARD_STATE,
                payload: {
                  roomId,
                  players: Object.entries(diceResult.players).map(
                    ([userId, position]) => ({
                      userId,
                      position,
                    })
                  ),
                  turn: diceResult.nextTurn,
                },
              })
            );
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
