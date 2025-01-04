import { WebSocket } from "ws";
import { ClientMessage, EventTypes } from "./event-types";
import Game from "./game";
import { socketManager, User } from "./socket-manager";
import prisma from "../db/client";
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
        case EventTypes.INIT_GAME:
          if (this.pendingGameId) {
            const game = this.games.find(
              (x) => x.gameId === this.pendingGameId
            );
            if (!game) {
              console.error("Pending Game not found");
              return;
            }
            const connectingUrself = Object.keys(game.getPlayers()).find(
              (x) => x === user.name
            );
            console.log(connectingUrself, "connectingUrself");
            if (connectingUrself) {
              user.socket.send(
                JSON.stringify({
                  type: EventTypes.ERROR,
                  error: "You are already in the game",
                })
              );
              return;
            }
            socketManager.addUser(game.gameId, user);
            game.addPlayer(user.name);
            socketManager.broadcast(
              game.gameId,
              JSON.stringify({
                event: EventTypes.GAME_STARTED,
                gameId: game.gameId,
                gameStarted: socketManager
                  .getPlayerNamesIntheRoom(game.gameId)
                  .split("and"),
              })
            );
            const { player1, player2 } =
              (await this.getPlayerIds(game.gameId)) || {};

            if (player1 && player2) {
              await prisma.game.create({
                data: {
                  gameId: game.gameId,
                  status: "IN_PROGRESS",
                  player1Id: player1.email,
                  player2Id: player2.email,
                  currentTurn: player1.email,
                  state: {},
                },
              });
            } else {
              console.error("Player IDs not found");
            }
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
            if (posy !== -1 && typeof posy !== "number") {
              if (posy.nextPosition === 100) {
                socketManager.broadcast(
                  gameToRoll.gameId,
                  JSON.stringify({
                    event: EventTypes.GAME_FINISHED,
                    winner: user.name,
                  })
                );
                await prisma.game.update({
                  where:{
                    gameId:gameToRoll.gameId
                  },
                  data:{
                    status:"COMPLETED",
                    state:{
                      player1:gameToRoll.getPlayers()[Object.keys(gameToRoll.getPlayers())[0]],
                      player2:gameToRoll.getPlayers()[Object.keys(gameToRoll.getPlayers())[1]],
                      player1Position: gameToRoll.getPlayerPosition(Object.keys(gameToRoll.getPlayers())[0]),
                      player2Position: gameToRoll.getPlayerPosition(Object.keys(gameToRoll.getPlayers())[1]),
                    },
                    winner:user.name,
                    GameHistory:{
                      createMany:{
                        data:[{
                          userId:user.name,
                          moneyChange:100,
                          result:"WIN",
                        },{
                          userId:socketManager.getPlayerNamesIntheRoom(gameToRoll.gameId).split("and").filter((x) => x.trim() !== user.name)[0],
                          moneyChange:-100,
                          result:"LOSE",
                        }]
                      }
                    }
                }})
                socketManager.removeUser(user.id);
                this.removeGame(gameToRoll.gameId);
                return;
              }
              //dice results
              socketManager.broadcast(
                gameToRoll.gameId,
                JSON.stringify({
                  event: EventTypes.DICE_RESULTS,
                  diceResult: { ...posy, username: user.name },
                })
              );
              //board State
              socketManager.broadcast(
                gameToRoll.gameId,
                JSON.stringify({
                  event: EventTypes.BOARD_STATE,
                  boardState: `${user.name} moved to position ${posy.nextPosition}`,
                  playerPositions: Object.entries(gameToRoll.getPlayers()).map(
                    ([key, value]) => ({
                      username: key,
                      position: value,
                    })
                  ),
                })
              );
              console.log(Object.keys(gameToRoll.getPlayers()),'before db call')
              //db call
              await prisma.game.update({
                where:{
                  gameId:gameToRoll.gameId
                },
                data:{
                  state:{
                    player1:gameToRoll.getPlayers()[Object.keys(gameToRoll.getPlayers())[0]],
                    player2:gameToRoll.getPlayers()[Object.keys(gameToRoll.getPlayers())[1]],
                    player1Position: gameToRoll.getPlayerPosition(Object.keys(gameToRoll.getPlayers())[0]),
                    player2Position: gameToRoll.getPlayerPosition(Object.keys(gameToRoll.getPlayers())[1]),
                  },
                  currentTurn:user.name,
                }
              })
            } else {
              user.socket.send(
                JSON.stringify({
                  event: EventTypes.ERROR,
                  error: "Not your turn",
                })
              );
            }
          }
          break;
        case EventTypes.ABANDON_GAME:
          const gameIdToAbandon = message.payload.gameId as string;
          const gameToAbandon = this.games.find(
            (x) => x.gameId === gameIdToAbandon
          );
          if (gameToAbandon) {
            socketManager.broadcast(
              gameToAbandon.gameId,
              JSON.stringify({
                type: EventTypes.ABANDON_GAME,
                gameId: gameToAbandon.gameId,
                gameAbandoned: `Game has been abandoned by ${user.name}`,
              })
            );
            socketManager.broadcast(
              gameToAbandon.gameId,
              JSON.stringify({
                type: EventTypes.GAME_FINISHED,
                winner: socketManager
                  .getPlayerNamesIntheRoom(gameToAbandon.gameId)
                  .split("and")
                  .filter((x) => x.trim() !== user.name)[0],
              })
            );
            await prisma.game.update({
              where:{
                gameId:gameToAbandon.gameId
              },
              data:{
                status:"COMPLETED",
                state:{
                  player1:gameToAbandon.getPlayers()[Object.keys(gameToAbandon.getPlayers())[0]],
                  player2:gameToAbandon.getPlayers()[Object.keys(gameToAbandon.getPlayers())[1]],
                  player1Position: gameToAbandon.getPlayerPosition(Object.keys(gameToAbandon.getPlayers())[0]),
                  player2Position: gameToAbandon.getPlayerPosition(Object.keys(gameToAbandon.getPlayers())[1]),
                },
                winner:socketManager.getPlayerNamesIntheRoom(gameToAbandon.gameId).split("and").filter((x) => x.trim() !== user.name)[0],
                GameHistory:{
                  createMany:{
                    data:[{
                      userId:user.name,
                      moneyChange:-100,
                      result:"LOSE",
                    },{
                      userId:socketManager.getPlayerNamesIntheRoom(gameToAbandon.gameId).split("and").filter((x) => x.trim() !== user.name)[0],
                      moneyChange:100,
                      result:"WIN",
                    }]
                  }
                }
              }
            })
            socketManager.removeUser(user.id);
            this.removeGame(gameIdToAbandon);
          }
          break;
        case EventTypes.JOIN_GAME:
          const gameIdToJoin = message.payload.gameId as string;
          const gamePlayerPositions = await prisma.game.findFirst({
            where:{
              gameId:gameIdToJoin
            }
          })
          socketManager.broadcast(gameIdToJoin, 
            JSON.stringify({
            event: EventTypes.GAME_STARTED,
            gameId: gameIdToJoin,
            playerPositions:gamePlayerPositions?.state
          }))
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
      console.error("User not found?");
      return;
    }
    this.users = this.users.filter((user) => user.socket !== socket);
    socketManager.removeUser(user.id);
  }
  private async getPlayerIds(gameId: string): Promise<{
    player1: {id: string; email: string; password: string;balance: number};
    player2: { id: string; email: string; password: string; balance: number };
  } | null> {
    const playerEmails = socketManager
      .getPlayerNamesIntheRoom(gameId)
      .split("and")
      .map((email) => email.trim());
    if (playerEmails.length !== 2) {
      console.error("Invalid number of players in the room");
      return null;
    }

    const [player1, player2] = await Promise.all([
      prisma.user.findFirst({ where: { email: playerEmails[0] } }),
      prisma.user.findFirst({ where: { email: playerEmails[1] } }),
    ]);
    console.log(player1, player2, "player1, player2");
    if (!player1 || !player2) {
      console.error("Player IDs not found");
      return null;
    }

    return { player1, player2 };
  }
}
