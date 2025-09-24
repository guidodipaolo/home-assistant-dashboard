import React, { useState, useEffect } from "react";
import { X, Power, Settings, Palette, Thermometer } from "lucide-react";
import { homeAssistantAPI } from "../services/homeAssistantApi";

interface LightModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  name: string;
  entityState: any;
  onStateChange: () => void;
}

const LightModal: React.FC<LightModalProps> = ({
  isOpen,
  onClose,
  entityId,
  name,
  entityState,
  onStateChange,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>("#eab308");
  const [activeTab, setActiveTab] = useState<
    "settings" | "color" | "temperature"
  >("settings");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const isOn = entityState?.state === "on" || false;

  // Update local state when entity state changes
  useEffect(() => {
    if (entityState) {
      // Update color from entity state
      const attributes = entityState.attributes;
      if (
        attributes.rgb_color &&
        Array.isArray(attributes.rgb_color) &&
        attributes.rgb_color.length === 3
      ) {
        const [r, g, b] = attributes.rgb_color;
        setSelectedColor(`rgb(${r}, ${g}, ${b})`);
      }
    }
  }, [entityState]);

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

  const toggleLight = async () => {
    try {
      setActionLoading(true);
      if (isOn) {
        await homeAssistantAPI.turnOffLight(entityId);
      } else {
        await homeAssistantAPI.turnOnLight(entityId);
      }
      onStateChange();
    } catch (err) {
      console.error("Error toggling light:", err);
    } finally {
      setActionLoading(false);
    }
  };


  const handleColorChange = async (color: string) => {
    setSelectedColor(color);
    if (isOn) {
      try {
        // Convert hex to RGB
        const hex = color.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        await homeAssistantAPI.setColor(entityId, [r, g, b]);
        onStateChange();
      } catch (err) {
        console.error("Error changing color:", err);
      }
    }
  };

  const handlePresetColor = async (color: string) => {
    setSelectedColor(color);
    if (isOn) {
      try {
        const hex = color.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        await homeAssistantAPI.setColor(entityId, [r, g, b]);
        onStateChange();
      } catch (err) {
        console.error("Error setting preset color:", err);
      }
    }
  };

  const presetColors = [
    "#ff6b35", // Orange
    "#ffb3ba", // Light pink
    "#ffdfba", // Light peach
    "#ffffff", // White
    "#bae1ff", // Light blue
    "#d4b5ff", // Light purple
    "#ffb3d9", // Light pink
    "#ff8c69", // Coral
  ];

  if (!isOpen) return null;

  return (
    <div className="light-modal-overlay">
      <div className="light-modal-container">
        {/* Header */}
        <div className="light-modal-header">
          <h2 className="light-modal-title">{name}</h2>
          <button onClick={onClose} className="light-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="light-modal-status">
          <div className="light-modal-timestamp">Hace 2 minutos</div>
        </div>

        {/* Light Representation */}
        <div className="light-modal-visual">
          <div
            className="light-modal-light"
            style={{
              backgroundColor: isOn
                ? getLightColor()
                : "rgba(255, 255, 255, 0.1)",
              boxShadow: isOn ? `0 0 20px ${getLightColor()}40` : "none",
            }}
          />
        </div>

        {/* Control Tabs */}
        <div className="light-modal-controls">
          <button
            onClick={() => setActiveTab("settings")}
            className={`light-modal-tab ${
              activeTab === "settings" ? "active" : ""
            }`}
          >
            <Power size={20} />
          </button>
          <button
            onClick={() => setActiveTab("color")}
            className={`light-modal-tab ${
              activeTab === "color" ? "active" : ""
            }`}
          >
            <Palette size={20} />
          </button>
          <button
            onClick={() => setActiveTab("temperature")}
            className={`light-modal-tab ${
              activeTab === "temperature" ? "active" : ""
            }`}
          >
            <Thermometer size={20} />
          </button>
        </div>

        {/* Tab Content */}
        <div className="light-modal-content">
          {activeTab === "settings" && (
            <div className="light-modal-section">
              <div className="light-modal-section">
                {/* Settings content can be added here if needed */}
              </div>
            </div>
          )}

          {activeTab === "color" && (
            <div className="light-modal-section">
              <div className="light-modal-section">
                <div className="light-modal-label">Color</div>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="light-modal-color-picker"
                />
              </div>
              <div className="light-modal-section">
                <div className="light-modal-label">Colores preestablecidos</div>
                <div className="light-modal-presets">
                  {presetColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetColor(color)}
                      className="light-modal-preset"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "temperature" && (
            <div className="light-modal-section">
              <div className="light-modal-temperature">
                Control de temperatura de color
              </div>
              <div className="light-modal-temperature-gradient"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightModal;
