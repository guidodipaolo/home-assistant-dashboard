import { useState, useEffect, useCallback, useMemo } from "react";
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

export const useMultipleEntityStates = (entityIds: string[]) => {
  const [entityStates, setEntityStates] = useState<Map<string, EntityState>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize entityIds to prevent unnecessary re-renders
  const memoizedEntityIds = useMemo(() => entityIds, [entityIds]);

  // Fetch initial states
  useEffect(() => {
    const fetchInitialStates = async () => {
      try {
        setLoading(true);
        setError(null);

        const states = new Map<string, EntityState>();

        // Fetch all states in parallel
        const promises = memoizedEntityIds.map(async (entityId) => {
          try {
            const state = await homeAssistantAPI.getState(entityId);
            states.set(entityId, state);
          } catch (err) {
            console.error(`Error fetching state for ${entityId}:`, err);
            // Don't fail the entire operation if one entity fails
          }
        });

        await Promise.all(promises);
        setEntityStates(states);
      } catch (err) {
        console.error("Error fetching initial states:", err);
        setError("Error al cargar los estados de los sensores");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStates();
  }, [memoizedEntityIds]);

  // Subscribe to state changes via websocket
  useEffect(() => {
    const unsubscribe = websocketService.onStateChanged(
      (event: StateChangedEvent) => {
        const { entity_id, new_state } = event.event.data;

        if (memoizedEntityIds.includes(entity_id) && new_state) {
          setEntityStates((prev) => {
            const newStates = new Map(prev);
            newStates.set(entity_id, new_state);
            return newStates;
          });
          setError(null); // Clear any previous errors when we get a valid state update
        }
      }
    );

    return unsubscribe;
  }, [memoizedEntityIds]);

  const getEntityState = useCallback(
    (entityId: string): EntityState | null => {
      return entityStates.get(entityId) || null;
    },
    [entityStates]
  );

  return {
    entityStates,
    getEntityState,
    loading,
    error,
    setError,
  };
};
