import React, { useState, useEffect } from "react";
import { Home, TestScreen, FloatingNavigation, Layout } from "./components";
import { useNavigation, ScreenType } from "./hooks/useNavigation";
import "./styles/navigation.css";

const App: React.FC = () => {
  const { currentScreen, navigateTo } = useNavigation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayScreen, setDisplayScreen] = useState<ScreenType>(currentScreen);

  // Efecto para manejar las transiciones de pantalla
  useEffect(() => {
    if (currentScreen !== displayScreen) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayScreen(currentScreen);
        setIsTransitioning(false);
      }, 150); // Duración de la animación de salida
      return () => clearTimeout(timer);
    }
  }, [currentScreen, displayScreen]);

  // Definir los elementos de navegación con Home en el centro (solo iconos)
  const navigationItems = [
    {
      id: "rooms" as ScreenType,
      label: "",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
        </svg>
      ),
      isActive: currentScreen === "rooms",
    },
    {
      id: "scenes" as ScreenType,
      label: "",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      isActive: currentScreen === "scenes",
    },
    {
      id: "home" as ScreenType,
      label: "",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
      isActive: currentScreen === "home",
    },
    {
      id: "camera" as ScreenType,
      label: "",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" />
        </svg>
      ),
      isActive: currentScreen === "camera",
    },
    {
      id: "more" as ScreenType,
      label: "",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
      isActive: currentScreen === "more",
    },
  ];

  // Renderizar la pantalla actual
  const renderCurrentScreen = () => {
    switch (displayScreen) {
      case "home":
        return (
          <Layout>
            <Home />
          </Layout>
        );
      case "rooms":
        return (
          <Layout>
            <TestScreen />
          </Layout>
        );
      case "scenes":
        return (
          <Layout>
            <TestScreen />
          </Layout>
        );
      case "camera":
        return (
          <Layout>
            <TestScreen />
          </Layout>
        );
      case "more":
        return (
          <Layout>
            <TestScreen />
          </Layout>
        );
      default:
        return (
          <Layout>
            <Home />
          </Layout>
        );
    }
  };

  return (
    <div className="App">
      <div
        className={`screen-container ${
          isTransitioning ? "fade-out" : "fade-in"
        }`}
      >
        {renderCurrentScreen()}
      </div>
      <FloatingNavigation
        items={navigationItems}
        onItemClick={(itemId) => navigateTo(itemId as ScreenType)}
      />
    </div>
  );
};

export default App;
