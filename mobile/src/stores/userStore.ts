import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { chamadoAPI, mesaAPI } from "@/src/services/api";
import { websocketService } from "@/src/services/websocket";
import { useChamadoStore } from "./chamadoStore";
import { useMesaStore } from "./mesaStore";

interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  empresa: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
    set({ token });
  },
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  setAuth: async (user, accessToken, refreshToken) => {

    await AsyncStorage.setItem("@auth_token", accessToken);
    await AsyncStorage.setItem("@refresh_token", refreshToken);
    await AsyncStorage.setItem("@user_data", JSON.stringify(user));

    api.defaults.headers.Authorization = `Bearer ${accessToken}`;

    websocketService.connect(accessToken);

    if (user.cargo === 'garcom' || user.cargo === 'gerente') {
      useChamadoStore.getState().initializeListeners();
    }

    websocketService.on("mesa_atualizada", (mesaAtualizada) => {
      useMesaStore.getState().updateMesa(mesaAtualizada._id, mesaAtualizada);
    });

    if (user.cargo === 'garcom' || user.cargo === 'gerente') {
      try {
        const chamados = await chamadoAPI.listar();
        useChamadoStore.getState().setChamados(chamados);
      } catch (error) {
        console.error("❌ Erro ao carregar chamados:", error);
      }
    }

    if (user.cargo === 'garcom' || user.cargo === 'gerente') {
      try {
        const mesas = await mesaAPI.listar();
        useMesaStore.getState().setMesas(mesas);
      } catch (error) {
        console.error("❌ Erro ao carregar mesas:", error);
      }
    }

    set({ user, token: accessToken, refreshToken });
  },
  logout: async () => {

    websocketService.disconnect();

    await AsyncStorage.removeItem("@auth_token");
    await AsyncStorage.removeItem("@refresh_token");
    await AsyncStorage.removeItem("@user_data");

    delete api.defaults.headers.Authorization;
    
    set({ user: null, token: null, refreshToken: null });
  },
}));
