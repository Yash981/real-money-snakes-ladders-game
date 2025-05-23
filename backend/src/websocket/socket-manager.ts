import { randomUUID } from "crypto";
import { userJwtClaims } from "../types/event-types";
import { WebSocket } from "ws";
export class User {
  public socket: WebSocket;
  public id: string;
  public name: string;

  constructor(socket: WebSocket, userJwtClaims: userJwtClaims) {
    this.socket = socket;
    this.name = userJwtClaims.userId;
    this.id = randomUUID();
  }
}
class SocketManager {
  private static instance: SocketManager;
  private interestedSockets: Map<string, User[]>;
  private userRoomMapping: Map<string, string>;

  private constructor() {
    this.interestedSockets = new Map();
    this.userRoomMapping = new Map();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public addUser(room: string, user: User): void {
    if (!this.interestedSockets.has(room)) {
      this.interestedSockets.set(room, []);
    }
    this.interestedSockets.get(room)?.push(user);
    this.userRoomMapping.set(user.id, room);
  }

  public broadcast(room: string, message: any): void {
    const users = this.interestedSockets.get(room);
    if (users) {
      users.forEach((user) => {
        try {
          if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(message);
          } else {
            console.warn(`Socket for user ${user.name} is not open.`);
          }
        } catch (error) {
          console.error(`Error sending message to user ${user.name}:`, error);
        }
      });
    }
    this.getSocketsRoomDetails();
  }

  public removeUser(userId: string): void {
    const room = this.userRoomMapping.get(userId);
    if (room) {
      const users = this.interestedSockets.get(room);
      if (users) {
        this.interestedSockets.set(
          room,
          users.filter((user) => user.id !== userId)
        );
      }
      this.userRoomMapping.delete(userId);
    }
  }
  getSocketsRoomDetails() {
    console.log("Interested Sockets:");
    this.interestedSockets.forEach((users, key) => {
      console.log(`Key (Room ID): ${key}`);
      users.forEach((user) => {
        console.log(`User Name: ${user.name},  ID: ${user.id}`);
      });
    });
    console.log("User Room Mapping:");
    this.userRoomMapping.forEach((room, userId) => {
      console.log(`User ID: ${userId} is in Room ID: ${room}`);
    });
  }
  getPlayerNamesIntheRoom(roomId: string) {
    const PlayerNames:string[] = []
    this.interestedSockets.forEach((users, key) => {
      if (key === roomId) {
        users.forEach((user) => {
          PlayerNames.push(`${user.name}`);
        });
      }
    });
    return PlayerNames;
  }
  getUserSocketByroomId(roomId:string){
    return this.interestedSockets.get(roomId)
  }
  getInterestedSockets(){
    return this.interestedSockets
  }
  updateUserSocket(roomId: string, username: string, newSocket: WebSocket) {
    const room = this.interestedSockets.get(roomId);
    if (room) {
      const existingUserIndex = room.findIndex(user => user.name === username);
      if (existingUserIndex !== -1) {
        room[existingUserIndex].socket = newSocket;
      } else {
        room.push(new User(newSocket, { userId: username }));
      }
    }
  }
}

export const socketManager = SocketManager.getInstance();
