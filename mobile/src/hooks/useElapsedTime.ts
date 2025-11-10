import { useState, useEffect } from "react";

export function useElapsedTime(date: string | Date | undefined): string {
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    if (!date) {
      setElapsedTime("Tempo indisponível");
      return;
    }

    const calculateElapsed = () => {
      try {
        const startTime = new Date(date);
        if (isNaN(startTime.getTime())) {
          return "Data inválida";
        }

        const now = new Date();
        const diff = now.getTime() - startTime.getTime();

        // Menos de 1 minuto: mostra em segundos
        if (diff < 60000) {
          const seconds = Math.floor(diff / 1000);
          return `${seconds}s`;
        }

        // Menos de 1 hora: mostra em minutos e segundos
        if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          return `${minutes}m ${seconds}s`;
        }

        // Menos de 1 dia: mostra em horas e minutos
        if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          return `${hours}h ${minutes}m`;
        }

        // Mais de 1 dia: mostra em dias e horas
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        return `${days}d ${hours}h`;
      } catch (error) {
        console.error("Erro ao calcular tempo:", error);
        return "Erro no cálculo";
      }
    };

    // Calcula imediatamente
    setElapsedTime(calculateElapsed());

    // Atualiza a cada segundo
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return elapsedTime;
}
