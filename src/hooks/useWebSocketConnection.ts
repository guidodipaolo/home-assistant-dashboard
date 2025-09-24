import { useState, useEffect } from "react";
import {
  websocketService,
  ConnectionStatus,
} from "../services/websocketService";

export const useWebSocketConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: false,
  });

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = websocketService.onConnectionStatusChange((status) => {
      setConnectionStatus(status);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const reconnect = () => {
    websocketService.reconnect();
  };

  const disconnect = () => {
    websocketService.disconnect();
  };

  return {
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    isConnecting: connectionStatus.isConnecting,
    error: connectionStatus.error,
    lastConnected: connectionStatus.lastConnected,
    reconnect,
    disconnect,
  };
};
