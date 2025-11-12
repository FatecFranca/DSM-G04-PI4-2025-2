import { create } from "zustand";
import { Mesa } from "../services/api";

interface MesaState {
  mesas: Mesa[];
  setMesas: (mesas: Mesa[]) => void;
  updateMesa: (mesaId: string, updates: Partial<Mesa>) => void;
}

export const useMesaStore = create<MesaState>((set) => ({
  mesas: [],

  setMesas: (mesas) => {
    set({ mesas });
  },

  updateMesa: (mesaId, updates) => {
    set((state) => ({
      mesas: state.mesas.map((mesa) =>
        mesa._id === mesaId ? { ...mesa, ...updates } : mesa
      ),
    }));
  },
}));
