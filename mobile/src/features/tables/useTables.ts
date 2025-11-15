import { useState, useEffect } from "react";
import { mesaAPI, Mesa } from "../../services/api";
import { websocketService } from "../../services/websocket";

export function useTables() {
  const [tables, setTables] = useState<Mesa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        const data = await mesaAPI.listar();
        setTables(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tables");
        console.error("Error fetching tables:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTables();

    const handleMesaAtualizada = (
      mesaAtualizada: Partial<Mesa> & { _id: string }
    ) => {
      console.log("📡 Mesa atualizada via WebSocket:", mesaAtualizada);
      setTables((prevTables) =>
        prevTables.map((mesa) =>
          mesa._id === mesaAtualizada._id
            ? { ...mesa, ...mesaAtualizada }
            : mesa
        )
      );
    };

    websocketService.on("mesa_atualizada", handleMesaAtualizada);

    return () => {
      websocketService.off("mesa_atualizada", handleMesaAtualizada);
    };
  }, []);

  return { tables, isLoading, error };
}
