import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { chamadoAPI } from "@/src/services/api";
import { websocketService } from "@/src/services/websocket";
import { useUserStore } from "@/src/stores/userStore";
import { useChamadoStore } from "@/src/stores/chamadoStore";
import { useRouter, useSegments } from "expo-router";

export function useAuthentication() {
  const segments = useSegments();
  const router = useRouter();
  const { token, setToken, setRefreshToken, setUser } = useUserStore();
  const { initializeListeners, setChamados } = useChamadoStore();

  useEffect(() => {
    console.log("🔐 useAuthentication useEffect executado!");
    const initAuth = async () => {
      console.log("🔐 Iniciando autenticação...");
      try {
        const storedToken = await AsyncStorage.getItem("@auth_token");
        const storedRefreshToken = await AsyncStorage.getItem("@refresh_token");
        const storedUser = await AsyncStorage.getItem("@user_data");

        if (storedToken && storedRefreshToken && storedUser) {
          await setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));

          console.log("🔌 Conectando WebSocket...");
          websocketService.connect(storedToken);

          console.log("🎧 Inicializando listeners...");
          initializeListeners();

          console.log("🔍 Carregando chamados iniciais...");
          try {
            const chamados = await chamadoAPI.listar();
            console.log("✅ Chamados carregados:", chamados.length);
            setChamados(chamados);
          } catch (error) {
            console.error("❌ Erro ao carregar chamados:", error);
          }

          const inPublicGroup = segments[0] && segments[0].startsWith("(public)");
          if (inPublicGroup) {
            router.replace("/");
          }
        } else {
          const inPublicGroup = segments[0] && segments[0].startsWith("(public)");
          if (!inPublicGroup) {
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      }
    };

    initAuth();
  }, [segments]);

  return { isAuthenticated: !!token };
}
