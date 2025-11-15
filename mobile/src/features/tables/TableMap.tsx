import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Table } from '../../types';
import TableComponent from './TableComponent';

interface TableMapProps {
  tables: Table[];
  disabled?: boolean;
  onTablePress: (tableId: number) => void;
}

const TableMap: React.FC<TableMapProps> = ({ tables, disabled, onTablePress }) => {
  const screenWidth = Dimensions.get('window').width - 32;
  const mapHeight = 180;
  
  const rows = 2;
  const cols = 3;
  const cellWidth = screenWidth / cols;
  const cellHeight = mapHeight / rows;

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      {tables.map((table) => {
        const row = Math.floor((table.id - 1) / cols);
        const col = (table.id - 1) % cols;
        
        return (
          <TableComponent
            key={table.id}
            table={table}
            disabled={disabled}
            onPress={() => !disabled && onTablePress(table.id)}
            style={{
              position: 'absolute',
              left: col * cellWidth + (cellWidth - 60) / 2,
              top: row * cellHeight + (cellHeight - 60) / 2,
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default TableMap;