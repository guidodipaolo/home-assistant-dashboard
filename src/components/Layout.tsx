import React from "react";
import HeaderInfo from "./HeaderInfo";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isConnected, isConnecting } = useWebSocketConnection();

  return (
    <div className="generic-layout">
      {/* Header */}
      <div className="dashboard-header">
        <HeaderInfo />
        <div className="connection-status">
          <div
            className={`status-indicator ${
              isConnected
                ? "connected"
                : isConnecting
                ? "connecting"
                : "disconnected"
            }`}
          ></div>
          <span className="status-text">
            {isConnected
              ? "Conectado"
              : isConnecting
              ? "Conectando..."
              : "No conectado"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="layout-content">{children}</div>
    </div>
  );
};

export default Layout;
