import React from "react";
import LightCard from "./LightCard";
import SwitchCard from "./SwitchCard";
import MediaPlayerCard from "./MediaPlayerCard";
import VacuumCard from "./VacuumCard";
import AreaSection from "./AreaSection";

interface LivingSectionProps {
  onOpenModal: (entityId: string, name: string, entityState: any) => void;
}

const LivingSection: React.FC<LivingSectionProps> = ({ onOpenModal }) => {
  return (
    <AreaSection title="Comedor">
      <LightCard
        entityId="light.globo_comedor"
        name="Globo Comedor"
        onOpenModal={onOpenModal}
      />

      <SwitchCard entityId="switch.velador" name="Velador" />

      <MediaPlayerCard entityId="media_player.televisor_2" />
      <VacuumCard entityId="vacuum.enzo" />
    </AreaSection>
  );
};

export default LivingSection;
