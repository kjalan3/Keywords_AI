// app/(tabs)/index.tsx (update imports and data loading)
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWorkoutStore } from '../../store/workoutStore';
import { getRelativeTime } from '../../utils/dateHelpers';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { workouts, loadWorkouts } = useWorkoutStore();
  const firstName = user?.firstName || 'there';

  useEffect(() => {
    if (user) {
      loadWorkouts(user.id);
    }
  }, []);

  // Calculate stats
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weeklyWorkouts = workouts.filter((w) => new Date(w.date) >= weekStart).length;

  // Get recent workouts
  const recentWorkouts = workouts.slice(0, 3);

  // Mock recovery data - will be replaced with real health data later
  const recoveryScore = 78;
  const currentStreak = 5;

  const getRecoveryColor = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#81C784'] as const;
    if (score >= 60) return ['#FF9800', '#FFB74D'] as const;
    return ['#F44336', '#E57373'] as const;
  };

  const getRecoveryStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent', emoji: '💪' };
    if (score >= 60) return { text: 'Good', emoji: '👍' };
    return { text: 'Low', emoji: '😴' };
  };

  const status = getRecoveryStatus(recoveryScore);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hey, {firstName}!</Text>
        <Text style={styles.subGreeting}>Ready to crush your workout?</Text>
      </View>

      {/* Recovery Card */}
      <LinearGradient
        colors={getRecoveryColor(recoveryScore)}
        style={styles.recoveryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.recoveryHeader}>
          <Text style={styles.recoveryTitle}>Recovery Status</Text>
          <Ionicons name="heart" size={24} color="#fff" />
        </View>
        <View style={styles.recoveryBody}>
          <Text style={styles.recoveryScore}>{recoveryScore}%</Text>
          <Text style={styles.recoveryStatus}>
            {status.emoji} {status.text}
          </Text>
        </View>
        <Text style={styles.recoverySubtext}>
          Based on your HRV and sleep data
        </Text>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={28} color="#FF6B35" />
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={28} color="#007AFF" />
          <Text style={styles.statValue}>{weeklyWorkouts}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/workout/suggested')}
        >
          <LinearGradient
            colors={['#007AFF', '#0051D5']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="sparkles" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Start AI Workout</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/workout/new')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Create Custom Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => router.push(`/workout/${workout.id}`)}
            >
              <View style={styles.workoutIconContainer}>
                <Ionicons name="barbell" size={24} color="#007AFF" />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>
                  {workout.exercises.length} exercises • {getRelativeTime(workout.date)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ... keep all the existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  recoveryCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recoveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  recoveryBody: {
    marginBottom: 8,
  },
  recoveryScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  recoveryStatus: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  recoverySubtext: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
