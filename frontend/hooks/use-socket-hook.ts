import { WebSocketContext } from "@/providers/ws-provider";
import { useContext } from "react";

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
      throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
  }