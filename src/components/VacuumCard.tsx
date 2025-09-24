import React, { useState } from "react";
import {
  RotateCcw,
  Play,
  Pause,
  Home,
  Utensils,
  Bed,
  DoorOpen,
  Bath,
  Toilet,
} from "lucide-react";
import { homeAssistantAPI } from "../services/homeAssistantApi";
import { useEntityState } from "../hooks/useEntityState";

interface VacuumCardProps {
  entityId: string;
}

const VacuumCard: React.FC<VacuumCardProps> = ({ entityId }) => {
  const { entityState, loading, error, setError } = useEntityState(entityId);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // Extract vacuum data from entity state
  const status =
    (entityState?.state as
      | "docked"
      | "cleaning"
      | "paused"
      | "returning"
      | "idle") || "docked";

  // Check if vacuum is charging (no direct battery level available)
  const isCharging = entityState?.attributes?.charging || false;
  const battery = entityState?.attributes?.battery_level || null;
  // Room configuration with segments from Home Assistant
  const roomConfig = [
    { name: "Baño", segment: 1, icon: <Bath size={20} /> },
    { name: "Dormitorio", segment: 2, icon: <Bed size={20} /> },
    { name: "Toilette", segment: 3, icon: <Toilet size={20} /> },
    { name: "Comedor", segment: 5, icon: <Utensils size={20} /> },
    { name: "Pasillo", segment: 7, icon: <DoorOpen size={20} /> },
  ];

  // Function to get segment for a room
  const getRoomSegment = (roomName: string) => {
    const room = roomConfig.find((r) => r.name === roomName);
    return room ? room.segment : null;
  };

  const getStatusInfo = () => {
    switch (status) {
      case "cleaning":
        return { text: "Limpiando", className: "cleaning" };
      case "paused":
        return { text: "Pausada", className: "paused" };
      case "returning":
        return { text: "Regresando", className: "returning" };
      case "idle":
        return { text: "Inactiva", className: "docked" };
      default:
        return { text: "En Base", className: "docked" };
    }
  };

  const statusInfo = getStatusInfo();

  const startCleaning = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (selectedRooms.length > 0) {
        // Clean specific rooms using segments
        const segments = selectedRooms
          .map((room) => getRoomSegment(room))
          .filter((segment) => segment !== null);

        if (segments.length > 0) {
          await homeAssistantAPI.callService(
            "dreame_vacuum",
            "vacuum_clean_segment",
            entityId,
            {
              segments: segments,
            }
          );
        }
      } else {
        // Clean all
        await homeAssistantAPI.callService("vacuum", "start", entityId);
      }
      // State will be updated automatically via websocket
    } catch (err) {
      console.error("Error starting cleaning:", err);
      setError("Error al iniciar la limpieza");
    } finally {
      setActionLoading(false);
    }
  };

  const pauseCleaning = async () => {
    try {
      setActionLoading(true);
      setError(null);

      await homeAssistantAPI.callService("vacuum", "pause", entityId);
      // State will be updated automatically via websocket
    } catch (err) {
      console.error("Error pausing cleaning:", err);
      setError("Error al pausar la limpieza");
    } finally {
      setActionLoading(false);
    }
  };

  const returnToBase = async () => {
    try {
      setActionLoading(true);
      setError(null);

      await homeAssistantAPI.callService("vacuum", "return_to_base", entityId);
      // State will be updated automatically via websocket
    } catch (err) {
      console.error("Error returning to base:", err);
      setError("Error al regresar a la base");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  return (
    <div className="glass-card">
      <div className="vacuum-status">
        <div className="status-info">
          <div
            className={`card-icon vacuum ${
              status === "cleaning" ? "cleaning" : ""
            }`}
          >
            {isCharging ? (
              <Home style={{ color: "#6b7280" }} />
            ) : status === "docked" ? (
              <Home style={{ color: "#6b7280" }} />
            ) : (
              <RotateCcw style={{ color: "#3b82f6" }} />
            )}
          </div>
          <div>
            <h3 className="card-title">Aspiradora Enzo</h3>
            <div className={`status-text ${statusInfo.className}`}>
              {statusInfo.text}
            </div>
          </div>
        </div>

        <div className="battery-info">
          <div className="battery-label">Batería</div>
          <div className="battery-value">
            {battery !== null && battery !== undefined
              ? `${battery}%`
              : isCharging
              ? "Cargando"
              : "--%"}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            color: "#ef4444",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
            marginBottom: "1rem",
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
            marginBottom: "1rem",
          }}
        >
          Cargando...
        </div>
      )}

      <div className="rooms-icons-line">
        <div className="rooms-label">Áreas disponibles</div>
        <div className="rooms-icons-container">
          {roomConfig.map((room) => (
            <div
              key={room.name}
              className={`room-icon-item ${
                selectedRooms.includes(room.name) ? "selected" : ""
              }`}
              onClick={() => toggleRoom(room.name)}
              title={room.name}
            >
              {room.icon}
            </div>
          ))}
        </div>
      </div>

      <div className="vacuum-controls">
        {status !== "cleaning" && (
          <button
            onClick={startCleaning}
            disabled={loading || actionLoading}
            className="control-button start"
          >
            <Play size={16} />
            Limpiar
          </button>
        )}

        {status === "cleaning" && (
          <button
            onClick={pauseCleaning}
            disabled={loading || actionLoading}
            className="control-button pause"
          >
            <Pause size={16} />
            Pausar
          </button>
        )}

        <button
          onClick={returnToBase}
          disabled={loading || actionLoading}
          className="control-button home"
        >
          <Home size={16} />
          Base
        </button>
      </div>
    </div>
  );
};

export default VacuumCard;
