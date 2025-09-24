import React, { useState } from "react";
import LightModal from "./LightModal";
import RoomsSection from "./RoomsSection";
import SecuritySection from "./SecurityCard";
import KitchenSection from "./KitchenSection";
import LivingSection from "./LivingSection";

// Home Dashboard Component
const Home: React.FC = () => {
  // State for light modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    entityId: string;
    name: string;
    entityState: any;
  }>({
    isOpen: false,
    entityId: "",
    name: "",
    entityState: null,
  });

  // Functions to handle modal
  const handleOpenModal = (
    entityId: string,
    name: string,
    entityState: any
  ) => {
    setModalState({
      isOpen: true,
      entityId,
      name,
      entityState,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      entityId: "",
      name: "",
      entityState: null,
    });
  };

  const handleModalStateChange = () => {
    // This function can be used to force a state update
    // The websocket should handle this automatically
  };

  return (
    <div className="dashboard-container">
      {/* Main Grid */}
      <div className="main-grid">
        {/* Rooms Section */}
        <RoomsSection />

        {/* Kitchen Section */}
        <KitchenSection onOpenModal={handleOpenModal} />

        {/* Living Room Section */}
        <LivingSection onOpenModal={handleOpenModal} />

        {/* Security Section */}
        <SecuritySection />
      </div>

      {/* Light Modal */}
      <LightModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        entityId={modalState.entityId}
        name={modalState.name}
        entityState={modalState.entityState}
        onStateChange={handleModalStateChange}
      />
    </div>
  );
};

export default Home;
