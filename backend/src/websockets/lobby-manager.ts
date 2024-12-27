import prisma from "../db/client";
import { EventTypes } from "./event-types";
import { movePlayer } from "./utils";

interface Room {
  roomId: string;
  users: string[];
  gameStarted: boolean;
}

class LobbyManager {
  private static instance: LobbyManager;
  private rooms: Map<string, Room>;
  private constructor() {
    this.rooms = new Map();
  }
  public static getInstance(): LobbyManager {
    if (!LobbyManager.instance) {
      LobbyManager.instance = new LobbyManager();
    }
    return LobbyManager.instance;
  }
  async joinGame(gameId: string, userId: string): Promise<any> {
    console.log(gameId, userId, "gameuserid");
    if (gameId) {
      const game = await prisma.game.findUnique({ where: { id: gameId } });
      if (game) {
        if (game.status === "WAITING") {
          const res = await prisma.game.update({
            where: { id: gameId },
            data: {
              player2Id: userId,
              status: "IN_PROGRESS",
            },
          });
          // console.log(
          //   `Player1 ${res.player1Id} and ${res.player2Id} joined the game: ${gameId}`
          // );
          return `Player1 ${res.player1Id} and ${res.player2Id} joined the game: ${gameId} Game joined successfully! The game can now begin.`;
        } else if (
          game.status === "IN_PROGRESS" &&
          (game.player1Id === userId || game.player2Id === userId)
        ) {
          return `Welcome back! Connected successfully to game: ${gameId}`;
        } else {
          return `Game not found or already in progress.`;
        }
      } else {
        return `Game not found.`;
      }
    } else {
      const createdGame = await prisma.game.create({
        data: {
          player1Id: userId,
          currentTurn: userId,
          status: "WAITING",
          state: {},
        },
      });
      // console.log(`Waiting for a player to join the game: ${createdGame.id}`);
      return `Waiting for a player to join the game: ${createdGame.id}`;
    }
  }
  async rollDice(roomId: string, userId: string): Promise<any> {
    const game = await prisma.game.findUnique({
      where: { id: roomId, player1Id: userId },
    });
    const game2 = await prisma.game.findUnique({
      where: { id: roomId, player2Id: userId },
    });
    // console.log(game, "game", game2, "game2");
    let currentGame = game || game2;
    if (!currentGame) {
      return { error: "Game not found" };
    }
    if(currentGame.status === "COMPLETED"){
      return { error: "Game is already completed!" };
    }

    if (currentGame.currentTurn !== userId) {
      return { error: "It's not your turn!" };
    }
    

    const diceResult = Math.ceil(Math.random() * 6);

    //@ts-ignore
    const updatedState = {...currentGame.state,[userId]: movePlayer(currentGame.state[userId] || 0, diceResult),
    };

    const nextTurn =
      userId === currentGame.player1Id
        ? currentGame.player2Id
        : currentGame.player1Id;

    console.log(nextTurn, "nextTurn");
    await prisma.game.update({
      where: { id: roomId },
      data: {
        state: updatedState,
        currentTurn: nextTurn as string,
      },
    });
    if (
      Object.values(updatedState).some(
        (position) => (position as number) >= 100
      )
    ) {
      await prisma.game.update({
        where: { id: roomId },
        data: {
          status: "COMPLETED",
          winner: userId,
        },
      });
      await prisma.gameHistory.create({
        data: {
          gameId: roomId,
          userId: userId,
          result: "WIN",
          moneyChange: 100,
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: 100,
          },
        },
      });
      await prisma.gameHistory.create({
        data: {
          gameId: roomId,
          userId: nextTurn as string,
          result: "LOSE",
          moneyChange: -100,
        },
      });
      await prisma.user.update({
        where: { id: nextTurn as string },
        data: {
          balance: {
            decrement: 100,
          },
        },
      });
      return {
        result: [
          {
            event: EventTypes.DICE_RESULTS,
            payload: {
              userId,
              diceResults: [diceResult],
            },
          },
          {
            event: EventTypes.BOARD_STATE,
            payload: {
              roomId,
              players: Object.entries(updatedState).map(([id, position]) => ({
                userId: id,
                position,
              })),
              turn: nextTurn,
            },
          },
          {
            event: EventTypes.GAME_FINISHED,
            payload: {
              roomId,
              winner: userId,
            },
          },
        ],
      };
    }
    return {
      result: [
        {
          event: EventTypes.DICE_RESULTS,
          payload: {
            userId,
            diceResults: [diceResult],
          },
        },
        {
          event: EventTypes.BOARD_STATE,
          payload: {
            roomId,
            players: Object.entries(updatedState).map(([id, position]) => ({
              userId: id,
              position,
            })),
            turn: nextTurn,
          },
        },
      ],
    };
  }
  async abondonedGame(abondonedGameId:string,userId:string):Promise<any>{
    const getCurrentGameDetails = await prisma.game.findUnique({
      where:{
        id:abondonedGameId
      }
    })
    const opponentUserId = getCurrentGameDetails?.player1Id === userId ? getCurrentGameDetails.player2Id : getCurrentGameDetails?.player1Id
    await prisma.user.update({
      where:{
        id:userId
      },
      data:{
        balance:{decrement:100}
      } 
    })
    await prisma.user.update({
      where:{
        id:opponentUserId as string
      },
      data:{
        balance:{increment:100}
      } 
    })
    await prisma.game.update({
      where:{
        id:abondonedGameId
      },
      data:{
        status:"COMPLETED",
        winner:opponentUserId
      }
    })
    await prisma.gameHistory.createMany({
      data:[{
        result:"LOSE",
        moneyChange:-100,
        gameId:abondonedGameId,
        userId:userId
      },{
        result:"WIN",
        moneyChange:100,
        gameId:abondonedGameId,
        userId:opponentUserId as string
      }],
      skipDuplicates:true
    })
    return {result:`Game abondoned successfully! ${opponentUserId} is the winner`}
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }
}
export const lobbyManager = LobbyManager.getInstance();
