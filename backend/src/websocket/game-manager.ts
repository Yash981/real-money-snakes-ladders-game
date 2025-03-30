import { WebSocket } from "ws";
import { ClientMessage, EventTypes } from "../types/event-types";
import Game from "./game";
import { socketManager, User } from "./socket-manager";
import prisma from "../db/client";
import redisService from "../services/redis-service";

export class GameManager {
  private games: Map<string, Game> = new Map();
  private pendingGameId: string | null = null;
  private users: User[] = [];

  constructor() {
    this.loadActiveGamesFromRedis();
  }

  private async loadActiveGamesFromRedis(): Promise<void> {
    try {
      const activeGameIds = await redisService.getAllActiveGames();
      console.log(`Loading ${activeGameIds.length} active games from Redis`);

      for (const gameId of activeGameIds) {
        const gameState = await redisService.getGameState(gameId);
        if (gameState) {
          const game = new Game(gameId);
          this.games.set(gameId, game);
        }
      }
    } catch (error) {
      console.error("Error loading active games from Redis:", error);
    }
  }

  public addUser(user: User): void {
    this.users.push(user);
    this.setupMessageHandler(user);
  }

  private setupMessageHandler(user: User): void {
    user.socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;
        await this.handleClientMessage(message, user);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        this.sendErrorToUser(user, "Invalid message format");
      }
    });
  }

  private async handleClientMessage(
    message: ClientMessage,
    user: User
  ): Promise<void> {
    switch (message.event) {
      case EventTypes.INIT_GAME:
        await this.handleInitGame(user);
        break;
      case EventTypes.ROLL_DICE:
        await this.handleRollDice(message, user);
        break;
      case EventTypes.ABANDON_GAME:
        await this.handleAbandonGame(message, user);
        break;
      case EventTypes.GAME_RESUME:
        await this.handleGameResume(message, user);
        break;
      case EventTypes.CANCELLED_GAME:
        this.pendingGameId = null;
        break;
      default:
        this.sendErrorToUser(user, `Unknown event type: ${message.event}`);
    }
  }

  private sendErrorToUser(user: User, message: string): void {
    if (user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(
        JSON.stringify({
          event: EventTypes.ERROR,
          message,
        })
      );
    }
  }

  public removeGame(gameId: string): void {
    this.games.delete(gameId);
  }

  public removeUser(socket: WebSocket): void {
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error("User not found for disconnection event");
      return;
    }

    this.updateUserStatusInGames(user);

    this.users = this.users.filter((u) => u.socket !== socket);
    socketManager.removeUser(user.id);
  }

  private updateUserStatusInGames(user: User): void {
    const interestedSockets = socketManager.getInterestedSockets();

    for (const [roomId, users] of interestedSockets.entries()) {
      const userInRoom = users.some((u) => u.name === user.name);

      if (userInRoom) {
        const currentStatus = this.getCurrentActiveUsersIntheGame(roomId);

        socketManager.getUserSocketByroomId(roomId)?.forEach((currentUser) => {
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
    }
  }

  private async handleInitGame(user: User): Promise<void> {
    try {
      if (this.pendingGameId) {
        await this.joinPendingGame(user);
      } else {
        await this.createNewGame(user);
      }
    } catch (error) {
      console.error("Error initializing game:", error);
      this.sendErrorToUser(user, "Failed to initialize game");
    }
  }

  private async joinPendingGame(user: User): Promise<void> {
    if (!this.pendingGameId) return;

    const game = this.games.get(this.pendingGameId);
    if (!game) {
      console.error("Pending Game not found");
      this.pendingGameId = null;
      return;
    }

    socketManager.addUser(game.gameId, user);
    await game.addPlayer(user.name);

    const status = this.getCurrentActiveUsersIntheGame(game.gameId);

    const playerEmails = socketManager.getPlayerNamesIntheRoom(game.gameId);

    socketManager.broadcast(
      game.gameId,
      JSON.stringify({
        event: EventTypes.GAME_STARTED,
        gameBoardIndex: game.getBoardIndex(),
        gameId: game.gameId,
        gameStarted: playerEmails,
        nextPlayerTurnIndex: game.getUsernameAndPlayerTurnIndex()[1],
      })
    );

    socketManager.getUserSocketByroomId(game.gameId)?.forEach((currentUser) => {
      if (currentUser.socket.readyState === WebSocket.OPEN) {
        currentUser.socket.send(
          JSON.stringify({
            event: EventTypes.USER_STATUS,
            payload: status,
          })
        );
      }
    });

    this.pendingGameId = null;

    const emails = playerEmails.map((email) => email.trim());
    if (emails.length === 2) {
      const gameState = {
        gameId: game.gameId,
        players: emails.reduce<
          Record<string, { position: number; email: string }>
        >((acc, email, index) => {
          acc[email] = { position: 0, email };
          return acc;
        }, {}),
        status: "IN_PROGRESS",
        currentTurn: emails[0],
        state: {},
      };

      await redisService.saveGameState(game.gameId, gameState);
    }
  }

  private async createNewGame(user: User): Promise<void> {
    const game = new Game();
    await game.addPlayer(user.name);

    this.games.set(game.gameId, game);
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

  private async handleRollDice(
    message: ClientMessage,
    user: User
  ): Promise<void> {
    const gameId = message.payload.gameId;
    const game = this.games.get(gameId);

    if (!game) {
      this.sendErrorToUser(user, "Game not found");
      return;
    }

    const rollResult = await game.rollDice(user.name);
    if (!rollResult) {
      this.sendErrorToUser(user, "It's not your turn or invalid move");
      return;
    }

    socketManager.broadcast(
      gameId,
      JSON.stringify({
        event: EventTypes.DICE_RESULTS,
        diceResult: { ...rollResult, username: user.name },
      })
    );

    // Update board state for all players
    socketManager.broadcast(
      gameId,
      JSON.stringify({
        event: EventTypes.BOARD_STATE,
        boardState: `${user.name} moved to position ${rollResult.nextPosition}`,
        playerPositions: Object.entries(game.getPlayers()).map(
          ([key, value]) => ({
            username: key,
            position: value,
          })
        ),
      })
    );

    if (rollResult.nextPosition === 100) {
      await this.handleGameWin(game, user);
    }
  }

  private async handleGameWin(game: Game, winner: User): Promise<void> {
    // Notify winner
    winner.socket.send(
      JSON.stringify({
        gameId: game.gameId,
        event: EventTypes.GAME_WINNER,
        winner: winner.name,
      })
    );

    // Notify losers
    const roomUsers = socketManager.getUserSocketByroomId(game.gameId) || [];
    for (const user of roomUsers) {
      if (user.name !== winner.name) {
        user.socket.send(
          JSON.stringify({
            gameId: game.gameId,
            event: EventTypes.GAME_LOSSER,
            losser: user.name,
          })
        );
      }
    }

    const playerEmails = socketManager
      .getPlayerNamesIntheRoom(game.gameId)
      .map((email) => email.trim());
    const getGameStatePosition = await redisService.get(`game:${game.gameId}`);
    if (!getGameStatePosition) {
      return;
    }
    if (playerEmails.length === 2) {
      const gameState = {
        ...JSON.parse(getGameStatePosition),
        gameId: game.gameId,
        status: "COMPLETED",
        winner: winner.name,
        betAmount: 100.0,
        state: game.getPlayers(),
      };

      await redisService.saveGameState(game.gameId, gameState);
      await redisService.markGameCompleted(game.gameId);

      await redisService.syncWithDatabase();

      try {
        const winnerUser = await prisma.user.findUnique({
          where: { email: winner.name },
        });

        const loserEmail = playerEmails.find((email) => email !== winner.name);
        const loserUser = loserEmail
          ? await prisma.user.findUnique({
              where: { email: loserEmail },
            })
          : null;

        if (winnerUser && loserUser) {
          const betAmount = game.betAmount || 5.0;

          await prisma.$transaction([
            prisma.user.update({
              where: { email: winner.name },
              data: { balance: winnerUser.balance + betAmount },
            }),
            prisma.user.update({
              where: { email: loserEmail },
              data: { balance: loserUser.balance - betAmount },
            }),
          ]);
        }
      } catch (error) {
        console.error("Error updating balances:", error);
      }
    }
  }

  private async handleAbandonGame(
    message: ClientMessage,
    user: User
  ): Promise<void> {
    const gameId = message.payload.gameId;
    const game = this.games.get(gameId);

    if (!game) {
      this.sendErrorToUser(user, "Game not found");
      return;
    }

    const playerEmails = socketManager
      .getPlayerNamesIntheRoom(gameId)
      .map((email) => email.trim());

    const otherPlayerEmail = playerEmails.find((email) => email !== user.name);
    if (otherPlayerEmail) {
      const otherPlayer = this.users.find((u) => u.name === otherPlayerEmail);

      if (otherPlayer) {
        otherPlayer.socket.send(
          JSON.stringify({
            gameId,
            event: EventTypes.GAME_WINNER,
            winner: otherPlayerEmail,
            reason: "Opponent abandoned the game",
          })
        );

        user.socket.send(
          JSON.stringify({
            gameId,
            event: EventTypes.GAME_LOSSER,
            losser: user.name,
            reason: "You abandoned the game",
          })
        );
        const getGameStatePosition = await redisService.get(
          `game:${gameId}`
        );
        if (!getGameStatePosition) {
          return;
        }
        const gameState = {
          ...JSON.parse(getGameStatePosition),
          gameId,
          status: "COMPLETED",
          winner: otherPlayerEmail,
          state: game.getPlayers(),
        };

        await redisService.saveGameState(gameId, gameState);
        await redisService.markGameCompleted(gameId);

        await redisService.syncWithDatabase();
      }
    }

    this.removeGame(gameId);
  }

  private async handleGameResume(
    message: ClientMessage,
    user: User
  ): Promise<void> {
    const gameId = message.payload.gameId;

    let game = this.games.get(gameId);

    if (!game) {
      const loadedGame = await Game.loadFromRedis(gameId);

      if (loadedGame) {
        game = loadedGame;
        this.games.set(gameId, game);
      } else {
        this.sendErrorToUser(user, "Game not found or expired");
        return;
      }
    }

    socketManager.addUser(gameId, user);

    user.socket.send(
      JSON.stringify({
        event: EventTypes.GAME_RESUME,
        gameId,
        state: game.getPlayers(),
        currentTurn: game.getCurrentTurn(),
      })
    );

    const status = this.getCurrentActiveUsersIntheGame(gameId);
    socketManager.broadcast(
      gameId,
      JSON.stringify({
        event: EventTypes.USER_STATUS,
        payload: status,
      })
    );
  }

  public getCurrentActiveUsersIntheGame(
    gameId: string
  ): { name: string; isActive: string }[] {
    const users = socketManager.getUserSocketByroomId(gameId) || [];

    return users.map((user) => ({
      name: user.name,
      isActive:
        user.socket.readyState === WebSocket.OPEN ? "active" : "inactive",
    }));
  }
}
