import { EventTypes } from '@/lib/types/event-types';
import { create }  from 'zustand';
interface rolledDiceDetailsType{
  username:string;
  diceResults:number;
  nextPosition:number;
}
type WebSocketStore = {
  socketDetails:any;
  boardState: any;
  setboardState: (boardState: any) => void;
  rolledDiceDetails: rolledDiceDetailsType;
  setRolledDiceDetails: (rolledDiceDetails: rolledDiceDetailsType) => void;
  gamePlayers: string[];
  setGamePlayers: (gamePlayers: string[]) => void;
  setSocketDetails:(socketDetails:any) =>void

};

const useWebSocketStore = create<WebSocketStore>((set) => ({
  boardState:[],
  setboardState: (boardState) => set({ boardState }),
  rolledDiceDetails: {username:'',diceResults:0,nextPosition:0},
  setRolledDiceDetails: (rolledDiceDetails) => set({ rolledDiceDetails }),
  gamePlayers: [],
  setGamePlayers: (gamePlayers) => set({ gamePlayers }),
  socketDetails:null,
  setSocketDetails(socketDetails) {
    set({socketDetails})
  },
}));

export default useWebSocketStore;
