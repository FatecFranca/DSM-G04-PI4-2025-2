import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  mesaAPI,
  type Mesa,
  chamadoAPI,
  type Chamado,
  contaAPI,
} from "@/src/services/api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ChamadosModal from "@/src/components/ChamadosModal";
import PedidosProntosModal from "@/src/components/PedidosProntosModal";
import Header from "@/src/components/Header";
import ProfileModal from "@/src/components/ProfileModal";
import { useChamadoStore } from "@/src/stores/chamadoStore";
import { useMesaStore } from "@/src/stores/mesaStore";
import { usePedidoProntoStore } from "@/src/stores/pedidoProntoStore";

export default function Index() {
  // Usar stores globais
  const mesas = useMesaStore((state) => state.mesas);
  const chamados = useChamadoStore((state) => state.chamados);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isChamadosVisible, setIsChamadosVisible] = useState(false);
  const [isPedidosProntosVisible, setIsPedidosProntosVisible] = useState(false);
  
  // Store de pedidos prontos
  const pedidosProntos = usePedidoProntoStore((state) => state.pedidosProntos);
  const carregarPedidosProntos = usePedidoProntoStore((state) => state.carregarPedidosProntos);
  const initializeListeners = usePedidoProntoStore((state) => state.initializeListeners);
  const [mesasEmAbertura, setMesasEmAbertura] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    // Só carrega se o store estiver vazio (primeira vez)
    if (mesas.length === 0) {
      carregarMesas();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidosProntos();
    initializeListeners();
  }, []);

  async function carregarMesas() {
    try {
      setLoading(true);
      setError(null);

      const mesasData = await mesaAPI.listar();

      if (mesasData.length === 0) {
        useMesaStore.getState().setMesas([]);
        setError("Nenhuma mesa cadastrada");
        return;
      }

      // Ordena as mesas por número
      const mesasOrdenadas = [...mesasData].sort((a, b) => a.numero - b.numero);
      useMesaStore.getState().setMesas(mesasOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar mesas:", error);
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao carregar as mesas. Tente novamente.";

      setError(mensagem);
      useMesaStore.getState().setMesas([]);
    } finally {
      setLoading(false);
    }
  }

  // Removido getTempoDecorrido pois agora usamos o hook useElapsedTime

  // Retorna a cor de fundo baseada no status da mesa
  function getStatusColor(status: Mesa["status"]) {
    switch (status) {
      case "livre":
        return "#22c55e"; // verde
      case "ocupada":
        return "#eab308"; // amarelo
      case "aguardando_atendimento":
        return "#ef4444"; // vermelho
      case "aguardando_pagamento":
        return "#3b82f6"; // azul
      default:
        return "#6b7280"; // cinza
    }
  }

  // Retorna o texto do status formatado
  function getStatusText(status: Mesa["status"]) {
    switch (status) {
      case "livre":
        return "Livre";
      case "ocupada":
        return "Ocupada";
      case "aguardando_atendimento":
        return "Aguardando";
      case "aguardando_pagamento":
        return "Pagamento";
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={carregarMesas}>
            <ThemedText style={styles.retryButtonText}>
              Tentar Novamente
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const chamadosAbertos = chamados.filter((c) => c.status === "pendente");

  const handleAtenderChamado = async (chamadoId: string) => {
    try {
      await chamadoAPI.atender(chamadoId);
      // Atualiza apenas as mesas - chamados são atualizados via WebSocket
      await carregarMesas();
      setIsChamadosVisible(false);
    } catch (error) {
      console.error("Erro ao atender chamado:", error);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header onProfilePress={() => setIsProfileVisible(true)} />

      {/* Botões Flutuantes */}
      <View style={styles.floatingButtonsContainer}>
        {/* Botão de Pedidos Prontos */}
        <TouchableOpacity
          style={styles.pedidosProntosButton}
          onPress={() => setIsPedidosProntosVisible(true)}
        >
          <Ionicons name="checkmark-done" size={24} color="#fff" />
          {pedidosProntos.length > 0 && (
            <View style={styles.pedidosBadge}>
              <ThemedText style={styles.pedidosBadgeText}>
                {pedidosProntos.length}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Botão de Chamados */}
        <TouchableOpacity
          style={[
            styles.chamadosButton,
            chamadosAbertos.length === 0 && styles.chamadosBadgeEmpty,
          ]}
          onPress={() => setIsChamadosVisible(true)}
        >
          <Ionicons name="notifications" size={24} color="#fff" />
          <View style={styles.chamadosBadge}>
            <ThemedText style={styles.chamadosBadgeText}>
              {chamadosAbertos.length}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de Chamados */}
      <ChamadosModal
        visible={isChamadosVisible}
        onClose={() => setIsChamadosVisible(false)}
        chamados={chamados}
        mesas={mesas}
        onAtenderChamado={handleAtenderChamado}
      />

      {/* Modal de Pedidos Prontos */}
      <PedidosProntosModal
        visible={isPedidosProntosVisible}
        onClose={() => setIsPedidosProntosVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.mesasGrid}>
        {mesas.map((mesa) => (
          <View key={mesa._id} style={styles.mesaContainer}>
            <View
              style={[
                styles.mesaStatus,
                { backgroundColor: getStatusColor(mesa.status) },
              ]}
            >
              <ThemedText style={styles.mesaNumero}>
                Mesa {mesa.numero}
              </ThemedText>
              <ThemedText style={styles.statusText}>
                {getStatusText(mesa.status)}
              </ThemedText>
            </View>

            <View style={styles.botoesContainer}>
              {/* Botão Ver Detalhes - aparece se tiver conta ativa ou mesa ocupada */}
              {(mesa.conta_ativa ||
                mesa.status === "ocupada" ||
                mesa.status === "aguardando_pagamento") && (
                <TouchableOpacity
                  style={[styles.botao, styles.botaoDetalhes]}
                  onPress={() => {
                    router.push(`/mesa/${mesa._id}?numero=${mesa.numero}`);
                  }}
                >
                  <ThemedText style={styles.botaoText}>Ver Detalhes</ThemedText>
                </TouchableOpacity>
              )}

              {/* Botão Abrir Conta - só aparece se a mesa estiver livre */}
              {mesa.status === "livre" && (
                <TouchableOpacity
                  style={[
                    styles.botao,
                    styles.botaoAbrirConta,
                    mesasEmAbertura[mesa._id] && styles.botaoDesabilitado,
                  ]}
                  disabled={mesasEmAbertura[mesa._id]}
                  onPress={async () => {
                    try {
                      setMesasEmAbertura((prev) => ({
                        ...prev,
                        [mesa._id]: true,
                      }));
                      await contaAPI.abrir(mesa._id);
                      await carregarMesas(); // Atualiza o status da mesa
                    } catch (error) {
                      console.error("Erro ao abrir conta:", error);
                      const mensagem =
                        error instanceof Error
                          ? error.message
                          : "Erro ao abrir conta. Tente novamente.";
                      setError(mensagem);
                    } finally {
                      setMesasEmAbertura((prev) => ({
                        ...prev,
                        [mesa._id]: false,
                      }));
                    }
                  }}
                >
                  <ThemedText style={styles.botaoText}>
                    {mesasEmAbertura[mesa._id] ? "Abrindo..." : "Abrir Conta"}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <ProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  botaoDesabilitado: {
    opacity: 0.6,
  },
  floatingButtonsContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 8,
    marginRight: 16,
    marginBottom: 8,
    gap: 12,
  },
  pedidosProntosButton: {
    backgroundColor: "#10b981",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pedidosBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 4,
  },
  pedidosBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 14,
  },
  chamadosButton: {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    backgroundColor: "#ef4444",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chamadosBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#0ea5e9",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 4,
  },
  chamadosBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 16,
  },
  chamadosBadgeEmpty: {
    backgroundColor: "#9ca3af", // Cinza quando não tem chamados
  },

  // Outros estilos
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    flex: 1,
  },
  mesasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    paddingTop: 8,
  },
  mesaContainer: {
    width: "50%", // Divide em duas colunas iguais
    padding: 8, // Adiciona espaço interno
    alignItems: "stretch", // Garante que o conteúdo ocupe toda a largura
  },
  mesaStatus: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Faz o container ocupar todo o espaço disponível
    minHeight: 100, // Altura mínima para o card
  },
  mesaNumero: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  botoesContainer: {
    marginTop: 8,
    gap: 8,
  },
  botao: {
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoDetalhes: {
    backgroundColor: "#0ea5e9", // azul
  },
  botaoAbrirConta: {
    backgroundColor: "#22c55e", // verde
  },
  botaoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
