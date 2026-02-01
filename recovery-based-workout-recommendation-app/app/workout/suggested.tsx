// app/workout/suggested.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import { useRecoveryAnalysis } from '../../features/healthkit/hooks/useRecoveryStats';
import { keywordsAI } from '../../services/ai/keywordsAI';
import { useWorkoutStore } from '../../store/workoutStore';
import type { Exercise, WorkoutSet } from '../../types/workout';

type WorkoutExercise = {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
};

type WorkoutPlan = {
  name: string;
  type: string;
  duration: number;
  exercises: WorkoutExercise[];
  reasoning: string;
};

type FocusArea = 
  | 'Full Body' 
  | 'Push' 
  | 'Pull' 
  | 'Legs' 
  | 'Upper Body' 
  | 'Lower Body'
  | 'Arms' 
  | 'Back' 
  | 'Core'
  | 'Chest'
  | 'Shoulders';

const FOCUS_AREAS: { label: FocusArea; icon: string }[] = [
  { label: 'Full Body', icon: '💪' },
  { label: 'Push', icon: '👊' },
  { label: 'Pull', icon: '🎣' },
  { label: 'Legs', icon: '🦵' },
  { label: 'Upper Body', icon: '💪' },
  { label: 'Lower Body', icon: '🏋️' },
  { label: 'Arms', icon: '💪' },
  { label: 'Chest', icon: '🫁' },
  { label: 'Back', icon: '🔙' },
  { label: 'Shoulders', icon: '🤷' },
  { label: 'Core', icon: '🎯' },
];

