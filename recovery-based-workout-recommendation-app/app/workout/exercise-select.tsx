// app/workout/exercise-select.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
};

const EXERCISES_BY_MUSCLE: { [key: string]: Exercise[] } = {
  Chest: [
    { id: 'c1', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
    { id: 'c2', name: 'Incline Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
    { id: 'c3', name: 'Dumbbell Flyes', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { id: 'c4', name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { id: 'c5', name: 'Cable Flyes', muscleGroup: 'Chest', equipment: 'Cable' },
  ],
  Back: [
    { id: 'b1', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
    { id: 'b2', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Bodyweight' },
    { id: 'b3', name: 'Barbell Rows', muscleGroup: 'Back', equipment: 'Barbell' },
    { id: 'b4', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
    { id: 'b5', name: 'Seated Cable Rows', muscleGroup: 'Back', equipment: 'Cable' },
    { id: 'b6', name: 'Face Pulls', muscleGroup: 'Back', equipment: 'Cable' },
  ],
  Legs: [
    { id: 'l1', name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: 'l2', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: 'l3', name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: 'l4', name: 'Leg Curls', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: 'l5', name: 'Leg Extensions', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: 'l6', name: 'Calf Raises', muscleGroup: 'Legs', equipment: 'Machine' },
  ],
  Shoulders: [
    { id: 's1', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
    { id: 's2', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: 's3', name: 'Front Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: 's4', name: 'Rear Delt Flyes', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: 's5', name: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  ],
  Arms: [
    { id: 'a1', name: 'Barbell Curl', muscleGroup: 'Arms', equipment: 'Barbell' },
    { id: 'a2', name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { id: 'a3', name: 'Tricep Pushdowns', muscleGroup: 'Arms', equipment: 'Cable' },
    { id: 'a4', name: 'Skull Crushers', muscleGroup: 'Arms', equipment: 'Barbell' },
    { id: 'a5', name: 'Dips', muscleGroup: 'Arms', equipment: 'Bodyweight' },
    { id: 'a6', name: 'Preacher Curls', muscleGroup: 'Arms', equipment: 'Machine' },
  ],
  Core: [
    { id: 'co1', name: 'Planks', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: 'co2', name: 'Crunches', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: 'co3', name: 'Cable Crunches', muscleGroup: 'Core', equipment: 'Cable' },
    { id: 'co4', name: 'Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: 'co5', name: 'Russian Twists', muscleGroup: 'Core', equipment: 'Bodyweight' },
  ],
};

export default function ExerciseSelectScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  const muscleGroups = Object.keys(EXERCISES_BY_MUSCLE);

  const selectExercise = (exercise: Exercise) => {
    // Add exercise to workout and go back
    console.log('Selected:', exercise.name);
    router.back();
  };

  const filteredExercises = () => {
    let exercises = selectedMuscleGroup
      ? EXERCISES_BY_MUSCLE[selectedMuscleGroup]
      : Object.values(EXERCISES_BY_MUSCLE).flat();

    if (searchQuery.trim()) {
      exercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return exercises;
  };

  const getMuscleGroupIcon = (muscleGroup: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      Chest: 'body',
      Back: 'shield',
      Legs: 'walk',
      Shoulders: 'fitness',
      Arms: 'hand-right',
      Core: 'analytics',
    };
    return icons[muscleGroup] || 'barbell';
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Group Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedMuscleGroup === null && styles.filterChipActive,
          ]}
          onPress={() => setSelectedMuscleGroup(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedMuscleGroup === null && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {muscleGroups.map((group) => (
          <TouchableOpacity
            key={group}
            style={[
              styles.filterChip,
              selectedMuscleGroup === group && styles.filterChipActive,
            ]}
            onPress={() => setSelectedMuscleGroup(group)}
          >
            <Ionicons
              name={getMuscleGroupIcon(group)}
              size={16}
              color={selectedMuscleGroup === group ? '#fff' : '#007AFF'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedMuscleGroup === group && styles.filterChipTextActive,
              ]}
            >
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => selectExercise(item)}
          >
            <View style={styles.exerciseIconContainer}>
              <Ionicons
                name={getMuscleGroupIcon(item.muscleGroup)}
                size={24}
                color="#007AFF"
              />
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseMeta}>
                {item.muscleGroup} • {item.equipment}
              </Text>
            </View>
            <Ionicons name="add-circle" size={28} color="#007AFF" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        }
      />

      {/* Create Custom Exercise */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.createButtonText}>Create Custom Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  filterScroll: {
    marginTop: 12,
    maxHeight: 44,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#C7C7CC',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});
