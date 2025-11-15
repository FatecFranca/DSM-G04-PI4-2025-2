import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { Chamado, Mesa } from "@/src/services/api";
import { ElapsedTime } from "@/src/components/ElapsedTime";
import { router } from "expo-router";

interface ChamadosModalProps {
  visible: boolean;
  onClose: () => void;
  chamados: Chamado[];
  mesas: Mesa[];
  onAtenderChamado: (chamadoId: string) => void;
}

export default function ChamadosModal({
  visible,
  onClose,
  chamados,
  mesas,
  onAtenderChamado,
}: ChamadosModalProps) {
  const chamadosAbertos = chamados.filter((c) => c.status === "pendente");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>
              Chamados Pendentes ({chamadosAbertos.length})
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {chamadosAbertos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                Nenhum chamado pendente
              </ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.chamadosList}>
              {chamadosAbertos.map((chamado) => {
                const mesa =
                  typeof chamado.mesa === "object"
                    ? chamado.mesa
                    : mesas.find((m) => m._id === chamado.mesa);
                if (!mesa) return null;

                return (
                  <View key={chamado._id} style={styles.chamadoItem}>
                    <View style={styles.chamadoInfo}>
                      <ThemedText style={styles.mesaNumero}>
                        Mesa {mesa.numero}
                      </ThemedText>
                      <ElapsedTime
                        date={chamado.createdAt}
                        style={styles.chamadoTempo}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.atenderButton}
                      onPress={async () => {
                        await onAtenderChamado(chamado._id);
                        onClose();
                        const mesaId =
                          typeof chamado.mesa === "string"
                            ? chamado.mesa
                            : chamado.mesa._id;
                        router.push({
                          pathname: "/mesa/[id]",
                          params: { id: mesaId, numero: mesa.numero },
                        });
                      }}
                    >
                      <ThemedText style={styles.atenderButtonText}>
                        Atender
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  chamadosList: {
    flex: 1,
  },
  chamadoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 12,
  },
  chamadoInfo: {
    flex: 1,
  },
  mesaNumero: {
    fontSize: 16,
    fontWeight: "600",
  },
  chamadoTempo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  atenderButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  atenderButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
