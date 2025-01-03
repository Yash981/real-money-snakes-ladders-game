import { WebSocket } from "ws";
import { ClientMessage, EventTypes } from "./event-types";
import Game from "./game";
import { socketManager, User } from "./socket-manager";

export class GameManager {
  private games: Game[];
  private pendingGameId: string | null;
  private users: User[];
  constructor() {
    this.games = [];
    this.pendingGameId = null;
    this.users = [];
  }
  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }
  private addHandler(user: User) {
    user.socket.on("message", async (data) => {
      const message = JSON.parse(data.toString()) as ClientMessage;
      switch (message.event) {
        case EventTypes.JOIN_GAME:
          if (this.pendingGameId) {
            const game = this.games.find(
              (x) => x.gameId === this.pendingGameId
            );
            if (!game) {
              console.error("Pending Game not found");
              return;
            }
            const connectingUrself = Object.keys(game.getPlayers()).find((x) => x === user.name);
            console.log(connectingUrself,'connectingUrself')
            if(connectingUrself){
                user.socket.send(JSON.stringify({
                    type:EventTypes.ERROR,
                    error:'You are already in the game'
                }))
                return;
            }
            socketManager.addUser(game.gameId, user);
            game.addPlayer(user.name);
            socketManager.broadcast(
              game.gameId,
              JSON.stringify({
                event: EventTypes.GAME_STARTED,
                gameId: game.gameId,
                gameStarted: `game has been started between ${socketManager.getPlayerNamesIntheRoom(
                  game.gameId
                )}`,
              })
            );
            this.pendingGameId = null;
          } else {
            const game = new Game();
            game.addPlayer(user.name);
            this.games.push(game);
            this.pendingGameId = game.gameId;
            socketManager.addUser(game.gameId, user);
            socketManager.broadcast(
              game.gameId,
              JSON.stringify({
                event: EventTypes.GAME_ADDED,
                gameId: game.gameId,
              })
            );
          }
          break;
        case EventTypes.ROLL_DICE:
          const gameId = message.payload.gameId;
          const gameToRoll = this.games.find((x) => x.gameId === gameId);
          if (gameToRoll) {
            const posy = gameToRoll.rollDice(user.name);
            if (posy !== -1 && typeof posy !== 'number') {
                if(posy.nextPosition === 100){
                    socketManager.broadcast(
                        gameToRoll.gameId,
                        JSON.stringify({
                          event: EventTypes.GAME_FINISHED,
                          winner: user.name,
                        })
                      );
                    socketManager.removeUser(user.id)
                    this.removeGame(gameToRoll.gameId)
                    return;
                }
                socketManager.broadcast(
                    gameToRoll.gameId,
                    JSON.stringify({
                      event: EventTypes.DICE_RESULTS,
                      diceResult: posy,
                    })
                )
                socketManager.broadcast(
                gameToRoll.gameId,
                JSON.stringify({
                  event: EventTypes.BOARD_STATE,
                  boardState: `${user.name} moved to position ${posy.nextPosition}`,
                  playerPositions: Object.entries(gameToRoll.getPlayers()).map(([key, value]) => ({
                  username: key,
                  position: value
                  }))
                })
                );
            }else{
                user.socket.send(JSON.stringify({
                    type:EventTypes.ERROR,
                    error:'Not your turn'
                }))
            }
          }
          break;
        case EventTypes.ABANDON_GAME:
            const gameIdToAbandon = message.payload.gameId as string;
            const gameToAbandon = this.games.find((x) => x.gameId === gameIdToAbandon);
            if(gameToAbandon){
                socketManager.broadcast(gameToAbandon.gameId,JSON.stringify({
                    type:EventTypes.ABANDON_GAME,
                    gameId:gameToAbandon.gameId,
                    gameAbandoned:`Game has been abandoned by ${user.name}`
                }))
                console.log(socketManager.getPlayerNamesIntheRoom(gameToAbandon.gameId).split('and'),user.name)
                socketManager.broadcast(gameToAbandon.gameId,JSON.stringify({
                    type:EventTypes.GAME_FINISHED,
                    winner: socketManager.getPlayerNamesIntheRoom(gameToAbandon.gameId).split('and').filter((x) => x.trim() !== user.name)[0]
                }))
                socketManager.removeUser(user.id)
                this.removeGame(gameIdToAbandon)
            }
            break;
        default:
          return;
      }
    });
  }
  removeGame(gameId: string) {
    this.games = this.games.filter((x) => x.gameId !== gameId);
  }
  removeUser(socket: WebSocket) {
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error('User not found?');
      return;
    }
    this.users = this.users.filter((user) => user.socket !== socket);
    socketManager.removeUser(user.id);
  }
}
