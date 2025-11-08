import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { Table, Call } from '../types';
import TableMap from '../features/tables/TableMap';
import CallList from '../features/calls/CallList';
import { wsService } from '../services/websocket';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import ProfileModal from '../components/ProfileModal';
import ActiveCall from '../components/ActiveCall';

export default function MainScreen() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [mapOffset] = useState(new Animated.Value(0));
  const [activeCall, setActiveCall] = useState<Call | null>({
    id: '2',
    tableId: 3,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'in-progress'
  });
  const [tables, setTables] = useState<Table[]>([
    { id: 1, number: '1', position: { x: 0.2, y: 0.2 }, status: 'available' },
    { id: 2, number: '2', position: { x: 0.5, y: 0.2 }, status: 'called' },
    { id: 3, number: '3', position: { x: 0.8, y: 0.2 }, status: 'in-service' },
    { id: 4, number: '4', position: { x: 0.2, y: 0.5 }, status: 'available' },
    { id: 5, number: '5', position: { x: 0.5, y: 0.5 }, status: 'available' },
    { id: 6, number: '6', position: { x: 0.8, y: 0.5 }, status: 'available' },
  ]);
  const [calls, setCalls] = useState<Call[]>([
    {
      id: '1',
      tableId: 2,
      timestamp: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: '2',
      tableId: 3,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'in-progress'
    }
  ]);
  const { width, height } = useWindowDimensions();

  // Simulação local de novos chamados (remova quando integrar com o WebSocket real)
  useEffect(() => {
    // Inicializa o offset do mapa se houver um chamado ativo
    if (activeCall) {
      mapOffset.setValue(0);
    }

    const simulateNewCall = () => {
      const availableTables = tables.filter(t => t.status === 'available');
      if (availableTables.length > 0) {
        const randomTable = availableTables[Math.floor(Math.random() * availableTables.length)];
        const newCall: Call = {
          id: Date.now().toString(),
          tableId: randomTable.id,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        handleNewCall(newCall);
      }
    };

    // Simular um novo chamado a cada 30 segundos
    const interval = setInterval(simulateNewCall, 30000);
    return () => clearInterval(interval);
  }, [tables]);

  const handleNewCall = (call: Call) => {
    // Vibrar o dispositivo quando receber uma nova chamada
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setCalls(prev => [...prev, call]);
    setTables(prev =>
      prev.map(table =>
        table.id === call.tableId
          ? { ...table, status: 'called' }
          : table
      )
    );
  };

  const handleTableUpdate = (updatedTable: Table) => {
    setTables(prev =>
      prev.map(table =>
        table.id === updatedTable.id ? updatedTable : table
      )
    );
  };

  const handleCallStatusUpdate = (callId: string, status: Call['status']) => {
    const updatedCall = calls.find(c => c.id === callId);
    if (!updatedCall) return;
    
    // Não permite aceitar novo chamado se já houver um em andamento
    if (status === 'in-progress' && activeCall) return;

    if (status === 'in-progress') {
      // Atualiza o timestamp para o momento em que o chamado foi aceito
      const updatedCallWithTime = {
        ...updatedCall,
        timestamp: new Date().toISOString()
      };
      setActiveCall(updatedCallWithTime);
      
      // Animar o mapa para baixo
      Animated.spring(mapOffset, {
        toValue: 0, // Ajustado para 0 para evitar espaço extra
        useNativeDriver: true,
        tension: 50, // Adiciona uma animação mais suave
        friction: 8,
      }).start();
    } else if (status === 'completed') {
      setActiveCall(null);
      
      // Animar o mapa de volta para cima
      Animated.spring(mapOffset, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }

    setCalls(prev =>
      prev.map(call =>
        call.id === callId 
          ? { 
              ...call, 
              status,
              timestamp: status === 'in-progress' ? new Date().toISOString() : call.timestamp 
            } 
          : call
      )
    );

    // Atualizar o status da mesa correspondente
    setTables(prev =>
      prev.map(table =>
        table.id === updatedCall.tableId
          ? { ...table, status: status === 'completed' ? 'available' : 'in-service' }
          : table
      )
    );

    // Feedback tátil ao atualizar status
    Haptics.notificationAsync(
      status === 'completed' 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => setIsProfileVisible(true)} />
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateY: mapOffset }]
          }
        ]}
      >
        <View style={styles.mapSection}>
          {activeCall && (
            <ActiveCall
              call={activeCall}
              onFinishCall={() => handleCallStatusUpdate(activeCall.id, 'completed')}
            />
          )}
          <View style={[styles.mapContainer, activeCall && styles.mapContainerWithActiveCall]}>
            <TableMap
              tables={tables}
              disabled={!!activeCall} // Desabilita interações quando há chamado ativo
              onTablePress={(tableId) => {
                if (activeCall) return; // Não permite aceitar novo chamado se já houver um ativo
                const call = calls.find(c => c.tableId === tableId && c.status === 'pending');
                if (call) {
                  handleCallStatusUpdate(call.id, 'in-progress');
                }
              }}
            />
          </View>
        </View>
        <View style={styles.callsContainer}>
          <CallList
            calls={calls.filter(call => call.status === 'pending')}
            disabled={!!activeCall}
            onCallStatusUpdate={handleCallStatusUpdate}
          />
        </View>
      </Animated.View>
      <ProfileModal 
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  mapSection: {
    backgroundColor: '#FFF',
  },
  mapContainer: {
    height: 220,
    backgroundColor: '#FFF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
  },
  mapContainerWithActiveCall: {
    height: 200,
  },
  callsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});