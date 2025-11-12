import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { Table, Call, TableStatus } from "../types";
import TableMap from "../features/tables/TableMap";
import { useTables } from "../features/tables/useTables";
import { useChamadoStore } from "../stores/chamadoStore";
import CallList from "../features/calls/CallList";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import ProfileModal from "../components/ProfileModal";
import ActiveCall from "../components/ActiveCall";
import OrderModal from "../components/OrderModal";
import { chamadoAPI } from "../services/api";

export default function MainScreen() {
  console.log("🏠 MainScreen montado!");

  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);

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

  console.log("📋 MainScreen - chamados atuais:", chamados.length);

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

  // Converter chamados da API para o formato Call do UI usando useMemo
  // Isso garante que sempre usa os dados mais recentes do WebSocket
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
      <ProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
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
});
