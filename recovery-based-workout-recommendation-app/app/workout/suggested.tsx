// app/workout/suggested.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type SuggestedExercise = {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  notes?: string;
};

export default function SuggestedWorkoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    generateWorkout();
  }, []);

  const generateWorkout = async () => {
    setLoading(true);
    // Simulate AI generation - replace with actual Keywords.AI call
    setTimeout(() => {
      setRecommendation({
        intensity: 'medium',
        explanation:
          'Based on your HRV of 65 and 7 hours of sleep, your body is moderately recovered. Today is a good day for a balanced push workout.',
        exercises: [
          {
            name: 'Bench Press',
            sets: 4,
            reps: '8-10',
            weight: '185 lbs',
            notes: 'Focus on controlled tempo',
          },
          {
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: '10-12',
            weight: '60 lbs',
          },
          {
            name: 'Overhead Press',
            sets: 3,
            reps: '8-10',
            weight: '95 lbs',
          },
          {
            name: 'Lateral Raises',
            sets: 3,
            reps: '12-15',
            weight: '20 lbs',
          },
          {
            name: 'Tricep Pushdowns',
            sets: 3,
            reps: '12-15',
            weight: '50 lbs',
          },
        ],
      });
      setLoading(false);
    }, 2000);
  };

  const startSuggestedWorkout = () => {
    const workoutId = Date.now().toString();
    router.replace(`/workout/${workoutId}`);
  };

  const getIntensityColor = (intensity: string): readonly [string, string] => {
    switch (intensity) {
      case 'low':
        return ['#4CAF50', '#81C784'];
      case 'high':
        return ['#FF6B35', '#FF8C61'];
      default:
        return ['#007AFF', '#4DA3FF'];
    }
  };

  if (loading) {
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* AI Insight Card */}
        <LinearGradient
          colors={getIntensityColor(recommendation.intensity)}
          style={styles.insightCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={24} color="#fff" />
            <Text style={styles.insightBadge}>
              {recommendation.intensity.toUpperCase()} INTENSITY
            </Text>
          </View>
          <Text style={styles.insightText}>{recommendation.explanation}</Text>
        </LinearGradient>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {recommendation.exercises.length} Exercises
          </Text>
          {recommendation.exercises.map(
            (exercise: SuggestedExercise, index: number) => (
              <View key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} sets × {exercise.reps}
                    {exercise.weight ? ` • ${exercise.weight}` : ''}
                  </Text>
                  {exercise.notes && (
                    <View style={styles.noteContainer}>
                      <Ionicons name="information-circle" size={14} color="#007AFF" />
                      <Text style={styles.noteText}>{exercise.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          )}
        </View>

        {/* Estimated Time */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#8E8E93" />
            <Text style={styles.statLabel}>Estimated Time</Text>
            <Text style={styles.statValue}>45-55 min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={24} color="#8E8E93" />
            <Text style={styles.statLabel}>Estimated Volume</Text>
            <Text style={styles.statValue}>~12k lbs</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={generateWorkout}
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
  scrollView: {
    flex: 1,
  },
  insightCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
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
