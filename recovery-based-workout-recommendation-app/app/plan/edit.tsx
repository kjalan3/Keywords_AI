// app/plan/edit.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  muscleGroup: string;
};

type WorkoutDay = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export default function EditPlanScreen() {
  const router = useRouter();
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Mock data - replace with actual state management later
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    {
      id: '1',
      name: 'Push Day',
      exercises: [
        {
          id: 'e1',
          name: 'Bench Press',
          sets: 4,
          reps: '8-10',
          weight: '185 lbs',
          muscleGroup: 'Chest',
        },
        {
          id: 'e2',
          name: 'Overhead Press',
          sets: 3,
          reps: '8-12',
          weight: '95 lbs',
          muscleGroup: 'Shoulders',
        },
        {
          id: 'e3',
          name: 'Tricep Dips',
          sets: 3,
          reps: '10-12',
          muscleGroup: 'Triceps',
        },
      ],
    },
    {
      id: '2',
      name: 'Pull Day',
      exercises: [
        {
          id: 'e4',
          name: 'Pull-ups',
          sets: 4,
          reps: '8-10',
          muscleGroup: 'Back',
        },
        {
          id: 'e5',
          name: 'Barbell Rows',
          sets: 4,
          reps: '8-10',
          weight: '155 lbs',
          muscleGroup: 'Back',
        },
      ],
    },
    {
      id: '3',
      name: 'Leg Day',
      exercises: [
        {
          id: 'e6',
          name: 'Squats',
          sets: 4,
          reps: '8-10',
          weight: '225 lbs',
          muscleGroup: 'Legs',
        },
        {
          id: 'e7',
          name: 'Romanian Deadlift',
          sets: 3,
          reps: '10-12',
          weight: '185 lbs',
          muscleGroup: 'Legs',
        },
      ],
    },
  ]);

  // Exercise library - simplified version
  const exerciseLibrary = [
    { id: 'lib1', name: 'Barbell Squat', muscleGroup: 'Legs' },
    { id: 'lib2', name: 'Deadlift', muscleGroup: 'Back' },
    { id: 'lib3', name: 'Bench Press', muscleGroup: 'Chest' },
    { id: 'lib4', name: 'Pull-ups', muscleGroup: 'Back' },
    { id: 'lib5', name: 'Overhead Press', muscleGroup: 'Shoulders' },
    { id: 'lib6', name: 'Bicep Curls', muscleGroup: 'Arms' },
    { id: 'lib7', name: 'Tricep Extensions', muscleGroup: 'Arms' },
    { id: 'lib8', name: 'Leg Press', muscleGroup: 'Legs' },
    { id: 'lib9', name: 'Lateral Raises', muscleGroup: 'Shoulders' },
    { id: 'lib10', name: 'Face Pulls', muscleGroup: 'Shoulders' },
  ];

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      name: `Day ${workoutDays.length + 1}`,
      exercises: [],
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  const deleteWorkoutDay = (dayId: string) => {
    Alert.alert('Delete Workout Day', 'Are you sure you want to delete this day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setWorkoutDays(workoutDays.filter((day) => day.id !== dayId));
        },
      },
    ]);
  };

  const addExerciseToDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowExerciseLibrary(true);
  };

  const selectExercise = (exercise: typeof exerciseLibrary[0]) => {
    if (!selectedDayId) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exercise.name,
      sets: 3,
      reps: '8-12',
      muscleGroup: exercise.muscleGroup,
    };

    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === selectedDayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    );

    setShowExerciseLibrary(false);
    setSelectedDayId(null);
  };

  const deleteExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            }
          : day
      )
    );
  };

  const renameDayPrompt = (day: WorkoutDay) => {
    Alert.prompt(
      'Rename Workout Day',
      'Enter a new name for this workout day',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newName : any) => {
            if (newName) {
              setWorkoutDays(
                workoutDays.map((d) =>
                  d.id === day.id ? { ...d, name: newName } : d
                )
              );
            }
          },
        },
      ],
      'plain-text',
      day.name
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Customize Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Add, remove, or reorder workout days and exercises
          </Text>
        </View>

        {/* Workout Days */}
        {workoutDays.map((day, dayIndex) => (
          <View key={day.id} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <TouchableOpacity
                style={styles.dayTitleContainer}
                onPress={() => renameDayPrompt(day)}
              >
                <Text style={styles.dayTitle}>{day.name}</Text>
                <Ionicons name="create-outline" size={18} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteWorkoutDay(day.id)}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            {/* Exercises */}
            {day.exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <TouchableOpacity
                  style={styles.exerciseContent}
                  onPress={() => router.push(`/plan/exercise/${exercise.id}` as any)}
                >
                  <View style={styles.exerciseIconContainer}>
                    <Ionicons name="barbell-outline" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight ? ` • ${exercise.weight}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteExerciseButton}
                  onPress={() => deleteExercise(day.id, exercise.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Exercise Button */}
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => addExerciseToDay(day.id)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Day Button */}
        <TouchableOpacity style={styles.addDayButton} onPress={addWorkoutDay}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addDayText}>Add Workout Day</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise Library Modal */}
      <Modal
        visible={showExerciseLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExerciseLibrary(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Exercise Library</Text>
            <TouchableOpacity onPress={() => setShowExerciseLibrary(false)}>
              <Ionicons name="close" size={28} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#8E8E93"
          />

          <FlatList
            data={exerciseLibrary}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.libraryItem}
                onPress={() => selectExercise(item)}
              >
                <View style={styles.libraryIconContainer}>
                  <Ionicons name="fitness" size={24} color="#007AFF" />
                </View>
                <View style={styles.libraryInfo}>
                  <Text style={styles.libraryName}>{item.name}</Text>
                  <Text style={styles.libraryMuscle}>{item.muscleGroup}</Text>
                </View>
                <Ionicons name="add-circle" size={28} color="#007AFF" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.libraryList}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  dayCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
  },
  exerciseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  deleteExerciseButton: {
    marginLeft: 8,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addDayText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  searchInput: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  libraryList: {
    padding: 20,
    paddingTop: 0,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  libraryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  libraryMuscle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
