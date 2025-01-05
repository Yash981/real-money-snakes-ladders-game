"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { EventTypes, ClientMessage } from '../lib/types/event-types';
import { toast } from 'sonner';
import GameBoard from '@/components/game-board';
import useWebSocketStore from '@/state-management/ws-state';

interface WebSocketContextType {
  sendMessage: (message: ClientMessage) => void;
  connected: boolean;
  payload: ClientMessage | undefined;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { setboardState,setRolledDiceDetails,setGamePlayers,setSocketDetails} = useWebSocketStore()
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [payload, setPayload] = useState<ClientMessage>();
  const token = typeof window !== 'undefined' ? localStorage.getItem('wsToken') as string : null;
  
  useEffect(() => {
    if(!token) {
      return;
    }
    ws.current = new WebSocket(`ws://localhost:9000?token=${token}`);

    ws.current.onopen = () => {
      setConnected(true);
      toast.success('Successfully connected to game server');
    };

    ws.current.onclose = () => {
      setConnected(false);
      toast.error('Lost connection to game server');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    return () => {
      ws.current?.close();
    };
  }, [token]);

  const handleWebSocketMessage = (message: any) => {
    console.log(message, 'message at global')
    switch (message.event) {
      case EventTypes.GAME_STARTED:
        toast.success("Game Started");
        if(typeof window !== 'undefined') sessionStorage.setItem('gameId', message.gameId);
        setSocketDetails(message.playersSockets)
        setGamePlayers(message.gameStarted);
        setPayload({
          event: message.event,
          payload:message.gameId
        }); 
        break;
      case EventTypes.GAME_ADDED:
        toast.success("Game Added");
        setPayload({
          event: message.event,
          payload:message.payload
        });
        break
      case EventTypes.GAME_FINISHED:
        toast.info("Game Over");
        break;
      case EventTypes.DICE_RESULTS:
        setRolledDiceDetails(message.diceResult);
        break; 
      case EventTypes.BOARD_STATE:
        setboardState(message.playerPositions);
        setPayload({
          event: message.event,
          payload:message.playerPositions
        });
        break;
      case EventTypes.ERROR:
        toast.error(`Error ${message.error}`,);
        break;
    }
  };

  const sendMessage = (message: ClientMessage) => {
    console.log(message, 'message send message')
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };
  console.log(connected, 'connected')
  return (
    <WebSocketContext.Provider value={{ sendMessage, connected,payload }}>
      {children}
    </WebSocketContext.Provider>
  );
}