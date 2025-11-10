import { useState, useEffect } from "react";
import { mesaAPI, Mesa } from "../../services/api";

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
  }, []);

  return { tables, isLoading, error };
}
