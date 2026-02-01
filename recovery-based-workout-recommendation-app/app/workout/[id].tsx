// app/workout/[id].tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWorkoutStore } from '../../store/workoutStore';
import type { Workout } from '../../types/workout';
import { formatDate, formatShortDuration } from '../../utils/dateHelpers';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { workouts, loadWorkouts, isLoading } = useWorkoutStore();
  
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    // Load workouts if not already loaded
    if (user?.id && workouts.length === 0) {
      loadWorkouts(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    // Find the workout by ID
    if (id && workouts.length > 0) {
      const foundWorkout = workouts.find((w) => w.id === id);
      setWorkout(foundWorkout || null);
    }
  }, [id, workouts]);

  const calculateTotalVolume = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight || 0) * (set.reps || 0);
        }, 0)
      );
    }, 0);
  };

  const deleteWorkout = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (workout) {
              await useWorkoutStore.getState().deleteWorkout(workout.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Workout not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalVolume = calculateTotalVolume();
  const totalSets = workout.totalSets || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
        </View>
        <TouchableOpacity onPress={deleteWorkout}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <Text style={styles.statValue}>
            {workout.duration ? formatShortDuration(workout.duration) : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="barbell-outline" size={24} color="#FF6B35" />
          <Text style={styles.statValue}>
            {(totalVolume / 1000).toFixed(1)}k
          </Text>
          <Text style={styles.statLabel}>Volume (lbs)</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="fitness-outline" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{workout.exercises.length}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="repeat-outline" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{totalSets}</Text>
          <Text style={styles.statLabel}>Total Sets</Text>
        </View>
      </View>

      {/* Exercises */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        
        {workout.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id || exerciseIndex} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseSets}>{exercise.sets.length} sets</Text>
            </View>

            {/* Sets Table */}
            <View style={styles.setsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 50 }]}>Set</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Weight</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Volume</Text>
              </View>

              {exercise.sets.map((set, setIndex) => {
                const volume = (set.weight || 0) * (set.reps || 0);
                return (
                  <View key={set.id || setIndex} style={styles.setRow}>
                    <View style={styles.setNumber}>
                      <Text style={styles.setNumberText}>{setIndex + 1}</Text>
                    </View>
                    <View style={styles.setValue}>
                      <Text style={styles.setValueText}>
                        {set.weight || 0} lbs
                      </Text>
                    </View>
                    <View style={styles.setValue}>
                      <Text style={styles.setValueText}>{set.reps || 0}</Text>
                    </View>
                    <View style={styles.setValue}>
                      <Text style={styles.setValueText}>{volume} lbs</Text>
                    </View>
                  </View>
                );
              })}

              {/* Exercise Total */}
              <View style={styles.exerciseTotalRow}>
                <Text style={styles.exerciseTotalLabel}>Total Volume:</Text>
                <Text style={styles.exerciseTotalValue}>
                  {exercise.sets
                    .reduce(
                      (total, set) =>
                        total + (set.weight || 0) * (set.reps || 0),
                      0
                    )
                    .toLocaleString()}{' '}
                  lbs
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Notes Section */}
        {workout.notes && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={20} color="#8E8E93" />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backIcon: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  workoutDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  exerciseSets: {
    fontSize: 14,
    color: '#8E8E93',
  },
  setsTable: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F7',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  setValue: {
    flex: 1,
    alignItems: 'center',
  },
  setValueText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  exerciseTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  exerciseTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  exerciseTotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  notesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  notesText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
});
