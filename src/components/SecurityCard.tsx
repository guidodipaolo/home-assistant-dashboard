import React from "react";
import { DoorOpen } from "lucide-react";
import { useEntityState } from "../hooks/useEntityState";
import AreaSection from "./AreaSection";

interface SecurityCardProps {
  entityId: string;
  name: string;
}

const SecurityCard: React.FC<SecurityCardProps> = ({ entityId, name }) => {
  const { entityState } = useEntityState(entityId);

  // Extract security data from entity state
  const isOpen = entityState?.state === "on" || false;
  const lastChanged = entityState?.last_changed;

  // Format the last changed date
  const formatLastChanged = (dateString: string) => {
    if (!dateString) {
      // If no date, use current date
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusInfo = () => {
    return {
      text: isOpen ? "Abierto" : "Cerrado",
      className: isOpen ? "open" : "closed",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="security-item">
      <div className="security-icon">
        <DoorOpen size={24} />
      </div>

      <div className="security-info">
        <h3 className="security-name">{name}</h3>
        <div className="security-timestamp">
          {formatLastChanged(lastChanged || "")}
        </div>
      </div>

      <div className={`security-status ${statusInfo.className}`}>
        {statusInfo.text}
      </div>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  return (
    <AreaSection title="Seguridad">
      <div className="security-grid">
        <SecurityCard
          entityId="binary_sensor.pasillo_sensor_puerta_contact"
          name="Puerta Pasillo"
        />
      </div>
    </AreaSection>
  );
};

export default SecuritySection;
