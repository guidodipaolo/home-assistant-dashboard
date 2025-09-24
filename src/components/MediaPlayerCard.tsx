import React, { useState } from "react";
import { Tv, Power } from "lucide-react";
import { homeAssistantAPI } from "../services/homeAssistantApi";
import { useEntityState } from "../hooks/useEntityState";
import flowImage from "../assets/media/flow.png";
import plexImage from "../assets/media/plex.png";
import mgstvImage from "../assets/media/mgstv.png";
import youtubeImage from "../assets/media/youtube.png";
import spotifyImage from "../assets/media/spotify.png";

// Media source configuration - easily extensible
const MEDIA_SOURCES = {
  flow: {
    image: flowImage,
    name: "Flow",
    keywords: ["flow", "flowplayer"],
  },
  plex: {
    image: plexImage,
    name: "Plex",
    keywords: ["plex", "plex media server"],
  },
  mgstv: {
    image: mgstvImage,
    name: "Magis TV",
    keywords: ["magis", "magis tv", "mgstv"],
  },
  youtube: {
    image: youtubeImage,
    name: "YouTube",
    keywords: ["youtube", "youtube tv", "youtube music"],
  },
  spotify: {
    image: spotifyImage,
    name: "Spotify",
    keywords: ["spotify", "spotify connect"],
  },
} as const;

// Helper function to get media source info
const getMediaSourceInfo = (mediaName: string) => {
  const lowerMediaName = mediaName.toLowerCase();

  for (const [key, source] of Object.entries(MEDIA_SOURCES)) {
    if (source.keywords.some((keyword) => lowerMediaName.includes(keyword))) {
      return { key, ...source };
    }
  }

  return null;
};

interface MediaPlayerCardProps {
  entityId: string;
}

const MediaPlayerCard: React.FC<MediaPlayerCardProps> = ({ entityId }) => {
  const { entityState, loading, error, setError } = useEntityState(entityId);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Extract media player data from entity state
  const isOn = entityState?.state === "on" || false;
  const currentMedia = entityState?.attributes?.app_name || "Sin contenido";

  // Get media source information
  const mediaSourceInfo = getMediaSourceInfo(currentMedia);

  const togglePower = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (isOn) {
        await homeAssistantAPI.callService(
          "media_player",
          "turn_off",
          entityId
        );
      } else {
        await homeAssistantAPI.callService("media_player", "turn_on", entityId);
      }
      // State will be updated automatically via websocket
    } catch (err) {
      console.error("Error toggling media player:", err);
      setError("Error al cambiar el estado del televisor");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div
        className="card-header"
        style={{ marginBottom: isOn ? "var(--spacing-lg)" : "0" }}
      >
        <div className="card-title-group">
          <div className={`card-icon ${isOn ? "media-on" : "light-off"}`}>
            <Tv
              style={{ color: isOn ? "#22c55e" : "rgba(255, 255, 255, 0.5)" }}
            />
          </div>
          <h3 className="card-title">Televisor</h3>
        </div>

        <button
          onClick={togglePower}
          className={`power-button ${isOn ? "on" : "off"}`}
          disabled={loading || actionLoading}
        >
          <Power style={{ color: isOn ? "#ef4444" : "#22c55e" }} />
        </button>
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

      {isOn && (
        <div
          className="media-content"
          style={{
            backgroundImage: mediaSourceInfo?.image
              ? `url(${mediaSourceInfo.image})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {mediaSourceInfo?.image && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderRadius: "var(--radius-lg)",
              }}
            />
          )}
          <div
            className="media-label"
            style={{ position: "relative", zIndex: 1 }}
          >
            Reproduciendo
          </div>
          <div
            className="media-title"
            style={{ position: "relative", zIndex: 1 }}
          >
            {mediaSourceInfo?.name || currentMedia}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPlayerCard;
