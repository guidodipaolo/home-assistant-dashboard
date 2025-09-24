import React, { useState, useEffect } from "react";
import { Power } from "lucide-react";
import { homeAssistantAPI } from "../services/homeAssistantApi";
import { useEntityState } from "../hooks/useEntityState";

interface SwitchCardProps {
  entityId: string;
  name: string;
}

const SwitchCard: React.FC<SwitchCardProps> = ({ entityId, name }) => {
  const { entityState, loading, error, setError } = useEntityState(entityId);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const isOn = entityState?.state === "on" || false;

  const toggleSwitch = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (isOn) {
        await homeAssistantAPI.turnOffSwitch(entityId);
      } else {
        await homeAssistantAPI.turnOnSwitch(entityId);
      }
      // El estado se actualizará automáticamente via websocket
    } catch (err) {
      console.error("Error toggling switch:", err);
      setError("Error al cambiar el estado del switch");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="glass-card"
      onClick={toggleSwitch}
      style={{ cursor: "pointer" }}
    >
      <div className="card-header">
        <div className="card-title-group">
          <div className={`card-icon ${isOn ? "switch-on" : "light-off"}`}>
            <Power
              style={{ color: isOn ? "#22c55e" : "rgba(255, 255, 255, 0.5)" }}
            />
          </div>
          <h3 className="card-title">{name}</h3>
        </div>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            color: "#ef4444",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          className="loading-indicator"
          style={{
            color: "#6b7280",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
          }}
        >
          Cargando...
        </div>
      )}
    </div>
  );
};

export default SwitchCard;
