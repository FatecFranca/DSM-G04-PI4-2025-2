import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Call } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface ActiveCallProps {
  call: Call;
  onFinishCall: () => void;
  onMakeOrder: () => void;
  onRegisterPayment?: () => void;
}

export default function ActiveCall({ call, onFinishCall, onMakeOrder, onRegisterPayment }: ActiveCallProps) {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  
  console.log('🎯 ActiveCall - onRegisterPayment existe?', !!onRegisterPayment);
  
  React.useEffect(() => {
    if (!call) return;
    
    const startTimeMs = new Date(call.timestamp).getTime();
    const initialElapsed = Math.floor((Date.now() - startTimeMs) / 1000);
    setElapsedTime(initialElapsed);
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [call]);

  if (!call) return null;

  const formattedTime = new Date(call.timestamp).toLocaleTimeString().slice(0, 5);
  
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const formattedElapsedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chamado em Atendimento</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <View style={styles.tableInfo}>
            <Text style={styles.tableNumber}>Mesa {call.tableId}</Text>
            <Text style={styles.status}>Em andamento</Text>
          </View>
          
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color="#0ea5e9" />
            <Text style={styles.timer}>{formattedElapsedTime}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.orderButton]} 
            onPress={onMakeOrder}
          >
            <Ionicons name="restaurant-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Fazer Pedido</Text>
          </TouchableOpacity>
          
          {onRegisterPayment && (
            <TouchableOpacity 
              style={[styles.button, styles.paymentButton]} 
              onPress={() => {
                console.log('🔘 Botão Pagamento pressionado no ActiveCall');
                Alert.alert('Teste', 'Botão foi clicado!');
                onRegisterPayment();
              }}
            >
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Pagamento</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.finishButton]} 
            onPress={onFinishCall}
          >
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Finalizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  time: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 10,
  },
  timer: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  orderButton: {
    backgroundColor: '#4CAF50',
  },
  paymentButton: {
    backgroundColor: '#f59e0b',
  },
  finishButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});