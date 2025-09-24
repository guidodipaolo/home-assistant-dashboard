import { useState, useEffect } from "react";
import {
  websocketService,
  StateChangedEvent,
} from "../services/websocketService";
import { homeAssistantAPI } from "../services/homeAssistantApi";

export interface EntityState {
  entity_id: string;
  state: string;
  attributes: any;
  last_changed: string;
  last_updated: string;
}

export const useEntityState = (
  entityId: string,
  pauseWebSocket: boolean = false
) => {
  const [entityState, setEntityState] = useState<EntityState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial state
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        setLoading(true);
        setError(null);
        const state = await homeAssistantAPI.getState(entityId);
        setEntityState(state);
      } catch (err) {
        console.error(`Error fetching initial state for ${entityId}:`, err);
        setError(`Error al cargar el estado de ${entityId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialState();
  }, [entityId]);

  // Subscribe to state changes via websocket (only when not paused)
  useEffect(() => {
    if (pauseWebSocket) {
      return; // Don't subscribe when paused
    }

    const unsubscribe = websocketService.onStateChanged(
      (event: StateChangedEvent) => {
        const { entity_id, new_state } = event.event.data;

        if (entity_id === entityId && new_state) {
          setEntityState(new_state);
          setError(null); // Clear any previous errors when we get a valid state update
        }
      }
    );

    return unsubscribe;
  }, [entityId, pauseWebSocket]);

  return {
    entityState,
    loading,
    error,
    setError,
  };
};
