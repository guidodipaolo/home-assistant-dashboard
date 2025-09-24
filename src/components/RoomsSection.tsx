import React from "react";
import {
  ChefHat,
  Utensils,
  Thermometer,
  Droplets,
  DoorOpen,
} from "lucide-react";
import { useEntityState } from "../hooks/useEntityState";
import AreaSection from "./AreaSection";

interface Room {
  id: string;
  name: string;
  icon: React.ReactNode;
  temperatureEntityId?: string;
  humidityEntityId?: string;
  devices: number;
}

const RoomsSection: React.FC = () => {
  // Room data with Home Assistant entity IDs and actual device counts (excluding sensors)
  const rooms: Room[] = [
    {
      id: "cocina",
      name: "Cocina",
      icon: <ChefHat size={24} />,
      humidityEntityId: "sensor.cocina_termometro_humidity",
      temperatureEntityId: "sensor.cocina_termometro_temperature",
      devices: 1, // Solo Tira LED (sin contar sensores)
    },
    {
      id: "comedor",
      name: "Comedor",
      icon: <Utensils size={24} />,
      humidityEntityId: "sensor.comedor_termometro_humidity",
      temperatureEntityId: "sensor.comedor_termometro_temperature",
      devices: 4, // Globo + Velador + TV + Aspiradora (sin contar sensores)
    },
    {
      id: "pasillo",
      name: "Pasillo",
      icon: <DoorOpen size={24} />,
      devices: 0, // Sin dispositivos de control (solo sensor binario)
    },
  ];

  // Filter out rooms with 0 devices
  const roomsWithDevices = rooms.filter((room) => room.devices > 0);

  return (
    <AreaSection title="Cuartos">
      <div className="rooms-grid">
        {roomsWithDevices.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </AreaSection>
  );
};

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { entityState: temperatureState } = useEntityState(
    room.temperatureEntityId || ""
  );
  const { entityState: humidityState } = useEntityState(
    room.humidityEntityId || ""
  );

  const temperature = temperatureState?.state
    ? parseFloat(temperatureState.state)
    : null;
  const humidity = humidityState?.state
    ? parseFloat(humidityState.state)
    : null;

  const hasSensors = room.temperatureEntityId && room.humidityEntityId;

  return (
    <div className="room-card">
      <div className="room-header">
        <div className="room-icon">{room.icon}</div>
        <div className="room-info">
          <h3 className="room-name">{room.name}</h3>
          {hasSensors && (
            <div className="room-metrics">
              <div className="room-metric">
                <Thermometer size={14} />
                <span className="metric-value">
                  {temperature !== null
                    ? `${temperature.toFixed(1)}°C`
                    : "--°C"}
                </span>
              </div>
              <div className="room-metric">
                <Droplets size={14} />
                <span className="metric-value">
                  {humidity !== null ? `${humidity.toFixed(0)}%` : "--%"}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="room-devices">
          {room.devices} {room.devices === 1 ? "dispositivo" : "dispositivos"}
        </div>
      </div>
    </div>
  );
};

export default RoomsSection;
