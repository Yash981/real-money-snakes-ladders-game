import { EventTypes } from '@/lib/types/event-types';
import { create }  from 'zustand';
interface rolledDiceDetailsType{
  username:string;
  currentPosition:number;
  diceResults:number;
  nextPosition:number;
}
interface PlayersTurnIndex{
  username:string,
  turnIndex:number
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
  setUsersStatus:(userStatus:userStatusType[] | null)=>void
  playerTurnIndex:PlayersTurnIndex[]
  setPlayerTurnIndex:(playerTurnIndex:PlayersTurnIndex[]) => void
};

const useWebSocketStore = create<WebSocketStore>((set) => ({
  boardState: [],
  setboardState: (boardState) => set({ boardState }),
  rolledDiceDetails: { username: '',currentPosition:0, diceResults: 0, nextPosition: 0 },
  setRolledDiceDetails: (rolledDiceDetails) => set({ rolledDiceDetails }),
  gamePlayers: [],
  setGamePlayers: (gamePlayers) => set({ gamePlayers }),
  usersStatus:null,
  setUsersStatus:(usersStatus) => set({usersStatus}),
  playerTurnIndex:[],
  setPlayerTurnIndex: (playerTurnIndex) => set({ playerTurnIndex})
}));

export default useWebSocketStore;
