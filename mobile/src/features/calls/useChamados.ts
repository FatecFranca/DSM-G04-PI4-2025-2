import { chamadoAPI } from "../../services/api";
import { useChamadoStore } from "../../stores/chamadoStore";

export function useChamados() {
  const chamados = useChamadoStore((state) => state.chamados);
  const isLoading = useChamadoStore((state) => state.isLoading);
  const error = useChamadoStore((state) => state.error);

  console.log(
    "🚀 useChamados hook chamado! Chamados no store:",
    chamados.length
  );

  const aceitarChamado = async (chamadoId: string) => {
    try {
      await chamadoAPI.atender(chamadoId);
    } catch (err) {
      console.error("Erro ao aceitar chamado:", err);
      throw err;
    }
  };

  return { chamados, isLoading, error, aceitarChamado };
}
