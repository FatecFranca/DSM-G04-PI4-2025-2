import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { contaAPI, type Conta } from "@/src/services/api";
import { websocketService } from "@/src/services/websocket";
import { router } from "expo-router";
import OrderModal from "@/src/components/OrderModal";
import PaymentModal from "@/src/components/PaymentModal";
import { Ionicons } from "@expo/vector-icons";

interface TableDetailsScreenProps {
  mesaId: string;
  mesaNumero: number;
}

export default function TableDetailsScreen({
  mesaId,
  mesaNumero,
}: TableDetailsScreenProps) {
  const [conta, setConta] = useState<Conta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  useEffect(() => {
    carregarConta();

    const handleNovaConta = (novaConta: Conta) => {
      console.log("📡 Nova conta via WebSocket:", novaConta);
      if (novaConta.mesa === mesaId) {
        setConta(novaConta);
      }
    };

    const handleContaAtualizada = (
      contaAtualizada: Partial<Conta> & { _id: string }
    ) => {
      console.log("📡 Conta atualizada via WebSocket:", contaAtualizada);
      setConta((prevConta) => {
        if (prevConta && prevConta._id === contaAtualizada._id) {
          return { ...prevConta, ...contaAtualizada };
        }
        return prevConta;
      });
    };

    websocketService.on("nova_conta", handleNovaConta);
    websocketService.on("conta_atualizada", handleContaAtualizada);

    return () => {
      websocketService.off("nova_conta", handleNovaConta);
      websocketService.off("conta_atualizada", handleContaAtualizada);
    };
  }, [mesaId]); 

  const carregarConta = async () => {
    try {
      console.log("Carregando conta para mesa:", mesaId);
      setLoading(true);
      setError(null);
      const contaAtiva = await contaAPI.getContaAtiva(mesaId);
      console.log("Conta carregada:", contaAtiva);
      setConta(contaAtiva);
    } catch (error: any) {
      console.error("Erro ao carregar conta:", error);
      
      if (error.response?.status === 401) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else if (error.response?.status === 404) {
        setConta(null);
      } else {
        setError("Erro ao carregar detalhes da conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddPedido = () => {
    setIsOrderModalVisible(true);
  };

  const handleRegistrarPagamento = () => {
    console.log("Registrar pagamento - Abrindo modal");
    setIsPaymentModalVisible(true);
  };

  const handleCancelarConta = () => {
    Alert.alert(
      'Cancelar Conta',
      'Tem certeza que deseja cancelar esta conta? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await contaAPI.cancelar(conta!._id);
              Alert.alert('Sucesso', 'Conta cancelada com sucesso!', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao cancelar conta');
              console.error('Erro ao cancelar conta:', error);
            }
          },
        },
      ]
    );
  };

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
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
            </TouchableOpacity>
            <ThemedText style={styles.titulo}>Erro</ThemedText>
          </View>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <ThemedText style={styles.error}>{error}</ThemedText>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={carregarConta}>
              <ThemedText style={styles.retryButtonText}>
                Tentar Novamente
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: '#666' }]} 
              onPress={() => router.back()}
            >
              <ThemedText style={styles.retryButtonText}>
                Voltar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    );
  }

  if (!conta) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>
          Mesa não possui conta ativa
        </ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.retryButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const saldoDevedor = (conta.valor_total || 0) - (conta.valor_pago || 0);

  return (
    <ThemedView style={styles.container}>
      <OrderModal
        visible={isOrderModalVisible}
        onClose={() => setIsOrderModalVisible(false)}
        tableId={mesaNumero}
        table_id={mesaId}
        onConfirmOrder={() => {
          carregarConta();
          setIsOrderModalVisible(false);
        }}
      />

      <PaymentModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        contaId={conta?._id || ''}
        valorTotal={conta?.valor_total || 0}
        valorPago={conta?.valor_pago || 0}
        onPaymentSuccess={async (contaFechada) => {
          setIsPaymentModalVisible(false);
          await carregarConta();
          
          if (contaFechada) {
            console.log('Conta fechada! Voltando...');
            router.back();
          }
        }}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
          </TouchableOpacity>
          <ThemedText style={styles.titulo}>Mesa {mesaNumero}</ThemedText>
        </View>
        <ThemedText style={styles.subtitulo}>Conta Ativa</ThemedText>
      </View>

      <View style={styles.resumo}>
        <View style={styles.kpiContainer}>
          <ThemedText style={styles.kpiLabel}>Valor Total</ThemedText>
          <ThemedText style={styles.kpiValue}>
            R$ {(conta.valor_total || 0).toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.kpiContainer}>
          <ThemedText style={styles.kpiLabel}>Valor Pago</ThemedText>
          <ThemedText style={styles.kpiValue}>
            R$ {(conta.valor_pago || 0).toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.kpiContainer}>
          <ThemedText style={styles.kpiLabel}>Saldo Devedor</ThemedText>
          <ThemedText
            style={[
              styles.kpiValue,
              { color: saldoDevedor > 0 ? "#ef4444" : "#22c55e" },
            ]}
          >
            R$ {saldoDevedor.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.extrato}>
        {conta.pedidos?.map((pedido) =>
          pedido.itens.map((item, index) => (
            <View key={`${pedido._id}-${index}`} style={styles.itemPedido}>
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemQuantidade}>
                  {item.quantidade}x
                </ThemedText>
                <ThemedText style={styles.itemNome}>
                  {item.item.nome}
                  {item.observacao && (
                    <ThemedText style={styles.itemObs}>
                      {` (${item.observacao})`}
                    </ThemedText>
                  )}
                </ThemedText>
              </View>
              <ThemedText style={styles.itemPreco}>
                R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
              </ThemedText>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleAddPedido}
        >
          <ThemedText style={styles.buttonText}>Adicionar Pedido</ThemedText>
        </TouchableOpacity>

        {(conta.valor_total || 0) > 0 ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleRegistrarPagamento}
          >
            <ThemedText style={styles.buttonText}>Registrar Pagamento</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleCancelarConta}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Cancelar Conta</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    marginLeft: -8,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 18,
    opacity: 0.7,
  },
  resumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  kpiContainer: {
    flex: 1,
    alignItems: "center",
  },
  kpiLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  extrato: {
    flex: 1,
    marginBottom: 16,
  },
  itemPedido: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemQuantidade: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  itemNome: {
    fontSize: 16,
  },
  itemObs: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemPreco: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: "#0ea5e9",
  },
  buttonSecondary: {
    backgroundColor: "#22c55e",
  },
  buttonDanger: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
});
