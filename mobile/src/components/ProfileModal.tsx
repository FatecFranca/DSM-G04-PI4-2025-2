import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/src/stores/userStore";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const refreshToken = useUserStore((state) => state.refreshToken);

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          onClose();

          try {
            if (refreshToken) {
              const { userAPI } = await import("@/src/services/api");
              await userAPI.logout(refreshToken);
            }
          } catch (error) {
            console.error("Erro ao fazer logout no backend:", error);
          }

          await logout();

          setTimeout(() => {
            router.replace("/login");
          }, 100);
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Perfil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#404040" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.profileSection}>
              <View style={styles.userIconContainer}>
                <Ionicons
                  name="person-circle-outline"
                  size={80}
                  color="#0ea5e9"
                />
              </View>
              <Text style={styles.name}>{user?.nome || "Usuário"}</Text>
              <Text style={styles.role}>{user?.cargo || ""}</Text>
              <Text style={styles.email}>{user?.email || ""}</Text>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  userIconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
    textAlign: "center",
  },
  role: {
    fontSize: 16,
    color: "#737373",
    marginBottom: 8,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "#0ea5e9",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
  },
});
