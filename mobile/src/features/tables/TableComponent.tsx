import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Table } from '../../types';

interface TableComponentProps {
  table: Table;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const TableComponent: React.FC<TableComponentProps> = ({ table, onPress, style, disabled }) => {
  const getStatusColor = () => {
    switch (table.status) {
      case 'called':
        return '#ef4444';
      case 'in-service':
        return '#f97316';
      default:
        return '#22c55e';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getStatusColor(), opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{table.number}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default TableComponent;