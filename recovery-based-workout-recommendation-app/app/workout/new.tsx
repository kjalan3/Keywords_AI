// app/workout/new.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTemplateStore } from '../../store/templateStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { TemplateExercise } from '../../types/template';

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [workoutName, setWorkoutName] = useState('');
  const { templates, loadTemplates, isLoading } = useTemplateStore();
  const { startWorkout } = useWorkoutStore();

  useEffect(() => {
    if (user?.id) {
      loadTemplates(user.id);
    }
  }, [user?.id]);

  const handleStartBlank = () => {
    if (!workoutName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your workout');
      return;
    }
    if (!user?.id) return;

    startWorkout(workoutName, user.id);
    router.push('/workout/active');
  };

  const handleStartFromTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template || !user?.id) return;

    // Start workout with template data
    startWorkout(template.name, user.id);

    // Add exercises from template
    const { activeWorkout } = useWorkoutStore.getState();
    if (activeWorkout) {
      template.exercises.forEach((exercise: TemplateExercise) => {
        const newExercise = {
          id: Date.now().toString() + Math.random(),
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          sets: Array.from({ length: exercise.sets }, (_, i) => ({
            id: Date.now().toString() + Math.random() + i,
            setNumber: i + 1,
            type: 'normal' as const,
            weight: parseInt(exercise.weight || '0') || 0,
            reps: parseInt(exercise.reps.split('-')[0]) || 0,
            completed: false,
            restTime: exercise.restTime || 90,
          })),
          notes: exercise.notes || '',
        };
        useWorkoutStore.getState().addExercise(newExercise);
      });
    }

    router.push('/workout/active');
  };

  const handleAIGenerate = () => {
    Alert.alert(
      'AI Workout',
      'AI workout generation coming soon!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Cancel Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Start New Workout</Text>
          <Text style={styles.subtitle}>
            Choose how you want to start your workout
          </Text>
        </View>

        {/* Workout Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Workout Name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g., Push Day, Leg Day, Full Body"
            placeholderTextColor="#8E8E93"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        {/* Quick Start Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>

          {/* Blank Workout */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleStartBlank}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="add-circle" size={32} color="#007AFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Blank Workout</Text>
              <Text style={styles.optionDescription}>
                Start from scratch and add exercises as you go
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          {/* AI Generated */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleAIGenerate}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="sparkles" size={32} color="#9C27B0" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>AI Generated</Text>
              <Text style={styles.optionDescription}>
                Let AI create a personalized workout for you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Templates</Text>
            <TouchableOpacity onPress={() => router.push('/plan/edit')}>
              <Text style={styles.createTemplateLink}>Create New</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
          ) : templates.length === 0 ? (
            <View style={styles.emptyTemplates}>
              <Ionicons name="document-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>No templates yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/plan/edit')}
              >
                <Text style={styles.createButtonText}>Create Template</Text>
              </TouchableOpacity>
            </View>
          ) : (
            templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleStartFromTemplate(template.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="folder" size={32} color="#FF9500" />
                </View>
                <View style={styles.templateContent}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateMeta}>
                    {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  topHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelText: {
    fontSize: 17,
    color: '#FF3B30',
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 17,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  createTemplateLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyTemplates: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  templateMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
