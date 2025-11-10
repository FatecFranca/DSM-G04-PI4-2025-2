import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/src/stores/userStore";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { userAPI } from "@/src/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [credencial, setCredencial] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !credencial) {
      Alert.alert("Atenção", "Preencha email e PIN/senha");
      return;
    }

    try {
      setLoading(true);
      // Chama o endpoint /users/login
      const data = await userAPI.login(email, credencial);

      // data.token e data.user devem estar presentes conforme o backend
      if (data && data.token && data.user) {
        // Primeiro seta o token para configurar a API
        useUserStore.getState().setToken(data.token);
        // Depois seta o usuário
        useUserStore.getState().setUser(data.user);

        // Pequeno delay para garantir que o token foi setado
        setTimeout(() => {
          router.replace("/");
        }, 100);
      } else {
        Alert.alert("Erro", "Resposta inesperada do servidor");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err.message || "Erro ao autenticar";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Entrar
      </ThemedText>

      <ThemedText style={styles.label}>Email</ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="seu@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ThemedText style={styles.label}>PIN / Senha</ThemedText>
      <TextInput
        value={credencial}
        onChangeText={setCredencial}
        style={styles.input}
        placeholder="PIN (4 dígitos) ou senha"
        secureTextEntry={true}
        keyboardType="default"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Entrar</ThemedText>
        )}
      </TouchableOpacity>

      <View style={styles.hintContainer}>
        <ThemedText style={styles.hint}>
          Obs: Garçons/cozinheiros usam o PIN (4 primeiros dígitos do CPF).
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  button: {
    height: 48,
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  hintContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  hint: {
    color: "#6b7280",
    fontSize: 12,
  },
});
