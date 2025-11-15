import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Table, Call, TableStatus } from "../types";
import TableMap from "../features/tables/TableMap";
import { useTables } from "../features/tables/useTables";
import { useChamadoStore } from "../stores/chamadoStore";
import { usePedidoProntoStore } from "../stores/pedidoProntoStore";
import CallList from "../features/calls/CallList";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import ProfileModal from "../components/ProfileModal";
import PedidosProntosModal from "../components/PedidosProntosModal";
import ActiveCall from "../components/ActiveCall";
import OrderModal from "../components/OrderModal";
import PaymentModal from "../components/PaymentModal";
import { chamadoAPI, contaAPI } from "../services/api";

export default function MainScreen() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isPedidosProntosVisible, setIsPedidosProntosVisible] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  
  // Dados da conta ativa
  const [contaAtual, setContaAtual] = useState({
    contaId: '',
    valorTotal: 0,
    valorPago: 0,
  });

  // Store de pedidos prontos
  const pedidosProntos = usePedidoProntoStore((state) => state.pedidosProntos);
  const carregarPedidosProntos = usePedidoProntoStore((state) => state.carregarPedidosProntos);
  const initializeListeners = usePedidoProntoStore((state) => state.initializeListeners);

  // Inicializar listeners e carregar pedidos prontos
  useEffect(() => {
    console.log('🔄 Inicializando pedidos prontos...');
    carregarPedidosProntos();
    initializeListeners();
  }, []);

  // Debug pedidos prontos
  useEffect(() => {
    console.log('📋 Pedidos prontos atualizados:', pedidosProntos.length, pedidosProntos);
  }, [pedidosProntos]);

  // Debug: monitorar mudanças no estado do modal
  useEffect(() => {
    console.log('🎯 isPaymentModalVisible mudou para:', isPaymentModalVisible);
  }, [isPaymentModalVisible]);

  // Função para buscar dados da conta
  const carregarContaAtiva = async (mesaId: string) => {
    try {
      console.log('🔍 Carregando conta para mesa:', mesaId);
      const conta = await contaAPI.getContaAtiva(mesaId);
      console.log('📋 Conta recebida:', conta);
      if (conta) {
        setContaAtual({
          contaId: conta._id,
          valorTotal: conta.valor_total,
          valorPago: conta.valor_pago,
        });
        console.log('✅ Conta atualizada:', {
          contaId: conta._id,
          valorTotal: conta.valor_total,
          valorPago: conta.valor_pago,
        });
      } else {
        console.log('⚠️ Nenhuma conta ativa encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conta:', error);
    }
  };

  // Função para abrir modal de pagamento
  const handleOpenPaymentModal = async () => {
    console.log('💳 Tentando abrir modal de pagamento');
    console.log('📊 Conta atual:', contaAtual);
    console.log('📞 Active call:', activeCall);
    
    // Se não tem conta carregada, tenta carregar antes de abrir
    if (!contaAtual.contaId && activeCall?.table_id) {
      console.warn('⚠️ Conta não carregada! Carregando agora...');
      await carregarContaAtiva(activeCall.table_id);
    }
    
    // Abre o modal independente de ter conta ou não
    console.log('✅ Abrindo modal de pagamento');
    setIsPaymentModalVisible(true);
  };

  // Buscar dados reais do backend
  const {
    tables: apiTables,
    isLoading: loadingTables,
    error: errorTables,
  } = useTables();

  // Usar store diretamente ao invés do hook
  const chamados = useChamadoStore((state) => state.chamados);
  const isLoading = useChamadoStore((state) => state.isLoading);
  const error = useChamadoStore((state) => state.error);


  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    if (apiTables) {
      const mappedTables = apiTables.map((mesa) => ({
        id: Number(mesa.numero),
        _id: mesa._id,
        number: String(mesa.numero),
        position: {
          x: ((mesa.numero - 1) % 3) * 0.3 + 0.2,
          y: Math.floor((mesa.numero - 1) / 3) * 0.3 + 0.2,
        },
        status: mapApiStatusToTableStatus(mesa.status),
      }));
      setTables(mappedTables);
    }
  }, [apiTables]);

  const mapApiStatusToTableStatus = (apiStatus: string): TableStatus => {
    switch (apiStatus) {
      case "livre":
        return "available";
      case "aguardando_atendimento":
        return "called";
      case "ocupada":
      case "aguardando_pagamento":
        return "in-service";
      default:
        return "available";
    }
  };

  const calls = useMemo(() => {
    console.log("🔄 Convertendo chamados:", chamados.length);
    return chamados.map((chamado) => {
      const mesaInfo =
        typeof chamado.mesa === "object"
          ? chamado.mesa
          : { _id: chamado.mesa, numero: 0 };
      return {
        id: chamado._id,
        tableId: mesaInfo.numero,
        table_id: mesaInfo._id,
        timestamp: chamado.createdAt,
        status: "pending" as Call["status"],
      };
    });
  }, [chamados]); // Re-calcula sempre que chamados mudar

  const handleTableUpdate = (updatedTable: Table) => {
    setTables((prev) =>
      prev.map((table) => (table.id === updatedTable.id ? updatedTable : table))
    );
  };

  const handleCallStatusUpdate = async (
    callId: string,
    status: Call["status"]
  ) => {
    const updatedCall = calls.find((c) => c.id === callId);
    if (!updatedCall) return;

    // Não permite aceitar novo chamado se já houver um em andamento
    if (status === "in-progress" && activeCall) return;

    if (status === "in-progress") {
      try {
        // Aceitar chamado no backend
        await chamadoAPI.atender(callId);

        // Atualiza o timestamp para o momento em que o chamado foi aceito
        const updatedCallWithTime = {
          ...updatedCall,
          timestamp: new Date().toISOString(),
          status: "in-progress" as Call["status"],
        };
        setActiveCall(updatedCallWithTime);

        // Carregar conta ativa da mesa
        if (updatedCall.table_id) {
          await carregarContaAtiva(updatedCall.table_id);
        }

        // Feedback tátil
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.error("Erro ao aceitar chamado:", error);
      }
    } else if (status === "completed") {
      setActiveCall(null);

      // Feedback tátil
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (loadingTables || isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (errorTables || error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Erro ao carregar dados: {errorTables || error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => setIsProfileVisible(true)} />
      
      <View style={styles.content}>
        <View style={styles.mapSection}>
          {activeCall && (
            <ActiveCall
              call={activeCall}
              onFinishCall={() =>
                handleCallStatusUpdate(activeCall.id, "completed")
              }
              onMakeOrder={() => setIsOrderModalVisible(true)}
              onRegisterPayment={handleOpenPaymentModal}
            />
          )}
          <View
            style={[
              styles.mapContainer,
              activeCall && styles.mapContainerWithActiveCall,
            ]}
          >
            <TableMap
              tables={tables}
              disabled={!!activeCall} // Desabilita interações quando há chamado ativo
              onTablePress={(tableId) => {
                if (activeCall) return; // Não permite aceitar novo chamado se já houver um ativo
                const call = calls.find(
                  (c) => c.tableId === tableId && c.status === "pending"
                );
                if (call) {
                  handleCallStatusUpdate(call.id, "in-progress");
                }
              }}
            />
          </View>
        </View>
        <View style={styles.callsContainer}>
          <CallList
            calls={calls.filter((call) => call.status === "pending")}
            disabled={!!activeCall}
            onCallStatusUpdate={handleCallStatusUpdate}
          />
        </View>
      </View>

      {/* Botão Flutuante de Pedidos Prontos - SEMPRE VISÍVEL */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.pedidosProntosButton}
        onPress={() => {
          console.log('🔔 Botão clicado! Pedidos prontos:', pedidosProntos.length);
          setIsPedidosProntosVisible(true);
        }}
      >
        <Ionicons name="checkmark-done" size={26} color="#fff" />
        {pedidosProntos.length > 0 && (
          <View style={styles.pedidosBadge}>
            <Text style={styles.pedidosBadgeText}>
              {pedidosProntos.length > 9 ? '9+' : pedidosProntos.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <ProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />
      <PedidosProntosModal
        visible={isPedidosProntosVisible}
        onClose={() => setIsPedidosProntosVisible(false)}
      />
      <OrderModal
        visible={isOrderModalVisible}
        onClose={() => setIsOrderModalVisible(false)}
        tableId={activeCall?.tableId || 0}
        table_id={activeCall?.table_id} // ID do MongoDB (opcional)
        onConfirmOrder={(items) => {
          console.log("Pedido confirmado:", items);
          // Aqui você pode implementar a lógica para salvar o pedido
        }}
      />

      <PaymentModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        contaId={contaAtual.contaId}
        valorTotal={contaAtual.valorTotal}
        valorPago={contaAtual.valorPago}
        onPaymentSuccess={async (contaFechada) => {
          setIsPaymentModalVisible(false);
          
          // Recarregar dados da conta
          if (activeCall?.table_id) {
            await carregarContaAtiva(activeCall.table_id);
          }
          
          // Se a conta foi fechada, limpar o chamado ativo
          if (contaFechada) {
            console.log('Conta fechada! Mesa liberada.');
            setActiveCall(null);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  mapSection: {
    backgroundColor: "#FFF",
  },
  mapContainer: {
    height: 220,
    backgroundColor: "#FFF",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: "center",
  },
  mapContainerWithActiveCall: {
    height: 200,
  },
  callsContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pedidosProntosButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 999,
  },
  pedidosBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  pedidosBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
