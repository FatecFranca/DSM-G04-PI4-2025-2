import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { relatorioAPI, DesempenhoVendas, DesempenhoAtendimento } from '../services/api';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function DesempenhoScreen() {
  const router = useRouter();
  const [vendas, setVendas] = useState<DesempenhoVendas | null>(null);
  const [atendimento, setAtendimento] = useState<DesempenhoAtendimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setError(null);
      const [vendasData, atendimentoData] = await Promise.all([
        relatorioAPI.meuDesempenhoVendas(),
        relatorioAPI.meuDesempenhoAtendimento(),
      ]);
      
      setVendas(vendasData);
      setAtendimento(atendimentoData);
    } catch (err: any) {
      console.error('Erro ao carregar desempenho:', err);
      setError('Erro ao carregar dados de desempenho');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const formatarTempo = (segundos: number): string => {
    if (segundos < 60) {
      return `${segundos.toFixed(0)}s`;
    }
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos}m ${segs}s`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Carregando desempenho...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarDados}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meu Desempenho</Text>
          {atendimento && (
            <Text style={styles.subtitle}>Olá, {atendimento.nomeGarcom}!</Text>
          )}
        </View>

        {/* Card de Vendas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Desempenho em Vendas</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Faturamento Total</Text>
                <Text style={[styles.statValue, styles.primary]}>
                  R$ {vendas?.faturamentoTotal.toFixed(2) || '0,00'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total de Pedidos</Text>
                <Text style={styles.statValue}>{vendas?.totalPedidos || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Ticket Médio</Text>
                <Text style={styles.statValue}>
                  R$ {vendas?.ticketMedio.toFixed(2) || '0,00'}
                </Text>
              </View>
            </View>

            {/* Gráficos de Vendas */}
            {vendas && vendas.totalPedidos > 0 && (
              <>
                <View style={styles.divider} />
                
                {/* Gráfico 1: Faturamento Total */}
                <Text style={styles.chartTitle}>Faturamento Total</Text>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartValueLabel}>
                    R$ {vendas.faturamentoTotal.toFixed(1)}
                  </Text>
                  <BarChart
                    data={{
                      labels: ['Faturamento'],
                      datasets: [{
                        data: [vendas.faturamentoTotal]
                      }]
                    }}
                    width={screenWidth - 72}
                    height={180}
                    yAxisLabel="R$ "
                    yAxisSuffix=""
                    fromZero
                    segments={4}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: '#e5e7eb'
                      }
                    }}
                    style={styles.chart}
                  />
                </View>

                {/* Gráfico 2: Pedidos e Ticket Médio */}
                <Text style={[styles.chartTitle, { marginTop: 20 }]}>Pedidos e Ticket Médio</Text>
                <View style={styles.chartContainer}>
                  <View style={styles.chartValuesRow}>
                    <Text style={styles.chartValueLabel}>{vendas.totalPedidos}</Text>
                    <Text style={styles.chartValueLabel}>R$ {vendas.ticketMedio.toFixed(1)}</Text>
                  </View>
                  <BarChart
                    data={{
                      labels: ['Pedidos', 'Ticket Médio'],
                      datasets: [{
                        data: [
                          vendas.totalPedidos,
                          vendas.ticketMedio
                        ]
                      }]
                    }}
                    width={screenWidth - 72}
                    height={180}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    segments={4}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: '#e5e7eb'
                      }
                    }}
                    style={styles.chart}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Card de Atendimento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#0ea5e9" />
            <Text style={styles.sectionTitle}>Desempenho em Atendimento</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tempo Médio de Resposta</Text>
                <Text style={[styles.statValue, styles.secondary]}>
                  {formatarTempo(atendimento?.tempoMedioSegundos || 0)}
                </Text>
                <Text style={styles.statHint}>
                  Quanto menor, melhor!
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Chamados Atendidos</Text>
                <Text style={styles.statValue}>{atendimento?.totalChamados || 0}</Text>
              </View>
            </View>

            {atendimento && atendimento.totalChamados > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={styles.chartTitle}>Análise de Performance</Text>
                <PieChart
                  data={[
                    {
                      name: 'Rápido (< 5min)',
                      population: atendimento.tempoMedioSegundos < 300 ? 60 : 20,
                      color: '#10b981',
                      legendFontColor: '#333',
                      legendFontSize: 12,
                    },
                    {
                      name: 'Médio (5-10min)',
                      population: atendimento.tempoMedioSegundos >= 300 && atendimento.tempoMedioSegundos < 600 ? 60 : 30,
                      color: '#fbbf24',
                      legendFontColor: '#333',
                      legendFontSize: 12,
                    },
                    {
                      name: 'Lento (> 10min)',
                      population: atendimento.tempoMedioSegundos >= 600 ? 60 : 10,
                      color: '#ef4444',
                      legendFontColor: '#333',
                      legendFontSize: 12,
                    },
                  ]}
                  width={screenWidth - 72}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.tipsTitle}>Dicas para Melhorar</Text>
          </View>
          <Text style={styles.tipsText}>
            • Responda aos chamados rapidamente{'\n'}
            • Sugira itens para aumentar o ticket médio{'\n'}
            • Mantenha um atendimento cordial e eficiente
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    gap: 8,
    backgroundColor: '#fff',
  },
  backText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
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
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  primary: {
    color: '#10b981',
  },
  secondary: {
    color: '#0ea5e9',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  tipsText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartValueLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  chartValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 40,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});