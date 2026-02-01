// app/(tabs)/progress.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  // Mock data - replace with actual data later
  const stats = {
    totalWorkouts: 47,
    totalVolume: 624000,
    avgDuration: 54,
    personalRecords: 12,
  };

  const muscleGroups = [
    { name: 'Chest', percentage: 85, sets: 42 },
    { name: 'Back', percentage: 78, sets: 39 },
    { name: 'Legs', percentage: 92, sets: 48 },
    { name: 'Shoulders', percentage: 65, sets: 32 },
    { name: 'Arms', percentage: 70, sets: 35 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="calendar" size={28} color="#007AFF" />
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="barbell" size={28} color="#FF6B35" />
          <Text style={styles.statValue}>{(stats.totalVolume / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="time" size={28} color="#4CAF50" />
          <Text style={styles.statValue}>{stats.avgDuration}</Text>
          <Text style={styles.statLabel}>Avg Duration (min)</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="trophy" size={28} color="#FFD700" />
          <Text style={styles.statValue}>{stats.personalRecords}</Text>
          <Text style={styles.statLabel}>Personal Records</Text>
        </View>
      </View>

      {/* Muscle Group Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muscle Group Balance</Text>
        <View style={styles.card}>
          {muscleGroups.map((group, index) => (
            <View key={group.name} style={styles.muscleGroupItem}>
              <View style={styles.muscleGroupHeader}>
                <Text style={styles.muscleGroupName}>{group.name}</Text>
                <Text style={styles.muscleGroupSets}>{group.sets} sets</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${group.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.muscleGroupPercentage}>{group.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.card}>
          <View style={styles.weeklyRow}>
            <Text style={styles.weeklyLabel}>Workouts Completed</Text>
            <Text style={styles.weeklyValue}>4 / 5</Text>
          </View>
          <View style={styles.weeklyRow}>
            <Text style={styles.weeklyLabel}>Total Volume</Text>
            <Text style={styles.weeklyValue}>52.3k lbs</Text>
          </View>
          <View style={styles.weeklyRow}>
            <Text style={styles.weeklyLabel}>Recovery Score (Avg)</Text>
            <Text style={styles.weeklyValue}>76%</Text>
          </View>
        </View>
      </View>

      {/* Placeholder for chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volume Trend</Text>
        <View style={[styles.card, styles.chartPlaceholder]}>
          <Ionicons name="bar-chart" size={48} color="#C7C7CC" />
          <Text style={styles.placeholderText}>Chart coming soon</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statBox: {
    width: (width - 36) / 2,
    backgroundColor: '#fff',
    padding: 20,
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
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  muscleGroupItem: {
    marginBottom: 20,
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  muscleGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  muscleGroupSets: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  muscleGroupPercentage: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  weeklyLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
});
