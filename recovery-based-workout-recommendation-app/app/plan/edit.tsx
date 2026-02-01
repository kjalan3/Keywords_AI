// app/plan/edit.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useTemplateStore } from '../../store/templateStore';
import type { TemplateExercise } from '../../types/template';

export default function EditPlanScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  const { createTemplate, updateTemplate, getTemplateById } = useTemplateStore();
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state

  // Load existing template if editing
  useEffect(() => {
    if (id) {
      const template = getTemplateById(id);
      if (template) {
        setTemplateName(template.name);
        setTemplateDescription(template.description || '');
        setExercises(template.exercises);
      }
    }
  }, [id]);

  // Exercise library
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

  // Filter exercises based on search query
  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const query = searchQuery.toLowerCase();
    return (
      exercise.name.toLowerCase().includes(query) ||
      exercise.muscleGroup.toLowerCase().includes(query)
    );
  });

  const saveTemplate = async () => {
    if (!user?.id) return;
    
    if (!templateName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your template');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Add Exercises', 'Please add at least one exercise');
      return;
    }

    const templateData = {
      userId: user.id,
      name: templateName,
      description: templateDescription,
      exercises,
    };

    if (id) {
      // Update existing
      await updateTemplate(id, templateData);
      Alert.alert('Success', 'Template updated successfully!');
    } else {
      // Create new
      const newId = await createTemplate(templateData);
      if (newId) {
        Alert.alert('Success', 'Template created successfully!');
      }
    }
    
    router.back();
  };

  const selectExercise = (exercise: typeof exerciseLibrary[0]) => {
    const newExercise: TemplateExercise = {
      id: Date.now().toString(),
      name: exercise.name,
      sets: 3,
      reps: '8-12',
      muscleGroup: exercise.muscleGroup,
    };

    setExercises([...exercises, newExercise]);
    setShowExerciseLibrary(false);
    setSearchQuery(''); // Reset search when closing
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const openExerciseLibrary = () => {
    setSearchQuery(''); // Reset search when opening
    setShowExerciseLibrary(true);
  };

  const closeExerciseLibrary = () => {
    setShowExerciseLibrary(false);
    setSearchQuery(''); // Reset search when closing
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveTemplate}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Template Info */}
        <View style={styles.infoSection}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g., Push Day, Pull Day, Leg Day"
            value={templateName}
            onChangeText={setTemplateName}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add notes about this workout..."
            value={templateDescription}
            onChangeText={setTemplateDescription}
            multiline
          />
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseContent}>
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
              </View>
              <TouchableOpacity
                style={styles.deleteExerciseButton}
                onPress={() => deleteExercise(exercise.id)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={openExerciseLibrary}
          >
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Exercise Library Modal */}
      <Modal
        visible={showExerciseLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeExerciseLibrary}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Exercise Library</Text>
            <TouchableOpacity onPress={closeExerciseLibrary}>
              <Ionicons name="close" size={28} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FlatList
            data={filteredExercises}
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
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptySearchText}>No exercises found</Text>
                <Text style={styles.emptySearchSubtext}>
                  Try a different search term
                </Text>
              </View>
            }
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelText: {
    fontSize: 17,
    color: '#FF3B30',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  nameInput: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    fontSize: 17,
    color: '#1C1C1E',
  },
  descriptionInput: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    color: '#1C1C1E',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  exercisesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  exerciseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
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
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    borderStyle: 'dashed',
    marginTop: 4,
    backgroundColor: '#fff',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
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
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4,
  },
});
