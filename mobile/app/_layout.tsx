import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/src/stores/userStore";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useUserStore((state) => state.user);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const [token, refreshToken, userData] = await Promise.all([
          AsyncStorage.getItem("@auth_token"),
          AsyncStorage.getItem("@refresh_token"),
          AsyncStorage.getItem("@user_data"),
        ]);

        if (token && refreshToken && userData) {
          const parsedUser = JSON.parse(userData);
          await useUserStore
            .getState()
            .setAuth(parsedUser, token, refreshToken);
        }
      } catch (error) {
        console.error("Erro ao restaurar usuário:", error);
      } finally {
        setIsReady(true);
      }
    };

    restoreUser();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "login";
    const inCozinhaGroup = segments[0] === "cozinha";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user) {
      if (user.cargo === "cozinheiro" && !inCozinhaGroup) {
        router.replace("/cozinha");
      } else if (user.cargo !== "cozinheiro" && inCozinhaGroup) {
        router.replace("/");
      }
    }
  }, [user, segments, isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0ea5e9",
          },
          headerTintColor: "#fff",
          headerTitle: "",
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="index" />
        <Stack.Screen name="cozinha" />
        <Stack.Screen name="desempenho" />
        <Stack.Screen name="mesa/[id]" />
        <Stack.Screen name="modal" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
