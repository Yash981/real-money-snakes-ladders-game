import { EventTypes } from '@/lib/types/event-types';
import { create }  from 'zustand';
interface rolledDiceDetailsType{
  username:string;
  diceResults:number;
  nextPosition:number;
}
interface userStatusType{
  name:string;
  isActive:string;
}
type WebSocketStore = {
  boardState: any[];
  setboardState: (boardState: any[]) => void;
  rolledDiceDetails: rolledDiceDetailsType;
  setRolledDiceDetails: (rolledDiceDetails: rolledDiceDetailsType) => void;
  gamePlayers: string[];
  setGamePlayers: (gamePlayers: string[]) => void;
  usersStatus:userStatusType[] | null
  setUsersStatus:(userStatus:userStatusType[])=>void
};

const useWebSocketStore = create<WebSocketStore>((set) => ({
  boardState: [],
  setboardState: (boardState) => set({ boardState }),
  rolledDiceDetails: { username: '', diceResults: 0, nextPosition: 0 },
  setRolledDiceDetails: (rolledDiceDetails) => set({ rolledDiceDetails }),
  gamePlayers: [],
  setGamePlayers: (gamePlayers) => set({ gamePlayers }),
  usersStatus:null,
  setUsersStatus:(usersStatus) => set({usersStatus})
}));

export default useWebSocketStore;
