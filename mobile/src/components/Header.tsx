import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderProps {
  onProfilePress: () => void;
}

export default function Header({ onProfilePress }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ClickServ</Text>
      </View>
      
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.performanceButton}
          onPress={() => router.push('/desempenho')}
        >
          <Ionicons name="stats-chart" size={20} color="#fff" />
          <Text style={styles.performanceText}>Desempenho</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>João Silva</Text>
            <Text style={styles.profileRole}>Garçom</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100' }}
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44,
    backgroundColor: '#0ea5e9',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  performanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 12,
    gap: 6,
  },
  performanceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 12,
  },
  profileInfo: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
