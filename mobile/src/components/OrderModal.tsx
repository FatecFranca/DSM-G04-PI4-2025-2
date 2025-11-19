import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { cardapioAPI, pedidoAPI, CardapioItem } from '../services/api';

type OrderItem = {
  item: CardapioItem;
  quantidade: number;
  observacao?: string;
};

type OrderModalProps = {
  visible: boolean;
  onClose: () => void;
  tableId: number;
  table_id?: string;
  onConfirmOrder?: (items: OrderItem[]) => void;
};

export default function OrderModal({ visible, onClose, tableId, table_id, onConfirmOrder }: OrderModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<CardapioItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isProductListVisible, setIsProductListVisible] = useState(false);
  const [products, setProducts] = useState<CardapioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const data = await cardapioAPI.listar();
      const produtosDisponiveis = data.filter((item: CardapioItem) => item.disponivel);
      
      setProducts(produtosDisponiveis);
      
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
      Alert.alert(
        'Erro', 
        'Não foi possível carregar o cardápio. Verifique se o backend está rodando.'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    setOrderItems(prev => [...prev, { 
      item: selectedProduct, 
      quantidade: quantity,
      observacao: '' 
    }]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => 
      total + (item.item.preco * item.quantidade), 0
    );
  };

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um item ao pedido');
      return;
    }

    const mesaId = table_id || tableId.toString();
    
    if (!table_id) {
      console.warn('⚠️ Usando tableId mockado. Para produção, use table_id do MongoDB');
    }

    try {
      setSubmitting(true);
      
      const itensFormatados = orderItems.map(item => ({
        item: item.item._id,
        quantidade: item.quantidade,
        observacao: item.observacao || ''
      }));

      const response = await pedidoAPI.criar(mesaId, {
        itens: itensFormatados,
        observacoes_gerais: ''
      });

      Alert.alert('Sucesso', response.message);
      
      onConfirmOrder?.(orderItems);
      
      setOrderItems([]);
      setSelectedProduct(null);
      setQuantity(1);
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar pedido';
      Alert.alert('Erro', errorMessage);
      console.error('Erro detalhado:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Fazer Pedido - Mesa {tableId}</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#0ea5e9" style={{ marginVertical: 20 }} />
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Sem itens no cardápio</Text>
              <Text style={styles.emptySubtext}>
                Adicione produtos no sistema para começar a fazer pedidos
              </Text>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { marginTop: 20 }]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>

              <Pressable 
                style={styles.productSelector}
                onPress={() => setIsProductListVisible(!isProductListVisible)}
              >
                <Text>
                  {selectedProduct ? selectedProduct.nome : 'Selecione um produto'}
                </Text>
              </Pressable>


              {isProductListVisible && (
                <ScrollView style={styles.productList}>
                  {products.map(product => (
                    <Pressable
                      key={product._id}
                      style={styles.productItem}
                      onPress={() => {
                        setSelectedProduct(product);
                        setIsProductListVisible(false);
                      }}
                    >
                      <View>
                        <Text style={styles.productName}>{product.nome}</Text>
                        {product.descricao && (
                          <Text style={styles.productDescription}>{product.descricao}</Text>
                        )}
                      </View>
                      <Text style={styles.productPrice}>R$ {product.preco.toFixed(2)}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}


              {selectedProduct && (
                <View style={styles.quantityControl}>
                  <TouchableOpacity 
                    onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{quantity}</Text>
                  <TouchableOpacity 
                    onPress={() => setQuantity(prev => prev + 1)}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddItem}
                  >
                    <Text style={styles.addButtonText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              )}


              <ScrollView style={styles.orderList}>
                {orderItems.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderItemName}>
                        {item.quantidade}x {item.item.nome}
                      </Text>
                    </View>
                    <Text style={styles.orderItemPrice}>
                      R$ {(item.item.preco * item.quantidade).toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>


              <View style={styles.footer}>
                <Text style={styles.total}>
                  Total: R$ {getTotalPrice().toFixed(2)}
                </Text>
                <View style={styles.buttons}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={onClose}
                    disabled={submitting}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirmOrder}
                    disabled={submitting || orderItems.length === 0}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Confirmar Pedido</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
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
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productSelector: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
  },
  productList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    maxHeight: 200,
    marginBottom: 10,
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 'auto',
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
  },
  orderList: {
    maxHeight: 200,
    marginVertical: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  orderItemName: {
    fontSize: 14,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  removeButton: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
