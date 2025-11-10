import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { Table, Call, TableStatus } from "../types";
import TableMap from "../features/tables/TableMap";
import { useTables } from "../features/tables/useTables";
import CallList from "../features/calls/CallList";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import ProfileModal from "../components/ProfileModal";
import ActiveCall from "../components/ActiveCall";
import OrderModal from "../components/OrderModal";

export default function MainScreen() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  // DADOS MOCKADOS - Para usar dados reais do backend:
  // 1. Importe: import { mesaAPI } from '../services/api';
  // 2. Use useEffect para buscar: const mesas = await mesaAPI.listar();
  // 3. As mesas do backend terão o campo _id (ObjectId do MongoDB)
  // 4. Adicione table_id ao activeCall quando integrar

  // 📝 IMPORTANTE: Para testar criação de pedidos:
  // 1. Crie uma mesa no MongoDB pelo backend
  // 2. Copie o _id da mesa (ex: '507f1f77bcf86cd799439011')
  // 3. Cole abaixo no campo table_id

  const [activeCall, setActiveCall] = useState<Call | null>({
    id: "2",
    tableId: 3, // ID local para UI
    table_id: "69114e3c23b718a4bc86fa62", // ✅ ID da mesa criada no MongoDB
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "in-progress",
  });
  const { tables: apiTables, isLoading, error } = useTables();
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
  const [calls, setCalls] = useState<Call[]>([
    {
      id: "1",
      tableId: 2,
      timestamp: new Date().toISOString(),
      status: "pending",
    },
    {
      id: "2",
      tableId: 3,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: "in-progress",
    },
  ]);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);

  // Simulação local de novos chamados (remova quando integrar com o WebSocket real)
  useEffect(() => {
    // Inicializa o offset do mapa se houver um chamado ativo
    if (activeCall) {
      //mapOffset.setValue(0);
    }

    const simulateNewCall = () => {
      const availableTables = tables.filter((t) => t.status === "available");
      if (availableTables.length > 0) {
        const randomTable =
          availableTables[Math.floor(Math.random() * availableTables.length)];
        const newCall: Call = {
          id: Date.now().toString(),
          tableId: randomTable.id,
          timestamp: new Date().toISOString(),
          status: "pending",
        };
        handleNewCall(newCall);
      }
    };

    // Simular um novo chamado a cada 30 segundos
    const interval = setInterval(simulateNewCall, 30000);
    return () => clearInterval(interval);
  }, [tables, activeCall]);

  const handleNewCall = (call: Call) => {
    // Vibrar o dispositivo quando receber uma nova chamada
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setCalls((prev) => [...prev, call]);
    setTables((prev) =>
      prev.map((table) =>
        table.id === call.tableId ? { ...table, status: "called" } : table
      )
    );
  };

  const handleTableUpdate = (updatedTable: Table) => {
    setTables((prev) =>
      prev.map((table) => (table.id === updatedTable.id ? updatedTable : table))
    );
  };

  const handleCallStatusUpdate = (callId: string, status: Call["status"]) => {
    const updatedCall = calls.find((c) => c.id === callId);
    if (!updatedCall) return;

    // Não permite aceitar novo chamado se já houver um em andamento
    if (status === "in-progress" && activeCall) return;

    if (status === "in-progress") {
      // Atualiza o timestamp para o momento em que o chamado foi aceito
      const updatedCallWithTime = {
        ...updatedCall,
        timestamp: new Date().toISOString(),
      };
      setActiveCall(updatedCallWithTime);
    } else if (status === "completed") {
      setActiveCall(null);
    }

    setCalls((prev) =>
      prev.map((call) =>
        call.id === callId
          ? {
              ...call,
              status,
              timestamp:
                status === "in-progress"
                  ? new Date().toISOString()
                  : call.timestamp,
            }
          : call
      )
    );

    // Atualizar o status da mesa correspondente
    setTables((prev) =>
      prev.map((table) =>
        table.id === updatedCall.tableId
          ? {
              ...table,
              status: status === "completed" ? "available" : "in-service",
            }
          : table
      )
    );

    // Feedback tátil ao atualizar status
    Haptics.notificationAsync(
      status === "completed"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error loading tables: {error}</Text>
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