export default function SuggestedWorkoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { recovery, isLoading: recoveryLoading } = useRecoveryAnalysis();
  const { startWorkout, addExercise, addSet } = useWorkoutStore();
  
  const [selectedFocusArea, setSelectedFocusArea] = useState<FocusArea>('Full Body');
  const [loading, setLoading] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate workout on initial load
  useEffect(() => {
    if (recovery && !recoveryLoading) {
      generateWorkout();
    }
  }, [recovery, recoveryLoading]);

  // Regenerate workout when focus area changes
  useEffect(() => {
    if (recovery && !recoveryLoading && workoutPlan) {
      generateWorkout();
    }
  }, [selectedFocusArea]);

  const generateWorkout = async () => {
    if (!recovery) {
      setError('Recovery data not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Generating ${selectedFocusArea} workout for recovery:`, recovery);

      const plan = await keywordsAI.generateWorkoutPlan(recovery, {
        duration: 45,
        equipment: ['Dumbbells', 'Barbell', 'Bodyweight', 'Cables'],
        focusArea: selectedFocusArea,
      });

      console.log('Generated workout plan:', plan);
      setWorkoutPlan(plan);
    } catch (err: any) {
      console.error('Error generating workout:', err);
      setError(err?.message || 'Failed to generate workout');

      // Fallback to mock workout
      setWorkoutPlan({
        name: `${selectedFocusArea} Power`,
        type: 'Strength Training',
        duration: 45,
        reasoning: `Based on your ${recovery.status} recovery, this ${selectedFocusArea.toLowerCase()} workout will help build strength without overtraining.`,
        exercises: [
          {
            name: 'Compound Movement',
            sets: 4,
            reps: '8-10',
            notes: 'Focus on controlled tempo',
          },
          {
            name: 'Secondary Exercise',
            sets: 3,
            reps: '10-12',
            notes: 'Keep proper form',
          },
          {
            name: 'Accessory Work',
            sets: 3,
            reps: '12-15',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFocusAreaChange = (area: FocusArea) => {
    setSelectedFocusArea(area);
  };

  // ... existing startSuggestedWorkout function (keep as is) ...

  const startSuggestedWorkout = () => {
    if (!workoutPlan) {
      Alert.alert('Error', 'No workout plan available');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to start a workout');
      return;
    }

    try {
      console.log('Starting AI workout:', workoutPlan.name);
      startWorkout(workoutPlan.name, user.id);

      workoutPlan.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseId = `ex-${Date.now()}-${exerciseIndex}`;

        const parseReps = (repsString: string): number => {
          const match = repsString.match(/\d+/);
          return match ? parseInt(match[0]) : 10;
        };

        const targetReps = parseReps(exercise.reps);

        const inferMuscleGroup = (exerciseName: string): string => {
          const name = exerciseName.toLowerCase();
          if (name.includes('bench') || name.includes('chest') || name.includes('press')) return 'Chest';
          if (name.includes('squat') || name.includes('leg')) return 'Legs';
          if (name.includes('deadlift') || name.includes('back') || name.includes('row')) return 'Back';
          if (name.includes('shoulder') || name.includes('overhead') || name.includes('lateral')) return 'Shoulders';
          if (name.includes('bicep') || name.includes('curl')) return 'Biceps';
          if (name.includes('tricep') || name.includes('pushdown')) return 'Triceps';
          if (name.includes('core') || name.includes('plank') || name.includes('crunch')) return 'Core';
          return 'Full Body';
        };

        const inferEquipment = (exerciseName: string): string => {
          const name = exerciseName.toLowerCase();
          if (name.includes('dumbbell')) return 'Dumbbells';
          if (name.includes('barbell')) return 'Barbell';
          if (name.includes('cable')) return 'Cables';
          if (name.includes('machine')) return 'Machine';
          if (name.includes('bodyweight') || name.includes('push-up') || name.includes('pull-up')) return 'Bodyweight';
          return 'Free Weights';
        };

        const newExercise: Exercise = {
          id: exerciseId,
          name: exercise.name,
          muscleGroup: inferMuscleGroup(exercise.name),
          equipment: inferEquipment(exercise.name),
          sets: [],
          notes: exercise.notes || '',
        };

        addExercise(newExercise);

        for (let i = 0; i < exercise.sets; i++) {
          const setId = `${exerciseId}-set-${i + 1}`;
          const isWarmup = i === 0 && exercise.sets > 2;

          const calculateRestTime = (setNumber: number, totalSets: number): number => {
            if (isWarmup) return 60;
            if (setNumber === totalSets) return 0;
            return 90;
          };

          const workoutSet: WorkoutSet = {
            id: setId,
            setNumber: i + 1,
            type: isWarmup ? 'warmup' : 'normal',
            reps: targetReps,
            weight: undefined,
            completed: false,
            restTime: calculateRestTime(i + 1, exercise.sets),
            notes: isWarmup ? 'Warmup set - use lighter weight' : undefined,
          };

          addSet(exerciseId, workoutSet);
        }
      });

      console.log('✅ Workout created successfully');
      router.push('/workout/active');

    } catch (error: any) {
      console.error('Error starting workout:', error);
      Alert.alert('Error Starting Workout', error?.message || 'Failed to create workout. Please try again.');
    }
  };

  // ... existing helper functions (getIntensityColor, getIntensityLabel, estimateVolume) ...

  const getIntensityColor = (): readonly [string, string] => {
    if (!recovery) return ['#007AFF', '#4DA3FF'];
    switch (recovery.workoutIntensity) {
      case 'light': return ['#4CAF50', '#81C784'];
      case 'high': return ['#FF6B35', '#FF8C61'];
      default: return ['#007AFF', '#4DA3FF'];
    }
  };

  const getIntensityLabel = () => {
    if (!recovery) return 'MODERATE';
    return recovery.workoutIntensity.toUpperCase();
  };

  const estimateVolume = () => {
    if (!workoutPlan) return '0k lbs';
    const totalSets = workoutPlan.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const avgWeight = 150;
    const avgReps = 10;
    const volume = (totalSets * avgWeight * avgReps) / 1000;
    return `~${volume.toFixed(1)}k lbs`;
  };

  if (loading || recoveryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating your workout...</Text>
        <Text style={styles.loadingSubtext}>
          Analyzing your recovery and training history
        </Text>
      </View>
    );
  }

  if (error && !workoutPlan) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#8E8E93" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generateWorkout}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workoutPlan) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Workout</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Focus Area Selector */}
        <View style={styles.focusAreaSection}>
          <Text style={styles.focusAreaLabel}>Focus Area</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.focusAreaScroll}
          >
            {FOCUS_AREAS.map((area) => (
              <TouchableOpacity
                key={area.label}
                style={[
                  styles.focusChip,
                  selectedFocusArea === area.label && styles.focusChipActive,
                ]}
                onPress={() => handleFocusAreaChange(area.label)}
                disabled={loading}
              >
                <Text style={styles.focusChipEmoji}>{area.icon}</Text>
                <Text
                  style={[
                    styles.focusChipText,
                    selectedFocusArea === area.label && styles.focusChipTextActive,
                  ]}
                >
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Workout Title */}
        <View style={styles.titleSection}>
          <Text style={styles.workoutName}>{workoutPlan.name}</Text>
          <Text style={styles.workoutType}>{workoutPlan.type}</Text>
        </View>

        {/* AI Insight Card */}
        <LinearGradient
          colors={getIntensityColor()}
          style={styles.insightCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={24} color="#fff" />
            <Text style={styles.insightBadge}>
              {getIntensityLabel()} INTENSITY
            </Text>
          </View>
          <Text style={styles.insightText}>{workoutPlan.reasoning}</Text>

          {recovery && recovery.recommendations.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Quick Tips:</Text>
              {recovery.recommendations.slice(0, 2).map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}
        </LinearGradient>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {workoutPlan.exercises.length} Exercises
          </Text>
          {workoutPlan.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.sets} sets × {exercise.reps}
                </Text>
                {exercise.notes && (
                  <View style={styles.noteContainer}>
                    <Ionicons name="information-circle" size={14} color="#007AFF" />
                    <Text style={styles.noteText}>{exercise.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Estimated Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#8E8E93" />
            <Text style={styles.statLabel}>Estimated Time</Text>
            <Text style={styles.statValue}>{workoutPlan.duration} min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={24} color="#8E8E93" />
            <Text style={styles.statLabel}>Estimated Volume</Text>
            <Text style={styles.statValue}>{estimateVolume()}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={20} color="#FF9800" />
            <Text style={styles.errorBannerText}>Using fallback workout plan</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={generateWorkout}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#007AFF" />
          <Text style={styles.regenerateText}>Regenerate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.startButton}
          onPress={startSuggestedWorkout}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 24,
  },
  loadingSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  focusAreaSection: {
    paddingVertical: 16,
  },
  focusAreaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  focusAreaScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  focusChipEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  focusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  focusChipTextActive: {
    color: '#fff',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workoutName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  workoutType: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  insightCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  tipsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 18,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#007AFF',
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#E65100',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  regenerateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  startButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
});
