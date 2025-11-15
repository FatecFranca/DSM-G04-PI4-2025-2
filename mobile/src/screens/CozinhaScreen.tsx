import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { pedidoAPI, PedidoCozinha } from '../services/api';
import { useUserStore } from '../stores/userStore';
import { websocketService } from '../services/websocket';
import ProfileModal from '../components/ProfileModal';
import Header from '../components/Header';

export default function CozinhaScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [pedidos, setPedidos] = useState<PedidoCozinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [processandoPedido, setProcessandoPedido] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'enviado_cozinha' | 'preparando' | 'pronto'>('todos');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarPedidos();

    // Listeners WebSocket
    const handleNovoPedido = (novoPedido: any) => {
      console.log('📡 Novo pedido recebido:', novoPedido);
      carregarPedidos();
    };

    const handlePedidoAtualizado = (pedidoAtualizado: any) => {
      console.log('📡 Pedido atualizado:', pedidoAtualizado);
      // Recarrega toda a lista para garantir que está atualizada
      carregarPedidos();
    };

    websocketService.on('novo_pedido', handleNovoPedido);
    websocketService.on('pedido_atualizado', handlePedidoAtualizado);

    return () => {
      websocketService.off('novo_pedido', handleNovoPedido);
      websocketService.off('pedido_atualizado', handlePedidoAtualizado);
    };
  }, []);

  const carregarPedidos = async () => {
    try {
      setError(null);
      const pedidosCozinha = await pedidoAPI.listarCozinha();
      setPedidos(pedidosCozinha);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      
      // Se for 401 ou 403, pode ser problema de autenticação
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou. Por favor, faça login novamente.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await useUserStore.getState().logout();
                router.replace('/login');
              },
            },
          ]
        );
      } else if (error.response?.status === 404) {
        // Endpoint não encontrado - pode ser problema no backend
        setError('Endpoint de pedidos não encontrado. Verifique se o backend está rodando.');
      } else {
        setError('Erro ao carregar pedidos. Tente fazer login novamente.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarPedidos();
  };

  const handleIniciarPreparo = async (pedidoId: string) => {
    try {
      setProcessandoPedido(pedidoId);
      await pedidoAPI.iniciarPreparo(pedidoId);
      Alert.alert('Sucesso', 'Preparo iniciado!');
      await carregarPedidos();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao iniciar preparo'
      );
    } finally {
      setProcessandoPedido(null);
    }
  };

  const handleMarcarPronto = async (pedidoId: string) => {
    try {
      setProcessandoPedido(pedidoId);
      await pedidoAPI.marcarPronto(pedidoId);
      Alert.alert('Sucesso', 'Pedido marcado como pronto!');
      await carregarPedidos();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao marcar como pronto'
      );
    } finally {
      setProcessandoPedido(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviado_cozinha':
        return '#ef4444'; // vermelho
      case 'preparando':
        return '#f59e0b'; // amarelo
      case 'pronto':
        return '#10b981'; // verde
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enviado_cozinha':
        return 'Aguardando';
      case 'preparando':
        return 'Preparando';
      case 'pronto':
        return 'Pronto';
      default:
        return status;
    }
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

  const renderPedido = (pedido: PedidoCozinha) => {
    const isProcessing = processandoPedido === pedido._id;

    return (
      <View key={pedido._id} style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <View style={styles.mesaInfo}>
            <Ionicons name="restaurant" size={24} color="#0ea5e9" />
            <Text style={styles.mesaNumero}>Mesa {pedido.mesa.numero}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(pedido.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(pedido.status)}</Text>
          </View>
        </View>

        <View style={styles.pedidoBody}>
          <Text style={styles.tempoText}>{formatarTempo(pedido.createdAt)}</Text>

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
              <Text style={styles.obsGeraisText}>{pedido.observacoes_gerais}</Text>
            </View>
          )}
        </View>

        <View style={styles.pedidoFooter}>
          {pedido.status === 'enviado_cozinha' && (
            <TouchableOpacity
              style={[styles.button, styles.buttonIniciar]}
              onPress={() => handleIniciarPreparo(pedido._id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Iniciar Preparo</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {pedido.status === 'preparando' && (
            <TouchableOpacity
              style={[styles.button, styles.buttonPronto]}
              onPress={() => handleMarcarPronto(pedido._id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Marcar como Pronto</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Cozinha"
          onProfilePress={() => setIsProfileVisible(true)}
          showPerformance={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Carregando pedidos...</Text>
        </View>
        <ProfileModal
          visible={isProfileVisible}
          onClose={() => setIsProfileVisible(false)}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          title="Cozinha"
          onProfilePress={() => setIsProfileVisible(true)}
          showPerformance={false}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={carregarPedidos}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.retryButton, styles.logoutButton]} 
              onPress={async () => {
                await useUserStore.getState().logout();
                router.replace('/login');
              }}
            >
              <Text style={styles.retryButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ProfileModal
          visible={isProfileVisible}
          onClose={() => setIsProfileVisible(false)}
        />
      </View>
    );
  }

  const pedidosAguardando = pedidos.filter(
    (p) => p.status === 'enviado_cozinha'
  );
  const pedidosPreparando = pedidos.filter((p) => p.status === 'preparando');
  const pedidosProntos = pedidos.filter((p) => p.status === 'pronto');

  // Filtra pedidos baseado no status selecionado
  const pedidosFiltrados = filtroStatus === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtroStatus);

  return (
    <View style={styles.container}>
      <Header
        title="Cozinha"
        subtitle={`Bem-vindo, ${user?.nome || 'Cozinheiro'}!`}
        onProfilePress={() => setIsProfileVisible(true)}
        showPerformance={false}
      />

      <View style={styles.statsBar}>
        <TouchableOpacity 
          style={[
            styles.statItem, 
            filtroStatus === 'enviado_cozinha' && styles.statItemActive
          ]}
          onPress={() => setFiltroStatus(filtroStatus === 'enviado_cozinha' ? 'todos' : 'enviado_cozinha')}
        >
          <Text style={[
            styles.statNumber,
            filtroStatus === 'enviado_cozinha' && styles.statNumberActive
          ]}>{pedidosAguardando.length}</Text>
          <Text style={[
            styles.statLabel,
            filtroStatus === 'enviado_cozinha' && styles.statLabelActive
          ]}>Aguardando</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statItem,
            filtroStatus === 'preparando' && styles.statItemActive
          ]}
          onPress={() => setFiltroStatus(filtroStatus === 'preparando' ? 'todos' : 'preparando')}
        >
          <Text style={[
            styles.statNumber,
            filtroStatus === 'preparando' && styles.statNumberActive
          ]}>{pedidosPreparando.length}</Text>
          <Text style={[
            styles.statLabel,
            filtroStatus === 'preparando' && styles.statLabelActive
          ]}>Preparando</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statItem,
            filtroStatus === 'pronto' && styles.statItemActive
          ]}
          onPress={() => setFiltroStatus(filtroStatus === 'pronto' ? 'todos' : 'pronto')}
        >
          <Text style={[
            styles.statNumber,
            filtroStatus === 'pronto' && styles.statNumberActive
          ]}>{pedidosProntos.length}</Text>
          <Text style={[
            styles.statLabel,
            filtroStatus === 'pronto' && styles.statLabelActive
          ]}>Prontos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {pedidosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {filtroStatus === 'todos' 
                ? 'Nenhum pedido pendente'
                : `Nenhum pedido ${getStatusText(filtroStatus).toLowerCase()}`}
            </Text>
            <Text style={styles.emptySubtext}>
              {filtroStatus !== 'todos' && (
                <TouchableOpacity onPress={() => setFiltroStatus('todos')}>
                  <Text style={styles.voltarTodosText}>Ver todos os pedidos</Text>
                </TouchableOpacity>
              )}
            </Text>
          </View>
        ) : (
          <>
            {filtroStatus === 'todos' ? (
              <>
                {pedidosAguardando.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      🔴 Aguardando ({pedidosAguardando.length})
                    </Text>
                    {pedidosAguardando.map(renderPedido)}
                  </View>
                )}

                {pedidosPreparando.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      🟡 Preparando ({pedidosPreparando.length})
                    </Text>
                    {pedidosPreparando.map(renderPedido)}
                  </View>
                )}

                {pedidosProntos.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      🟢 Prontos ({pedidosProntos.length})
                    </Text>
                    {pedidosProntos.map(renderPedido)}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {filtroStatus === 'enviado_cozinha' && `🔴 Aguardando (${pedidosFiltrados.length})`}
                  {filtroStatus === 'preparando' && `🟡 Preparando (${pedidosFiltrados.length})`}
                  {filtroStatus === 'pronto' && `🟢 Prontos (${pedidosFiltrados.length})`}
                </Text>
                {pedidosFiltrados.map(renderPedido)}
              </View>
            )}
          </>
        )}
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statItemActive: {
    backgroundColor: '#0ea5e9',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statNumberActive: {
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statLabelActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
    marginTop: 8,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pedidoBody: {
    marginBottom: 12,
  },
  tempoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  itemPedido: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemQuantidade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
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
  pedidoFooter: {
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIniciar: {
    backgroundColor: '#f59e0b',
  },
  buttonPronto: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aguardandoEntrega: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  aguardandoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  voltarTodosText: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
