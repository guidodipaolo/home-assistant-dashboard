import React, { useState, useEffect } from "react";
import { Cloud } from "lucide-react";
import PresenceIndicator from "./PresenceIndicator";
import { usePresenceState } from "../hooks/usePresenceState";

const HeaderInfo: React.FC = () => {
  const [timeData, setTimeData] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [weather] = useState<{
    temperature: number;
    condition: string;
  }>({
    temperature: 24,
    condition: "Soleado",
  });

  // Obtener datos reales de presencia desde Home Assistant
  const { people, isLoading, error } = usePresenceState();

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      setTimeData({
        hours,
        minutes,
        seconds,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="header-info">
      <div className="time-info-simple desktop-only">
        <div className="time-display">
          <span className="time-main">
            {timeData.hours}:{timeData.minutes}
          </span>
          <span className="time-seconds">{timeData.seconds}</span>
        </div>
      </div>
      {!isLoading && !error && <PresenceIndicator people={people} />}
      <div className="weather-info">
        <Cloud size={16} className="text-white" />
        <span className="weather-text">
          Olivos, BA - {weather.temperature}°C
        </span>
      </div>
    </div>
  );
};

export default HeaderInfo;
