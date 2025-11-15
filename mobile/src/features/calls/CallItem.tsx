import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Call } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface CallItemProps {
  call: Call;
  disabled?: boolean;
  isOldest?: boolean;
  onStatusUpdate: (status: Call['status']) => void;
}

const CallItem: React.FC<CallItemProps> = ({ call, disabled, isOldest, onStatusUpdate }) => {
  const [elapsedTime, setElapsedTime] = React.useState('');
  const [isUrgent, setIsUrgent] = React.useState(false);

  React.useEffect(() => {
    const updateElapsedTime = () => {
      const now = new Date();
      const callTime = new Date(call.timestamp);
      const diffInSeconds = Math.floor((now.getTime() - callTime.getTime()) / 1000);
      
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      
      setIsUrgent(diffInSeconds >= 150);
      
      if (minutes > 0) {
        setElapsedTime(`${minutes}min ${seconds}s`);
      } else {
        setElapsedTime(`${seconds}s`);
      }
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [call.timestamp]);

  const renderActionButton = () => {
    switch (call.status) {
      case 'pending':
        return (
          <TouchableOpacity
            style={[
              styles.button, 
              styles.acceptButton,
              disabled && { opacity: 0.6 },
              (isUrgent || isOldest) && !disabled && styles.urgentAcceptButton
            ]}
            disabled={disabled}
            onPress={() => onStatusUpdate('in-progress')}
          >
            <Text style={styles.buttonText}>Atender</Text>
          </TouchableOpacity>
        );
      case 'in-progress':
        return (
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={() => onStatusUpdate('completed')}
          >
            <Text style={styles.buttonText}>Finalizar</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[
      styles.container,
      (isUrgent || isOldest) && styles.oldestContainer
    ]}>
      <View style={styles.info}>
        <Text style={styles.tableNumber}>Mesa {call.tableId}</Text>
        <View style={[
          styles.waitingTimeContainer,
          (isUrgent || isOldest) && styles.oldestWaitingTimeContainer
        ]}>
          <Ionicons name="time-outline" size={16} color={(isUrgent || isOldest) ? "#991b1b" : "#666"} />
          <Text style={[
            styles.waitingTime,
            (isUrgent || isOldest) && styles.oldestWaitingTime
          ]}>{elapsedTime}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {renderActionButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  oldestContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },

  info: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  waitingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  waitingTime: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 4,
  },
  oldestWaitingTimeContainer: {
    backgroundColor: '#fee2e2',
  },
  oldestWaitingTime: {
    color: '#991b1b',
  },
  actions: {
    marginLeft: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  urgentAcceptButton: {
    backgroundColor: '#dc2626',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButton: {
    backgroundColor: '#0ea5e9',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CallItem;