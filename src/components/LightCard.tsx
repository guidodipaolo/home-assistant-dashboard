import React, { useState, useEffect, useRef } from "react";
import { Lightbulb } from "lucide-react";
import { homeAssistantAPI } from "../services/homeAssistantApi";
import { useEntityState } from "../hooks/useEntityState";

interface LightCardProps {
  entityId: string;
  name: string;
  onOpenModal: (entityId: string, name: string, entityState: any) => void;
}

const LightCard: React.FC<LightCardProps> = ({
  entityId,
  name,
  onOpenModal,
}) => {
  const { entityState, loading, error, setError } = useEntityState(entityId);
  const [visualBrightness, setVisualBrightness] = useState<number>(50);
  const [lastKnownBrightness, setLastKnownBrightness] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartBrightness, setDragStartBrightness] = useState<number>(50);
  const [hasMoved, setHasMoved] = useState<boolean>(false);
  const [shouldPreventClick, setShouldPreventClick] = useState<boolean>(false);
  const [isUpdatingBrightness, setIsUpdatingBrightness] =
    useState<boolean>(false);
  const lastKnownBrightnessRef = useRef<number>(50);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update local state when entity state changes
  useEffect(() => {
    if (entityState && !isDragging && !isUpdatingBrightness) {
      const haBrightness = entityState.attributes.brightness;
      if (haBrightness !== undefined && haBrightness !== null) {
        const percentageBrightness = Math.round((haBrightness / 255) * 100);
        setVisualBrightness(percentageBrightness);
        setLastKnownBrightness(percentageBrightness);
        lastKnownBrightnessRef.current = percentageBrightness;
      } else {
        const lastBrightness = lastKnownBrightnessRef.current;
        setVisualBrightness(lastBrightness);
      }
    }
  }, [entityState, isDragging, isUpdatingBrightness]);

  const isOn = entityState?.state === "on" || false;

  // Function to get the light color from entity state
  const getLightColor = (): string => {
    if (!entityState || !isOn) {
      return "#eab308";
    }

    const attributes = entityState.attributes;

    if (
      attributes.rgb_color &&
      Array.isArray(attributes.rgb_color) &&
      attributes.rgb_color.length === 3
    ) {
      const [r, g, b] = attributes.rgb_color;
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (
      attributes.hs_color &&
      Array.isArray(attributes.hs_color) &&
      attributes.hs_color.length === 2
    ) {
      const [h, s] = attributes.hs_color;
      return hslToRgb(h, s, 50);
    }

    return "#eab308";
  };

  // Helper function to convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
      b * 255
    )})`;
  };

  // Function to get RGB values from color string for CSS
  const getRgbValues = (
    colorString: string
  ): { r: number; g: number; b: number } => {
    if (colorString.startsWith("rgb(")) {
      const values = colorString.match(/\d+/g);
      if (values && values.length >= 3) {
        return {
          r: parseInt(values[0]),
          g: parseInt(values[1]),
          b: parseInt(values[2]),
        };
      }
    }
    return { r: 234, g: 179, b: 8 };
  };

  // Function to get dynamic styles for the card
  const getCardStyles = (): React.CSSProperties => {
    if (!isOn) {
      return {
        background: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)`,
      };
    }

    const lightColor = getLightColor();
    const { r, g, b } = getRgbValues(lightColor);
    const brightnessPercent = visualBrightness;

    return {
      background: `linear-gradient(to right, 
        rgba(${r}, ${g}, ${b}, ${(brightnessPercent / 100) * 0.6}) 0%, 
        rgba(${r}, ${g}, ${b}, ${
        (brightnessPercent / 100) * 0.4
      }) ${brightnessPercent}%, 
        rgba(255, 255, 255, 0.1) ${brightnessPercent}%, 
        rgba(255, 255, 255, 0.1) 100%)`,
      boxShadow: `0 4px 20px rgba(${r}, ${g}, ${b}, ${
        (brightnessPercent / 100) * 0.4
      })`,
    };
  };

  // Function to get dynamic styles for the card icon
  const getCardIconStyles = (): React.CSSProperties => {
    if (!isOn) {
      return {};
    }

    const lightColor = getLightColor();
    const { r, g, b } = getRgbValues(lightColor);

    return {
      background: `rgba(${r}, ${g}, ${b}, 0.3)`,
      boxShadow: `0 4px 20px rgba(${r}, ${g}, ${b}, 0.2)`,
    };
  };

  const toggleLight = async () => {
    if (isDragging || hasMoved || shouldPreventClick) return; // No toggle while dragging or if moved

    try {
      setError(null);

      if (isOn) {
        await homeAssistantAPI.turnOffLight(entityId);
      } else {
        await homeAssistantAPI.turnOnLight(entityId, lastKnownBrightness);
      }
    } catch (err) {
      console.error("Error toggling light:", err);
      setError("Error al cambiar el estado de la luz");
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenModal(entityId, name, entityState);
  };

  const handleBrightnessCommit = async (newBrightness: number) => {
    if (isOn) {
      try {
        setError(null);
        setIsUpdatingBrightness(true);
        await homeAssistantAPI.setBrightness(entityId, newBrightness);
      } catch (err) {
        console.error("Error changing brightness:", err);
        setError("Error al cambiar el brillo");
      } finally {
        // Reset after a longer delay to prevent flicker
        setTimeout(() => {
          setIsUpdatingBrightness(false);
          setIsDragging(false);
        }, 300);
      }
    } else {
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
    }
  };

  // Mouse events for brightness control
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOn) return;

    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    setShouldPreventClick(false);
    setDragStartX(e.clientX);
    setDragStartBrightness(visualBrightness);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isOn) return;

    e.preventDefault();
    const deltaX = e.clientX - dragStartX;

    // Only start dragging if moved more than 5 pixels
    if (Math.abs(deltaX) > 5) {
      setHasMoved(true);
      setShouldPreventClick(true);
    }

    const sensitivity = 3; // Increased sensitivity to reduce flicker
    const brightnessChange = Math.round(deltaX / sensitivity);
    const newBrightness = Math.max(
      1,
      Math.min(100, dragStartBrightness + brightnessChange)
    );

    // Only update if brightness actually changed to reduce flicker
    if (newBrightness !== visualBrightness) {
      setVisualBrightness(newBrightness);
      setLastKnownBrightness(newBrightness);
      lastKnownBrightnessRef.current = newBrightness;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    if (hasMoved) {
      handleBrightnessCommit(visualBrightness);
    }
    setIsDragging(false);
    setHasMoved(false);

    // Reset shouldPreventClick after a short delay to allow click event to be prevented
    setTimeout(() => {
      setShouldPreventClick(false);
    }, 50);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOn) return;

    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    setShouldPreventClick(false);
    setDragStartX(e.touches[0].clientX);
    setDragStartBrightness(visualBrightness);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isOn) return;

    e.preventDefault();
    const deltaX = e.touches[0].clientX - dragStartX;

    // Only start dragging if moved more than 5 pixels
    if (Math.abs(deltaX) > 5) {
      setHasMoved(true);
      setShouldPreventClick(true);
    }

    const sensitivity = 3; // Increased sensitivity to reduce flicker
    const brightnessChange = Math.round(deltaX / sensitivity);
    const newBrightness = Math.max(
      1,
      Math.min(100, dragStartBrightness + brightnessChange)
    );

    // Only update if brightness actually changed to reduce flicker
    if (newBrightness !== visualBrightness) {
      setVisualBrightness(newBrightness);
      setLastKnownBrightness(newBrightness);
      lastKnownBrightnessRef.current = newBrightness;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    if (hasMoved) {
      handleBrightnessCommit(visualBrightness);
    }
    setIsDragging(false);
    setHasMoved(false);

    // Reset shouldPreventClick after a short delay to allow click event to be prevented
    setTimeout(() => {
      setShouldPreventClick(false);
    }, 50);
  };

  return (
    <div
      ref={cardRef}
      className="glass-card light-card-slider"
      style={getCardStyles()}
      onClick={toggleLight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="card-header">
        <div className="card-title-group">
          <div
            className={`card-icon ${isOn ? "light-on" : "light-off"}`}
            style={getCardIconStyles()}
            onClick={handleIconClick}
          >
            <Lightbulb style={{ color: getLightColor() }} />
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

export default LightCard;
