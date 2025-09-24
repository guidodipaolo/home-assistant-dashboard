import React from "react";
import LightCard from "./LightCard";
import AreaSection from "./AreaSection";

interface KitchenSectionProps {
  onOpenModal: (entityId: string, name: string, entityState: any) => void;
}

const KitchenSection: React.FC<KitchenSectionProps> = ({ onOpenModal }) => {
  return (
    <AreaSection title="Cocina">
      <LightCard
        entityId="light.cocina_tira_led"
        name="Tira LED"
        onOpenModal={onOpenModal}
      />
    </AreaSection>
  );
};

export default KitchenSection;
