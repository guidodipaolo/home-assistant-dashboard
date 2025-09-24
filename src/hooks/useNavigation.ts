import { useState } from "react";

export type ScreenType = "home" | "rooms" | "scenes" | "camera" | "more";

export const useNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  return {
    currentScreen,
    navigateTo,
  };
};
