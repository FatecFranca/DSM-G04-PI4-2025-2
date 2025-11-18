import { create } from "zustand";
import { Chamado } from "../services/api";
import { websocketService } from "../services/websocket";
import * as Haptics from "expo-haptics";

interface ChamadoState {
  chamados: Chamado[];
  isLoading: boolean;
  error: string | null;
  setChamados: (chamados: Chamado[]) => void;
  addChamado: (chamado: Chamado) => void;
  updateChamado: (chamadoId: string, updates: Partial<Chamado>) => void;
  removeChamado: (chamadoId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeListeners: () => void;
}

export const useChamadoStore = create<ChamadoState>((set, get) => ({
  chamados: [],
  isLoading: true,
  error: null,

  setChamados: (chamados) => {
    console.log(
      "📝 [ChamadoStore] setChamados chamado com",
      chamados.length,
      "chamados"
    );
    set({ chamados, isLoading: false });
  },

  addChamado: (chamado) => {
    console.log("➕ [ChamadoStore] addChamado:", chamado);
    const state = get();
    const novosN = [...state.chamados, chamado];
    set({ chamados: novosN });
  },

  updateChamado: (chamadoId, updates) => {
    set((state) => ({
      chamados: state.chamados.map((c) =>
        c._id === chamadoId ? { ...c, ...updates } : c
      ),
    }));
  },

  removeChamado: (chamadoId) => {
    set((state) => ({
      chamados: state.chamados.filter((c) => c._id !== chamadoId),
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  initializeListeners: () => {
    console.log("🎧 [ChamadoStore] Inicializando listeners de chamados");

    const handleNovoChamado = (novoChamado: Chamado) => {
      console.log("🔔 [ChamadoStore] Novo chamado recebido:", novoChamado);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      get().addChamado(novoChamado);
    };

    const handleChamadoAtualizado = (
      chamadoAtualizado: Partial<Chamado> & { _id: string }
    ) => {
      console.log("🔄 [ChamadoStore] Chamado atualizado:", chamadoAtualizado);
      if (
        chamadoAtualizado.status === "atendido" ||
        chamadoAtualizado.status === "resolvido"
      ) {
        get().removeChamado(chamadoAtualizado._id);
      } else {
        get().updateChamado(chamadoAtualizado._id, chamadoAtualizado);
      }
    };

    // Registrar listeners
    websocketService.on("novo_chamado", handleNovoChamado);
    websocketService.on("chamado_atualizado", handleChamadoAtualizado);
  },
}));
