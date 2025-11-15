import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pedidoAPI } from '../services/api';
import { usePedidoProntoStore } from '../stores/pedidoProntoStore';

interface PedidoPronto {
  _id: string;
  mesa: {
    _id: string;
    numero: number;
  };
  itens: {
    item: {
      _id: string;
      nome: string;
    };
    quantidade: number;
    observacao?: string;
  }[];
  status: string;
  observacoes_gerais?: string;
  createdAt: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PedidosProntosModal({ visible, onClose }: Props) {
  const pedidos = usePedidoProntoStore((state) => state.pedidosProntos) as PedidoPronto[];
  const carregarPedidosProntos = usePedidoProntoStore((state) => state.carregarPedidosProntos);
  const [processando, setProcessando] = useState<string | null>(null);

  const handleMarcarEntregue = async (pedidoId: string) => {
    Alert.alert(
      'Confirmar Entrega',
      'Tem certeza que deseja marcar este pedido como entregue?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setProcessando(pedidoId);
              await pedidoAPI.marcarEntregue(pedidoId);
              await carregarPedidosProntos();
              Alert.alert('Sucesso', 'Pedido marcado como entregue!');
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao marcar pedido como entregue'
              );
            } finally {
              setProcessando(null);
            }
          },
        },
      ]
    );
  };

  const formatarTempo = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `${diffMin}min atrás`;
    const diffHoras = Math.floor(diffMin / 60);
    return `${diffHoras}h atrás`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="checkmark-done" size={24} color="#10b981" />
              <Text style={styles.title}>Pedidos Prontos</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {pedidos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum pedido pronto</Text>
              <Text style={styles.emptySubtext}>
                Os pedidos prontos para entrega aparecerão aqui
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {pedidos.map((pedido) => (
                <View key={pedido._id} style={styles.pedidoCard}>
                  <View style={styles.pedidoHeader}>
                    <View style={styles.mesaInfo}>
                      <Ionicons name="restaurant" size={20} color="#10b981" />
                      <Text style={styles.mesaNumero}>Mesa {pedido.mesa.numero}</Text>
                    </View>
                    <Text style={styles.tempoText}>{formatarTempo(pedido.createdAt)}</Text>
                  </View>

                  <View style={styles.pedidoBody}>
                    {pedido.itens.map((item, index) => (
                      <View key={index} style={styles.itemPedido}>
                        <Text style={styles.itemQuantidade}>{item.quantidade}x</Text>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemNome}>{item.item.nome}</Text>
                          {item.observacao && (
                            <Text style={styles.itemObs}>Obs: {item.observacao}</Text>
                          )}
                        </View>
                      </View>
                    ))}

                    {pedido.observacoes_gerais && (
                      <View style={styles.obsGerais}>
                        <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                        <Text style={styles.obsGeraisText}>
                          {pedido.observacoes_gerais}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      processando === pedido._id && styles.buttonDisabled,
                    ]}
                    onPress={() => handleMarcarEntregue(pedido._id)}
                    disabled={processando === pedido._id}
                  >
                    {processando === pedido._id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Marcar como Entregue</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mesaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mesaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tempoText: {
    fontSize: 12,
    color: '#999',
  },
  pedidoBody: {
    marginBottom: 12,
  },
  itemPedido: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemQuantidade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    width: 40,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemObs: {
    fontSize: 14,
    color: '#f59e0b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  obsGerais: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  obsGeraisText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
