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
          // Restaura o estado completo
          await setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));

          // Conecta ao WebSocket
          console.log("🔌 Conectando WebSocket...");
          websocketService.connect(storedToken);

          // Inicializa listeners globais
          console.log("🎧 Inicializando listeners...");
          initializeListeners();

          // Carrega chamados iniciais
          console.log("🔍 Carregando chamados iniciais...");
          try {
            const chamados = await chamadoAPI.listar();
            console.log("✅ Chamados carregados:", chamados.length);
            setChamados(chamados);
          } catch (error) {
            console.error("❌ Erro ao carregar chamados:", error);
          }

          // Se estamos em uma rota pública e temos token, vamos para o app
          const inPublicGroup = segments[0] === "(public)";
          if (inPublicGroup) {
            router.replace("/");
          }
        } else {
          // Se não temos token e estamos em uma rota protegida, vamos para o login
          const inPublicGroup = segments[0] === "(public)";
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
