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
    // Armazena tokens no AsyncStorage
    await AsyncStorage.setItem("@auth_token", accessToken);
    await AsyncStorage.setItem("@refresh_token", refreshToken);
    await AsyncStorage.setItem("@user_data", JSON.stringify(user));

    // Atualiza o header da API
    api.defaults.headers.Authorization = `Bearer ${accessToken}`;

    // Conecta ao WebSocket
    websocketService.connect(accessToken);

    // Inicializa listeners globais de chamados
    useChamadoStore.getState().initializeListeners();

    // Inicializa listener de mesa_atualizada
    websocketService.on("mesa_atualizada", (mesaAtualizada) => {
      useMesaStore.getState().updateMesa(mesaAtualizada._id, mesaAtualizada);
    });

    // Carrega chamados iniciais
    try {
      const chamados = await chamadoAPI.listar();
      useChamadoStore.getState().setChamados(chamados);
    } catch (error) {
      console.error("❌ Erro ao carregar chamados:", error);
    }

    // Carrega mesas iniciais
    try {
      const mesas = await mesaAPI.listar();
      useMesaStore.getState().setMesas(mesas);
    } catch (error) {
      console.error("❌ Erro ao carregar mesas:", error);
    }

    // Atualiza o estado
    set({ user, token: accessToken, refreshToken });
  },
  logout: async () => {
    // Desconecta do WebSocket
    websocketService.disconnect();

    // Remove tokens do AsyncStorage
    await AsyncStorage.removeItem("@auth_token");
    await AsyncStorage.removeItem("@refresh_token");
    await AsyncStorage.removeItem("@user_data");

    // Remove header da API
    delete api.defaults.headers.Authorization;

    // Limpa o estado
    set({ user: null, token: null, refreshToken: null });
  },
}));
