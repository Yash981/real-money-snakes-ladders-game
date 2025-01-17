"use client"
import React, { createContext, useEffect, useRef, useState } from 'react';
import { EventTypes, ClientMessage } from '../lib/types/event-types';
import { toast } from 'sonner';
import useWebSocketStore from '@/state-management/ws-state';
import { useRouter } from 'next/navigation';
import useDialogStore from '@/state-management/dialog-state';

interface WebSocketContextType {
  sendMessage: (message: ClientMessage) => void;
  connected: boolean;
  payload: ClientMessage | undefined;
  ws: WebSocket | null;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { setboardState,setRolledDiceDetails,setGamePlayers,setUsersStatus,setPlayerTurnIndex} = useWebSocketStore()
  const {setOpenDialog} = useDialogStore()
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [payload, setPayload] = useState<ClientMessage>();
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('wsToken') as string : null;
  
  useEffect(() => {
    if(!token) {
      return;
    }
    ws.current = new WebSocket(`ws://localhost:9000?token=${token}`);
    
    ws.current.onopen = function (this,event) {
      setConnected(true);
      toast.success('Successfully connected to game server');
    };

    ws.current.onclose = () => {
      setConnected(false);
      toast.error('Lost connection to game server');
    };

    ws.current.onmessage = function (this,event) {
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
        setGamePlayers(message.gameStarted);
        setPlayerTurnIndex(message.nextPlayerTurnIndex.turnIndex)
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
      case EventTypes.GAME_WINNER:
        setOpenDialog(true)
        setPayload({
          event:message.event,
          payload:message.winner
        })
        break;
      case EventTypes.GAME_LOSSER:
        setOpenDialog(true)
        setPayload({
          event:message.event,
          payload:message.losser
        })
        break;
      case EventTypes.DICE_RESULTS:
        setRolledDiceDetails(message.diceResult);
        setPlayerTurnIndex(message.diceResult.nextPlayerTurn)
        break; 
      case EventTypes.BOARD_STATE:
        setboardState(message.playerPositions);
        setPayload({
          event: message.event,
          payload:message.playerPositions
        });
        break;
      case EventTypes.GAME_RESUME:
        setboardState(message.playerPositions);
        setPayload({
          event: message.event,
          payload:message.playerPositions
        });
        break
      case EventTypes.USER_STATUS:
        setUsersStatus(null)
        setUsersStatus(message.payload)
        setPayload({
          event:message.event,
          payload:message.payload
        })
        break;
      case EventTypes.ERROR:
        toast.error(`Error ${message.error}`,);
        break;
    }
  };

  const sendMessage = (message: ClientMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };
  return (
    <WebSocketContext.Provider value={{ sendMessage, connected, payload, ws: ws.current }}>
      {children}
    </WebSocketContext.Provider>
  );
}