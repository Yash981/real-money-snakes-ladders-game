import { WebSocket } from "ws";
import { ClientMessage, EventTypes } from "../types/event-types";
import Game from "./game";
import { socketManager, User } from "./socket-manager";
import prisma from "../db/client";
import redisService from "../services/redis-service";
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
          await this.handleInitGame(user);
          break;
        case EventTypes.ROLL_DICE:
          await this.handleRollDice(message, user);
          break;
        case EventTypes.ABANDON_GAME:
          await this.handleAbondonGame(message, user);
          break;
        case EventTypes.GAME_RESUME:
          await this.handleGameResume(message, user);
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
      console.error("User not found!");
      return;
    }
    const currentStatus: { name: string; isActive: string }[] = [];
    let keyy = "";

    const interestedSockets = socketManager.getInterestedSockets();
    for (const [key, value] of interestedSockets.entries()) {
      value.map((valueCurrentUser) => {
        if (valueCurrentUser.name === user.name) {
          keyy = key;
          socketManager.getUserSocketByroomId(key)?.map((currentUser) => {
            currentStatus.push(
              currentUser.socket.readyState === WebSocket.CLOSED
                ? {
                    name: currentUser.name
                      .split("@")[0]
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" "),
                    isActive: "false",
                  }
                : {
                    name: currentUser.name
                      .split("@")[0]
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" "),
                    isActive: "true",
                  }
            );
          });
          return;
        }
      });
    }
    if (keyy) {
      socketManager.getUserSocketByroomId(keyy)?.map((currentUser) => {
        if (currentUser.socket.readyState === WebSocket.OPEN) {
          currentUser.socket.send(
            JSON.stringify({
              event: EventTypes.USER_STATUS,
              payload: currentStatus,
            })
          );
        }
      });
    }
    this.users = this.users.filter((user) => user.socket !== socket);
    socketManager.removeUser(user.id);
  }
  private async getPlayerIds(gameId: string): Promise<{
    player1: { id: string; email: string; password: string; balance: number };
    player2: { id: string; email: string; password: string; balance: number };
  } | null> {
    const playerEmails = socketManager
      .getPlayerNamesIntheRoom(gameId)
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
  private async handleInitGame(user: User) {
    if (this.pendingGameId) {
      const game = this.games.find((x) => x.gameId === this.pendingGameId);
      if (!game) {
        console.error("Pending Game not found");
        return;
      }
      socketManager.addUser(game.gameId, user);
      game.addPlayer(user.name);
      let status: { name: string; isActive: string }[] = [];
      socketManager.getUserSocketByroomId(game.gameId)?.map((currentUser) => {
        status.push(
          currentUser.socket.readyState === WebSocket.OPEN
            ? {
                name: currentUser.name
                  .split("@")[0]
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                isActive: "true",
              }
            : {
                name: currentUser.name
                  .split("@")[0]
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                isActive: "false",
              }
        );
      });
      socketManager.broadcast(
        game.gameId,
        JSON.stringify({
          event: EventTypes.GAME_STARTED,
          gameBoardIndex: game.getBoardIndex(),
          gameId: game.gameId,
          gameStarted: socketManager.getPlayerNamesIntheRoom(game.gameId),
          nextPlayerTurnIndex: game.getUsernameAndPlayerTurnIndex()[1],
        })
      );
      socketManager.getUserSocketByroomId(game.gameId)?.map((currentUser) => {
        currentUser.socket.send(
          JSON.stringify({
            event: EventTypes.USER_STATUS,
            payload: status,
          })
        );
      });
      const { player1, player2 } = (await this.getPlayerIds(game.gameId)) || {};

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
        let gameStartedState = {
          gameId: game.gameId,
          player1Id: player1.email,
          player2Id: player2.email,
          currentTurn: player1.email,
          state: {},
        };
        await redisService.set(
          `game:${game.gameId}`,
          JSON.stringify(gameStartedState)
        );
        await redisService.getClient().sadd("active_games", game.gameId);
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
  }
  private async handleRollDice(message: ClientMessage, user: User) {
    const gameId = message.payload.gameId;

    const gameToRoll = this.games.find((x) => x.gameId === gameId);
    if (gameToRoll) {
      const posy = gameToRoll.rollDice(user.name);
      if (posy !== -1 && typeof posy !== "number") {
        if (posy.nextPosition === 100) {
          //dice results
          socketManager.broadcast(
            gameToRoll.gameId,
            JSON.stringify({
              event: EventTypes.DICE_RESULTS,
              diceResult: { ...posy, username: user.name },
            })
          );
          //boardState
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
          setTimeout(async () => {
            //winner
            user.socket.send(
              JSON.stringify({
                gameId: gameToRoll.gameId,
                event: EventTypes.GAME_WINNER,
                winner: user.name,
              })
            );
            //losser
            socketManager
              .getUserSocketByroomId(gameToRoll.gameId)
              ?.map((currentUser) => {
                if (currentUser.name !== user.name) {
                  currentUser.socket.send(
                    JSON.stringify({
                      gameId: gameToRoll.gameId,
                      event: EventTypes.GAME_LOSSER,
                      losser: currentUser.name,
                    })
                  );
                }
              });
            await prisma.$transaction(
              async (prisma) => {
                await prisma.game.update({
                  where: {
                    gameId: gameToRoll.gameId,
                  },
                  data: {
                    status: "COMPLETED",
                    state: {
                      player1: Object.keys(gameToRoll.getPlayers())[0],
                      player2: Object.keys(gameToRoll.getPlayers())[1],
                      player1Position: gameToRoll.getPlayerPosition(
                        Object.keys(gameToRoll.getPlayers())[0]
                      ),
                      player2Position: gameToRoll.getPlayerPosition(
                        Object.keys(gameToRoll.getPlayers())[1]
                      ),
                    },
                    winner: user.name,
                  },
                });

                const completedGameState = {
                  gameId: gameToRoll.gameId,
                  status: "COMPLETED",
                  player1Id: Object.keys(gameToRoll.getPlayers())[0],
                  player2Id: Object.keys(gameToRoll.getPlayers())[1],
                  state: {
                    player1Position: gameToRoll.getPlayerPosition(
                      Object.keys(gameToRoll.getPlayers())[0]
                    ),
                    player2Position: gameToRoll.getPlayerPosition(
                      Object.keys(gameToRoll.getPlayers())[1]
                    ),
                  },
                  winner: user.name,
                };
                await redisService.set(
                  `game:${gameToRoll.gameId}`,
                  JSON.stringify(completedGameState)
                );
                await redisService
                  .getClient()
                  .srem("active_games", gameToRoll.gameId);

                await prisma.gameHistory.create({
                  data: {
                    gameId: gameToRoll.gameId,
                    userId: user.name,
                    moneyChange: 100,
                    result: "WIN",
                  },
                });

                await prisma.gameHistory.create({
                  data: {
                    gameId: gameToRoll.gameId,
                    userId: socketManager
                      .getPlayerNamesIntheRoom(gameToRoll.gameId)
                      .filter((x) => x !== user.name)[0],
                    moneyChange: -100,
                    result: "LOSE",
                  },
                });
                await prisma.user.update({
                  where: {
                    email: user.name,
                  },
                  data: {
                    balance: { increment: 100 },
                  },
                });
                await prisma.user.update({
                  where: {
                    email: socketManager
                      .getPlayerNamesIntheRoom(gameToRoll.gameId)
                      .filter((x) => x.trim() !== user.name)[0],
                  },
                  data: {
                    balance: { decrement: 100 },
                  },
                });
              },
              { timeout: 10000 }
            );
            socketManager.removeUser(user.id);
            this.removeGame(gameToRoll.gameId);
            return;
          }, 1000);
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

        //db call
        await prisma.game.update({
          where: {
            gameId: gameToRoll.gameId,
          },
          data: {
            state: {
              player1: Object.keys(gameToRoll.getPlayers())[0],
              player2: Object.keys(gameToRoll.getPlayers())[1],
              player1Position: gameToRoll.getPlayerPosition(
                Object.keys(gameToRoll.getPlayers())[0]
              ),
              player2Position: gameToRoll.getPlayerPosition(
                Object.keys(gameToRoll.getPlayers())[1]
              ),
            },
            currentTurn: user.name,
          },
        });
        const getCurrentGameIdState = await redisService.get(
          `game:${gameToRoll.gameId}`
        );
        if (getCurrentGameIdState) {
          const InprogressState = {
            ...JSON.parse(getCurrentGameIdState),
            currentTurn: user.name,
            state:{
              state: {
                player1: Object.keys(gameToRoll.getPlayers())[0],
                player2: Object.keys(gameToRoll.getPlayers())[1],
                player1Position: gameToRoll.getPlayerPosition(
                  Object.keys(gameToRoll.getPlayers())[0]
                ),
                player2Position: gameToRoll.getPlayerPosition(
                  Object.keys(gameToRoll.getPlayers())[1]
                ),
              },
            }
          };
          await redisService.set(`game:${gameToRoll.gameId}`,JSON.stringify(InprogressState))
        }
      } else {
        user.socket.send(
          JSON.stringify({
            event: EventTypes.ERROR,
            error: "Not your turn",
          })
        );
      }
    }
  }
  private async handleAbondonGame(message: ClientMessage, user: User) {
    const gameIdToAbandon = message.payload.gameId as string;
    console.log(user, "userrrr", gameIdToAbandon, "gameId");
    const gameToAbandon = this.games.find((x) => x.gameId === gameIdToAbandon);
    console.log(gameToAbandon, "game");
    if (gameToAbandon) {
      const players = socketManager.getPlayerNamesIntheRoom(
        gameToAbandon.gameId
      );
      const winner = players?.filter((x) => x?.trim() !== user.name)?.[0];
      const loser = user.name;
      console.log(winner, loser, "winn losser");
      if (!winner || !loser) {
        console.error("Could not determine winner/loser for abandoned game");
        return;
      }

      socketManager.broadcast(
        gameToAbandon.gameId,
        JSON.stringify({
          event: EventTypes.ABANDON_GAME,
          gameId: gameToAbandon.gameId,
          gameAbandoned: `Game has been abandoned by ${user.name}`,
        })
      );
      socketManager.broadcast(
        gameToAbandon.gameId,
        JSON.stringify({
          event: EventTypes.GAME_WINNER,
          winner: winner,
        })
      );
      const getCurrentGameIdState = await redisService.get(
        `game:${gameToAbandon.gameId}`
      );
      if(getCurrentGameIdState){
        const updateGameState = {
          ...JSON.parse(getCurrentGameIdState),
          status:"COMPLETED",
          state: {
            player1: Object.keys(gameToAbandon.getPlayers())[0],
            player2: Object.keys(gameToAbandon.getPlayers())[1],
            player1Position: gameToAbandon.getPlayerPosition(
              Object.keys(gameToAbandon.getPlayers())[0]
            ),
            player2Position: gameToAbandon.getPlayerPosition(
              Object.keys(gameToAbandon.getPlayers())[1]
            ),
          },
          winner: winner,

        }
        await redisService.set(`game:${gameToAbandon.gameId}`,JSON.stringify(updateGameState))
        await redisService.getClient().srem("active_games", gameToAbandon.gameId);
      }
      await prisma.game.update({
        where: {
          gameId: gameToAbandon.gameId,
        },
        data: {
          status: "COMPLETED",
          state: {
            player1: Object.keys(gameToAbandon.getPlayers())[0],
            player2: Object.keys(gameToAbandon.getPlayers())[1],
            player1Position: gameToAbandon.getPlayerPosition(
              Object.keys(gameToAbandon.getPlayers())[0]
            ),
            player2Position: gameToAbandon.getPlayerPosition(
              Object.keys(gameToAbandon.getPlayers())[1]
            ),
          },
          winner: winner,
          GameHistory: {
            createMany: {
              data: [
                {
                  userId: loser,
                  moneyChange: -100,
                  result: "LOSE",
                },
                {
                  userId: winner,
                  moneyChange: 100,
                  result: "WIN",
                },
              ],
            },
          },
        },
      });
      await prisma.user.update({
        where: { email: loser },
        data: {
          balance: { decrement: 100 },
        },
      });
      await prisma.user.update({
        where: { email: winner },
        data: {
          balance: { increment: 100 },
        },
      });

      socketManager.removeUser(user.id);
      this.removeGame(gameIdToAbandon);
    }
  }
  private async handleGameResume(message: ClientMessage, user: User) {
    const { resumedGameId } = message.payload;
    const existingGame = this.games.find((x) => x.gameId === resumedGameId);
    if (!existingGame) {
      user.socket.send(
        JSON.stringify({
          event: EventTypes.ERROR,
          error: "Game not found",
        })
      );
      return;
    }
    const isPlayerInGame = Object.keys(existingGame.getPlayers()).includes(
      user.name
    );
    if (!isPlayerInGame) {
      user.socket.send(
        JSON.stringify({
          type: EventTypes.ERROR,
          error: "Not authorized to resume this game",
        })
      );
      return;
    }
    socketManager.updateUserSocket(resumedGameId, user.name, user.socket);

    const currentState = Object.entries(existingGame.getPlayers()).map(
      ([key, value]) => ({
        username: key,
        position: value,
      })
    );
    let reconnectStatus: { name: string; isActive: string }[] = [];
    socketManager
      .getUserSocketByroomId(existingGame.gameId)
      ?.map((currentUser) => {
        reconnectStatus.push(
          currentUser.socket.readyState === WebSocket.OPEN
            ? {
                name: currentUser.name
                  .split("@")[0]
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                isActive: "true",
              }
            : {
                name: currentUser.name
                  .split("@")[0]
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                isActive: "false",
              }
        );
      });
    user.socket.send(
      JSON.stringify({
        event: EventTypes.GAME_STATE_RESTORED,
        payload: {
          resumedGameId,
          playerPositions: currentState,
          usersStatus: socketManager
            .getUserSocketByroomId(existingGame.gameId)
            ?.map((currentUser) => {
              currentUser.socket.send(
                JSON.stringify({
                  event: EventTypes.USER_STATUS,
                  payload: reconnectStatus,
                })
              );
            }),
        },
      })
    );
    socketManager.broadcast(
      resumedGameId,
      JSON.stringify({
        event: EventTypes.PLAYER_RECONNECTED,
        payload: {
          player: user.name,
          currentTurn: existingGame.getCurrentTurn(),
        },
      })
    );
  }
}
