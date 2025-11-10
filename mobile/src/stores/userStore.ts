import { create } from "zustand";
import api from "@/src/services/api";

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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
    set({ token });
  },
  logout: () => {
    delete api.defaults.headers.Authorization;
    set({ user: null, token: null });
  },
}));
