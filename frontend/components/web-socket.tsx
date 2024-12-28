"use client"
import React, { useEffect, useState, useRef, useContext,createContext } from "react";
import  { ClientMessage, EventTypes } from "@/lib/types/event-types";
import { Button } from "./ui/button";
interface WebSocketContextType {
  sendMessage: (event: EventTypes, payload: {roomId?:string,gameId?:string,abondonedGameId?:string}) => void;
  messages: string[] | null;
  connectionStatus: string | null;
}
const WebSocketContext = createContext<WebSocketContextType | null>(null);
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
const WebSocketProvider = () => {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [messages, setMessages] = useState<any>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to the WebSocket server
  useEffect(() => {
    console.log("Connecting to WebSocket server...",window.location.protocol);
    const ws = new WebSocket("ws://localhost:9000", ["access_token",'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJuZW9uMkBnbWFpbC5jb20iLCJpYXQiOjE3MzUzNjkzNDksImV4cCI6MTczNTQ1NTc0OX0.emSPxi3EjrDiErZeilymWRS2M73f8k-CQu7M4JcsD-o']);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("Connected");
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      if(typeof event.data !== 'string') return;
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("Disconnected");
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleServerMessage = (message: ClientMessage) => {
    switch (message.event) {
      case EventTypes.JOIN_GAME:
        console.log(message.payload,'joingame')
        setMessages((prev:any) => [
          ...prev,
          { event: "JOIN_GAME", payload: JSON.stringify(message.payload) },
        ]);
        break;
      case EventTypes.DICE_RESULTS:
        setMessages((prev:any) => [
          ...prev,
          { event: "DICE_RESULTS",payload:JSON.stringify(message.payload)},
        ]);
        break;
      case EventTypes.BOARD_STATE:
        setMessages((prev:any) => [
          ...prev,
          { event: "BOARD_STATE",payload:JSON.stringify(message.payload)},
        ]);
        break;
      case EventTypes.ERROR:
        console.log("Error:", message);
        setMessages((prev:any) => [
          ...prev,
          { event: "ERROR",payload:JSON.stringify(message.payload)},
        ]);
        break;
      default:
        console.log("Unknown event type:", message.event);
    }
  };

  // Send a message to the server
   const sendMessage = (event: EventTypes, payload: {roomId?:string,gameId?:string,abondonedGameId?:string}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, payload }));
    } else {
      console.error("WebSocket is not connected");
    }
  };
  console.log(messages,'messages')
  return (
    <div>
      <h1>WebSocket Client</h1>
      <p>Status: {connectionStatus} {connectionStatus==='Connected'? '🟢':'🔴'}</p>
      <div>
        <Button
          onClick={() =>
            sendMessage(EventTypes.JOIN_GAME, { gameId: "dfb6d296-0744-41ba-b4d3-125611cb9100" })
          }
          variant={"secondary"}

        >
          Join Game
        </Button>
        <Button
          onClick={() =>
            sendMessage(EventTypes.ROLL_DICE, { roomId: "dfb6d296-0744-41ba-b4d3-125611cb9100" })
          }
          variant={"secondary"}
        >
          Roll Dice
        </Button>
        <Button
          onClick={() =>
            sendMessage(EventTypes.ABANDON_GAME, { abondonedGameId: "dfb6d296-0744-41ba-b4d3-125611cb9100" })
          }
          variant={"secondary"}
        >
          Abandon Game
        </Button>
      </div>
      <h2 className="">Messages</h2>
      <ul className="flex flex-col gap-2">
        {messages.map((msg:any, index:number) => (
          <li key={index}>{msg.payload}</li>
        ))}
      </ul>
      <WebSocketContext.Provider value={{sendMessage,connectionStatus,messages}}>
        {/* <WebSocketClient /> */}
      </WebSocketContext.Provider>
    </div>
  );
};

export default WebSocketProvider;
