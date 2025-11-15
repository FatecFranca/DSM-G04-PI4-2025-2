import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/src/stores/userStore";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onProfilePress: () => void;
  showPerformance?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  onProfilePress,
  showPerformance = true
}: HeaderProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title || "ClickServ"}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.rightContainer}>
        {showPerformance && (
          <TouchableOpacity
            style={styles.performanceButton}
            onPress={() => router.push("/desempenho")}
          >
            <Ionicons name="stats-chart" size={20} color="#fff" />
            <Text style={styles.performanceText}>Desempenho</Text>
          </TouchableOpacity>
        )}

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
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    position: "relative",
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
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
