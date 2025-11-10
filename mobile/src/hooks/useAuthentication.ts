import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/src/services/api";
import { useUserStore } from "@/src/stores/userStore";
import { useRouter, useSegments } from "expo-router";

export function useAuthentication() {
  const segments = useSegments();
  const router = useRouter();
  const { token, setToken } = useUserStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("@auth_token");

        if (storedToken) {
          // Se temos um token, vamos usá-lo
          await setToken(storedToken);

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
