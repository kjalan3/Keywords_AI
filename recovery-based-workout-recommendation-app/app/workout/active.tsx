// app/workout/active.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
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
import type { WorkoutTemplate } from '../../types/workout';

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
    saveAsTemplate, // Add this to your hook
  } = useActiveWorkout();

  const { formattedTime: elapsedTime } = useWorkoutTimer(workoutStartTime);
  const { isResting, formattedRestTime, skipRest, startRest } = useRestTimer();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  if (!activeWorkout) {
    return (
      <View style={styles.container}>
        <Text>No active workout</Text>
      </View>
    );
  }

  const handleToggleSet = (exerciseId: string, setId: string) => {
    toggleSetCompletion(exerciseId, setId);
    startRest(90);
  };

  const handleSaveTemplate = () => {
    setTemplateName(activeWorkout.name || 'My Workout Template');
    setShowTemplateModal(true);
  };

  const confirmSaveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    setSavingTemplate(true);

    try {
      // Create template from active workout
      const template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: templateName.trim(),
        exercises: activeWorkout.exercises.map(ex => ({
          ...ex,
          // Reset sets to uncompleted state with template values
          sets: ex.sets.map(set => ({
            ...set,
            id: '', // Will be generated when used
            weight: undefined, // User fills in when using template
            reps: set.reps, // Keep target reps
            completed: false,
            notes: set.notes,
          })),
        })),
      };

      await saveAsTemplate(template);

      Alert.alert(
        'Success! 🎉',
        `"${templateName}" has been saved as a template. You can use it to start workouts quickly!`,
        [{ text: 'OK', onPress: () => setShowTemplateModal(false) }]
      );
    } catch (error: any) {
      console.error('Error saving template:', error);
      Alert.alert('Error', error?.message || 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you sure you want to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          if (!activeWorkout) return;

          const endTime = new Date().toISOString();
          const duration = Math.floor(
            (new Date(endTime).getTime() - new Date(activeWorkout.startTime).getTime()) / 1000
          );

          const totalVolume = activeWorkout.exercises.reduce((total, ex) => {
            const exerciseVolume = ex.sets.reduce((setTotal, set) => {
              return setTotal + (set.weight || 0) * (set.reps || 0);
            }, 0);
            return total + exerciseVolume;
          }, 0);

          const totalSets = activeWorkout.exercises.reduce((t, ex) => t + ex.sets.length, 0);

          const summaryData = {
            name: activeWorkout.name,
            duration,
            date: activeWorkout.date,
            exercises: activeWorkout.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets.length,
              volume: ex.sets.reduce((v, s) => v + (s.weight || 0) * (s.reps || 0), 0),
              personalRecord: false,
            })),
            totalVolume,
            totalSets,
          };

          await endWorkout();

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
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#FF3B30" />
        </TouchableOpacity>
        
        <View style={styles.headerStats}>
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

        <TouchableOpacity onPress={handleSaveTemplate} style={styles.headerButton}>
          <Ionicons name="bookmark-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
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

      {/* Workout Title */}
      <View style={styles.workoutTitleSection}>
        <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
        {activeWorkout.aiGenerated && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.aiBadgeText}>AI Generated</Text>
          </View>
        )}
      </View>

      {/* Exercises */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeWorkout.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="swap-horizontal" size={22} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {exercise.notes && (
              <View style={styles.exerciseNoteCard}>
                <Ionicons name="information-circle" size={16} color="#007AFF" />
                <Text style={styles.exerciseNoteText}>{exercise.notes}</Text>
              </View>
            )}

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
                  <View style={[
                    styles.setNumber,
                    set.type === 'warmup' && styles.setNumberWarmup
                  ]}>
                    <Text style={styles.setNumberText}>
                      {set.type === 'warmup' ? 'W' : index + 1}
                    </Text>
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
                    placeholderTextColor="#C7C7CC"
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
                    placeholderTextColor="#C7C7CC"
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
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Save Template Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="bookmark" size={32} color="#007AFF" />
              <Text style={styles.modalTitle}>Save as Template</Text>
              <Text style={styles.modalSubtitle}>
                Save this workout to reuse it later
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Template Name</Text>
              <TextInput
                style={styles.modalInput}
                value={templateName}
                onChangeText={setTemplateName}
                placeholder="e.g., Push Day A"
                placeholderTextColor="#C7C7CC"
                autoFocus
              />

              <View style={styles.templatePreview}>
                <Text style={styles.previewLabel}>This will save:</Text>
                <View style={styles.previewItem}>
                  <Ionicons name="fitness" size={16} color="#8E8E93" />
                  <Text style={styles.previewText}>
                    {activeWorkout.exercises.length} exercises
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Ionicons name="list" size={16} color="#8E8E93" />
                  <Text style={styles.previewText}>
                    {totalSets} sets total
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Ionicons name="information-circle" size={16} color="#8E8E93" />
                  <Text style={styles.previewText}>
                    Structure only (not weights)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowTemplateModal(false)}
                disabled={savingTemplate}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={confirmSaveTemplate}
                disabled={savingTemplate || !templateName.trim()}
              >
                {savingTemplate ? (
                  <Text style={styles.modalSaveText}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.modalSaveText}>Save Template</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStats: {
    flex: 1,
    flexDirection: 'row',
  },
  statContainer: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
  statLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E5EA' },
  workoutTitleSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
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
    marginBottom: 12,
  },
  exerciseName: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
  exerciseMuscle: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  exerciseNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  exerciseNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    fontStyle: 'italic',
  },
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
  setNumberWarmup: {
    backgroundColor: '#FF9500',
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
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  finishButtonText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 20,
  },
  templatePreview: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalSaveButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
