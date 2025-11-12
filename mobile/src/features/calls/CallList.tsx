import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Call } from "../../types";
import CallItem from "./CallItem";

interface CallListProps {
  calls: Call[];
  disabled?: boolean;
  onCallStatusUpdate: (callId: string, status: Call["status"]) => void;
}

const CallList: React.FC<CallListProps> = ({
  calls,
  disabled,
  onCallStatusUpdate,
}) => {
  // Log para ver quando o componente re-renderiza
  console.log("🎨 CallList renderizado com", calls.length, "chamados");

  const sortedCalls = [...calls].sort((a, b) => {
    // Ordena pelo timestamp mais antigo primeiro (maior tempo de espera)
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedCalls}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CallItem
            call={item}
            disabled={disabled}
            isOldest={index === 0} // Marca o primeiro item como o mais antigo
            onStatusUpdate={(status: Call["status"]) =>
              onCallStatusUpdate(item.id, status)
            }
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    paddingTop: 16,
  },
});

export default CallList;
