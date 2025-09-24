import { useState, useEffect } from "react";
import { useEntityState } from "./useEntityState";

interface Person {
  id: string;
  name: string;
  entityId: string;
  isHome: boolean;
  avatar?: string;
}

interface PresenceData {
  people: Person[];
  isLoading: boolean;
  error: string | null;
}

export const usePresenceState = (): PresenceData => {
  const [people, setPeople] = useState<Person[]>([
    {
      id: "cele",
      name: "Cele",
      entityId: "binary_sensor.celular_cele",
      isHome: false,
      avatar: require("../assets/avatars/cele.jpg"), // Imagen de Cele
    },
    {
      id: "guido",
      name: "Guido",
      entityId: "binary_sensor.celular_guido",
      isHome: false,
      avatar: require("../assets/avatars/guido.jpg"), // Imagen de Guido
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para obtener el estado de Cele
  const celeState = useEntityState("binary_sensor.celular_cele");

  // Hook para obtener el estado de Guido
  const guidoState = useEntityState("binary_sensor.celular_guido");

  useEffect(() => {
    try {
      // Actualizar el estado de las personas con los datos reales
      setPeople((prevPeople) =>
        prevPeople.map((person) => {
          let isHome = false;

          if (person.entityId === "binary_sensor.celular_cele") {
            isHome = celeState?.entityState?.state === "on";
          } else if (person.entityId === "binary_sensor.celular_guido") {
            isHome = guidoState?.entityState?.state === "on";
          }

          return {
            ...person,
            isHome,
          };
        })
      );

      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsLoading(false);
    }
  }, [celeState, guidoState]);

  return {
    people,
    isLoading,
    error,
  };
};
