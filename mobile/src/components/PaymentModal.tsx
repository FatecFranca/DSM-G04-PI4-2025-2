import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pagamentoAPI } from '../services/api';

type MetodoPagamento = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  contaId: string;
  valorTotal: number;
  valorPago: number;
  onPaymentSuccess?: (contaFechada: boolean) => void;
}

export default function PaymentModal({
  visible,
  onClose,
  contaId,
  valorTotal,
  valorPago,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [valorPagamento, setValorPagamento] = useState('');
  const [metodoSelecionado, setMetodoSelecionado] = useState<MetodoPagamento | null>(null);
  const [loading, setLoading] = useState(false);

  // Arredondar para evitar problemas de precisão decimal
  const valorRestante = Math.round((valorTotal - valorPago) * 100) / 100;

  useEffect(() => {
    console.log('🔔 PaymentModal - Props atualizadas:', {
      visible,
      contaId,
      valorTotal,
      valorPago,
      valorRestante,
    });
    
    if (visible) {
      // Sugerir o valor restante como padrão
      setValorPagamento(valorRestante.toFixed(2));
      setMetodoSelecionado(null);
    }
  }, [visible, valorRestante]);

  const metodosPagamento: { tipo: MetodoPagamento; nome: string; icone: string }[] = [
    { tipo: 'dinheiro', nome: 'Dinheiro', icone: 'cash-outline' },
    { tipo: 'cartao_credito', nome: 'Cartão Crédito', icone: 'card-outline' },
    { tipo: 'cartao_debito', nome: 'Cartão Débito', icone: 'card-outline' },
    { tipo: 'pix', nome: 'PIX', icone: 'phone-portrait-outline' },
  ];

  const handleConfirmarPagamento = async () => {
    const valor = parseFloat(valorPagamento);

    console.log('💰 Validando pagamento:', {
      valor,
      valorTotal,
      valorPago,
      valorRestante,
      valorPagamentoString: valorPagamento,
      comparacao: `${valor} > ${valorRestante} = ${valor > valorRestante}`,
    });

    if (!metodoSelecionado) {
      Alert.alert('Atenção', 'Selecione um método de pagamento');
      return;
    }

    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Atenção', 'Insira um valor válido');
      return;
    }

    // Usar arredondamento para 2 casas decimais na comparação
    const valorArredondado = Math.round(valor * 100) / 100;
    const valorRestanteArredondado = Math.round(valorRestante * 100) / 100;

    if (valorArredondado > valorRestanteArredondado) {
      console.log('❌ Valor excede o restante!', {
        valorArredondado,
        valorRestanteArredondado,
      });
      Alert.alert(
        'Atenção',
        `O valor não pode ser maior que o restante (R$ ${valorRestanteArredondado.toFixed(2)})`
      );
      return;
    }

    console.log('✅ Validação passou, registrando pagamento...');

    try {
      setLoading(true);

      await pagamentoAPI.adicionar(contaId, valor, metodoSelecionado);

      const novoValorPago = valorPago + valor;
      const contaFechada = novoValorPago >= valorTotal;

      Alert.alert(
        'Sucesso',
        contaFechada
          ? 'Pagamento registrado! Conta fechada com sucesso.'
          : `Pagamento de R$ ${valor.toFixed(2)} registrado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onPaymentSuccess?.(contaFechada);
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar pagamento';
      Alert.alert('Erro', errorMessage);
      console.error('Erro ao registrar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('🎨 PaymentModal renderizando - visible:', visible);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Pagamento</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valor Total:</Text>
              <Text style={styles.infoValue}>R$ {valorTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Já Pago:</Text>
              <Text style={styles.infoPaid}>R$ {valorPago.toFixed(2)}</Text>
            </View>
            <View style={[styles.infoRow, styles.totalRow]}>
              <Text style={styles.infoLabelBold}>Restante:</Text>
              <Text style={styles.infoRestante}>R$ {valorRestante.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valor do Pagamento</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.input}
                value={valorPagamento}
                onChangeText={setValorPagamento}
                keyboardType="decimal-pad"
                placeholder="0,00"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Pagamento</Text>
            <View style={styles.metodosContainer}>
              {metodosPagamento.map((metodo) => (
                <TouchableOpacity
                  key={metodo.tipo}
                  style={[
                    styles.metodoButton,
                    metodoSelecionado === metodo.tipo && styles.metodoButtonSelected,
                  ]}
                  onPress={() => setMetodoSelecionado(metodo.tipo)}
                >
                  <Ionicons
                    name={metodo.icone as any}
                    size={24}
                    color={metodoSelecionado === metodo.tipo ? '#fff' : '#0ea5e9'}
                  />
                  <Text
                    style={[
                      styles.metodoText,
                      metodoSelecionado === metodo.tipo && styles.metodoTextSelected,
                    ]}
                  >
                    {metodo.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirmarPagamento}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  infoPaid: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  infoRestante: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    color: '#333',
  },
  metodosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metodoButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  metodoButtonSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  metodoText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  metodoTextSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
