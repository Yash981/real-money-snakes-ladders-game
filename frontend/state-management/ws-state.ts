import { EventTypes } from '@/lib/types/event-types';
import { create }  from 'zustand';

type WebSocketStore = {
  // wsRef: WebSocket | null;
  // setWsRef: (ws: WebSocket | null) => void;
  // sendMessage: (event: EventTypes, payload: { roomId?: string; gameId?: string; abandonedGameId?: string }) => void;
  boardState: any;
  setboardState: (boardState: any) => void;
};

const useWebSocketStore = create<WebSocketStore>((set) => ({
  boardState:[],
  setboardState: (boardState) => set({ boardState }),
  // wsRef: null,
  // setWsRef: (ws) => set({ wsRef: ws }),
  // sendMessage: (event, payload) => {
  //   set((state) => {
  //     const ws = state.wsRef;
  //     if (ws?.readyState === WebSocket.OPEN) {
  //       console.log(JSON.stringify({ event, payload }),'state')
  //       ws.send(JSON.stringify({ event, payload }));
  //     } else {
  //       console.error("WebSocket is not connected");
  //     }
  //     return state;
  //   });
  // },
}));

export default useWebSocketStore;
