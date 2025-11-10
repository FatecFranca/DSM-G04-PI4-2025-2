import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/src/stores/userStore";

interface HeaderProps {
  onProfilePress: () => void;
}

export default function Header({ onProfilePress }: HeaderProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ClickServ</Text>
      </View>

      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.performanceButton}
          onPress={() => router.push("/desempenho")}
        >
          <Ionicons name="stats-chart" size={20} color="#fff" />
          <Text style={styles.performanceText}>Desempenho</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.nome || "Usuário"}</Text>
            <Text style={styles.profileRole}>{user?.cargo || ""}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44,
    backgroundColor: "#0ea5e9",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  performanceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 12,
    gap: 6,
  },
  performanceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  profileRole: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    marginTop: 2,
    textAlign: "center",
  },
});
