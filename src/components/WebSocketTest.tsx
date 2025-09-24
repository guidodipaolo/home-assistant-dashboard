import React, { useState, useEffect } from "react";
import { websocketService } from "../services/websocketService";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

const WebSocketTest: React.FC = () => {
  const { isConnected, isConnecting, error, lastConnected } =
    useWebSocketConnection();
  const [states, setStates] = useState<any[]>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = websocketService.onStateChanged((event) => {
      setLastEvent(event);
    });

    return unsubscribe;
  }, []);

  const fetchStates = async () => {
    try {
      const statesData = await websocketService.getStates();
      setStates(statesData.slice(0, 10)); // Show first 10 states
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const testConnection = () => {
    websocketService.reconnect();
  };

  const showDebugInfo = () => {
    const debugInfo = websocketService.getDebugInfo();
    console.log("WebSocket Debug Info:", debugInfo);
    alert(
      `Debug info logged to console. Check browser console for details.\n\nQuick check:\n- Has Token: ${debugInfo.config.hasToken}\n- Token Length: ${debugInfo.config.tokenLength}\n- WebSocket URL: ${debugInfo.websocket.url}`
    );
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "24px",
        padding: "24px",
        margin: "24px",
        color: "white",
      }}
    >
      <h3>WebSocket Connection Test</h3>

      <div style={{ marginBottom: "16px" }}>
        <strong>Status:</strong>{" "}
        {isConnected
          ? "✅ Connected"
          : isConnecting
          ? "🔄 Connecting..."
          : "❌ Disconnected"}
      </div>

      {error && (
        <div style={{ marginBottom: "16px", color: "#ef4444" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {lastConnected && (
        <div
          style={{ marginBottom: "16px", color: "rgba(255, 255, 255, 0.7)" }}
        >
          <strong>Last Connected:</strong> {lastConnected.toLocaleString()}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={testConnection}
          style={{
            background: "rgba(59, 130, 246, 0.2)",
            color: "white",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            marginRight: "8px",
          }}
        >
          Test Connection
        </button>

        <button
          onClick={fetchStates}
          disabled={!isConnected}
          style={{
            background: isConnected
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
            color: isConnected ? "white" : "rgba(255, 255, 255, 0.5)",
            border: isConnected
              ? "1px solid rgba(34, 197, 94, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: isConnected ? "pointer" : "not-allowed",
            marginRight: "8px",
          }}
        >
          Fetch States
        </button>

        <button
          onClick={showDebugInfo}
          style={{
            background: "rgba(168, 85, 247, 0.2)",
            color: "white",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Debug Info
        </button>
      </div>

      {lastEvent && (
        <div style={{ marginBottom: "16px" }}>
          <strong>Last State Change:</strong>
          <pre
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto",
              maxHeight: "200px",
            }}
          >
            {JSON.stringify(lastEvent, null, 2)}
          </pre>
        </div>
      )}

      {states.length > 0 && (
        <div>
          <strong>Sample States:</strong>
          <pre
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto",
              maxHeight: "300px",
            }}
          >
            {JSON.stringify(states, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WebSocketTest;
