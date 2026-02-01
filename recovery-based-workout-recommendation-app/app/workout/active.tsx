// app/workout/active.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useActiveWorkout } from '../../features/workout/hooks/useActiveWorkout';
import { useRestTimer } from '../../features/workout/hooks/useRestTimer';
import { useWorkoutTimer } from '../../features/workout/hooks/useWorkoutTimer';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    workoutStartTime,
    addExerciseToWorkout,
    addNewSet,
    updateSet,
    deleteSet,
    toggleSetCompletion,
    endWorkout,
  } = useActiveWorkout();

  const { formattedTime: elapsedTime } = useWorkoutTimer(workoutStartTime);
  const { isResting, formattedRestTime, skipRest, startRest } = useRestTimer();

  if (!activeWorkout) {
    return (
      <View style={styles.container}>
        <Text>No active workout</Text>
      </View>
    );
  }

  const handleToggleSet = (exerciseId: string, setId: string) => {
    toggleSetCompletion(exerciseId, setId);
    // Start rest timer after completing a set
    startRest(90);
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you sure you want to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          if (!activeWorkout) return;

          // Calculate summary data BEFORE calling endWorkout
          const endTime = new Date().toISOString();
          const duration = Math.floor(
            (new Date(endTime).getTime() - new Date(activeWorkout.startTime).getTime()) / 1000
          );

          // Fixed totalVolume calculation - added initial value of 0
          const totalVolume = activeWorkout.exercises.reduce((total, ex) => {
            const exerciseVolume = ex.sets.reduce((setTotal, set) => {
              return setTotal + (set.weight || 0) * (set.reps || 0);
            }, 0);
            return total + exerciseVolume;
          }, 0); // <-- This was missing!

          const totalSets = activeWorkout.exercises.reduce((t, ex) => t + ex.sets.length, 0);

          const summaryData = {
            name: activeWorkout.name,
            duration,
            date: activeWorkout.date,
            exercises: activeWorkout.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets.length,
              volume: ex.sets.reduce((v, s) => v + (s.weight || 0) * (s.reps || 0), 0),
              personalRecord: false, // TODO: Implement PR detection
            })),
            totalVolume,
            totalSets,
          };

          // Save to Supabase
          await endWorkout();

          // Navigate to summary
          router.replace({
            pathname: '/workout/summary',
            params: { summary: JSON.stringify(summaryData) }
          });
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Workout', 'Are you sure? Your progress will be lost.', [
      { text: 'Keep Training', style: 'cancel' },
      {
        text: 'Cancel Workout',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statContainer}>
          <Text style={styles.statValue}>{elapsedTime}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statContainer}>
          <Text style={styles.statValue}>
            {completedSets}/{totalSets}
          </Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statContainer}>
          <Text style={styles.statValue}>{activeWorkout.exercises.length}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View style={styles.restTimerBanner}>
          <Ionicons name="timer" size={20} color="#fff" />
          <Text style={styles.restTimerText}>Rest: {formattedRestTime}</Text>
          <TouchableOpacity onPress={skipRest}>
            <Text style={styles.skipRestText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercises */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeWorkout.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity>
                <Ionicons name="swap-horizontal" size={22} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Sets Table */}
            <View style={styles.setsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 50 }]}>Set</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Weight</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Reps</Text>
                <View style={{ width: 50 }} />
              </View>

              {exercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>{index + 1}</Text>
                  </View>

                  <TextInput
                    style={[styles.setInput, set.completed && styles.completedInput]}
                    value={set.weight?.toString() || ''}
                    onChangeText={(text) =>
                      updateSet(exercise.id, set.id, {
                        weight: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    editable={!set.completed}
                    placeholder="0"
                  />

                  <TextInput
                    style={[styles.setInput, set.completed && styles.completedInput]}
                    value={set.reps?.toString() || ''}
                    onChangeText={(text) =>
                      updateSet(exercise.id, set.id, {
                        reps: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    editable={!set.completed}
                    placeholder="0"
                  />

                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      set.completed && styles.checkButtonCompleted,
                    ]}
                    onPress={() => handleToggleSet(exercise.id, set.id)}
                  >
                    {set.completed && <Ionicons name="checkmark" size={20} color="#fff" />}
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => {
                  const lastSet = exercise.sets[exercise.sets.length - 1];
                  addNewSet(exercise.id, lastSet);
                }}
              >
                <Ionicons name="add" size={18} color="#007AFF" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => router.push('/workout/exercise-select')}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statContainer: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
  statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E5EA' },
  restTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    gap: 12,
  },
  restTimerText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  skipRestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textDecorationLine: 'underline',
  },
  scrollView: { flex: 1 },
  exerciseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
  setsTable: { gap: 8 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F7',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  setInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  completedInput: { opacity: 0.6 },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addSetText: { fontSize: 15, fontWeight: '600', color: '#007AFF', marginLeft: 6 },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addExerciseText: { fontSize: 17, fontWeight: 'bold', color: '#007AFF', marginLeft: 8 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 17, fontWeight: '600', color: '#FF3B30' },
  finishButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  finishButtonText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
});
