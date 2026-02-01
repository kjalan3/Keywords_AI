// app/(auth)/onboarding/plan-setup.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type WorkoutDay = {
  name: string;
  exercises: string[];
};

export default function PlanSetupScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [setupMethod, setSetupMethod] = useState<'ai' | 'manual' | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState('3');

  const generateAIPlan = async () => {
    setGeneratingPlan(true);
    
    // Simulate AI generation - replace with actual Keywords.AI call
    setTimeout(() => {
      const goals = user?.unsafeMetadata?.fitnessGoals || [];
      
      // Generate plan based on goals
      const plan: WorkoutDay[] = [
        {
          name: 'Upper Body Push',
          exercises: ['Bench Press', 'Overhead Press', 'Tricep Dips'],
        },
        {
          name: 'Lower Body',
          exercises: ['Squats', 'Romanian Deadlifts', 'Calf Raises'],
        },
        {
          name: 'Upper Body Pull',
          exercises: ['Pull-ups', 'Barbell Rows', 'Face Pulls'],
        },
      ];

      setWorkoutDays(plan);
      setGeneratingPlan(false);
      setSetupMethod('ai');
    }, 2000);
  };

  const handleManualSetup = () => {
    setSetupMethod('manual');
    // Pre-populate with empty days based on selection
    const days = parseInt(daysPerWeek) || 3;
    const emptyPlan: WorkoutDay[] = Array.from({ length: days }, (_, i) => ({
      name: `Day ${i + 1}`,
      exercises: [],
    }));
    setWorkoutDays(emptyPlan);
  };

  const savePlan = async () => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          workoutPlan: workoutDays,
          onboardingStep: 'plan-complete',
        },
      });
      router.push('/(auth)/onboarding/permissions');
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save workout plan');
    }
  };

  if (generatingPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating your personalized plan...</Text>
        <Text style={styles.loadingSubtext}>
          Analyzing your goals and creating the perfect workout routine
        </Text>
      </View>
    );
  }

  if (setupMethod === null) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Set up your workout plan</Text>
          <Text style={styles.subtitle}>
            Choose how you would like to create your training routine
          </Text>

          {/* AI Generated Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={generateAIPlan}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#007AFF', '#0051D5']}
              style={styles.optionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="sparkles" size={32} color="#fff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>AI Generated Plan</Text>
                <Text style={styles.optionDescription}>
                  Let our AI create a personalized plan based on your goals
                </Text>
                <View style={styles.optionBadge}>
                  <Text style={styles.optionBadgeText}>RECOMMENDED</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Manual Setup Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleManualSetup}
            activeOpacity={0.7}
          >
            <View style={styles.optionWhite}>
              <View style={[styles.optionIconContainer, styles.optionIconWhite]}>
                <Ionicons name="create" size={32} color="#007AFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, styles.optionTitleDark]}>
                  Enter My Own Plan
                </Text>
                <Text style={[styles.optionDescription, styles.optionDescriptionDark]}>
                  Already have a routine? Add it manually
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#8E8E93" />
            </View>
          </TouchableOpacity>

          {/* Workout Frequency Selector */}
          <View style={styles.frequencySection}>
            <Text style={styles.frequencyLabel}>
              How many days per week do you want to train?
            </Text>
            <View style={styles.frequencyOptions}>
              {['2', '3', '4', '5', '6'].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.frequencyButton,
                    daysPerWeek === days && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setDaysPerWeek(days)}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      daysPerWeek === days && styles.frequencyButtonTextActive,
                    ]}
                  >
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Plan Preview/Edit View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSetupMethod(null)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Workout Plan</Text>
        <Text style={styles.subtitle}>
          Review your plan. You can customize it anytime in settings.
        </Text>

        {workoutDays.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day.name}</Text>
              <Text style={styles.dayCount}>{day.exercises.length} exercises</Text>
            </View>
            {day.exercises.map((exercise, exIndex) => (
              <View key={exIndex} style={styles.exerciseRow}>
                <Ionicons name="barbell-outline" size={20} color="#007AFF" />
                <Text style={styles.exerciseName}>{exercise}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={savePlan}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    lineHeight: 22,
  },
  optionCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  optionWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWhite: {
    backgroundColor: '#F2F2F7',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  optionTitleDark: {
    color: '#1C1C1E',
  },
  optionDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
  optionDescriptionDark: {
    color: '#8E8E93',
    opacity: 1,
  },
  optionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  optionBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  frequencySection: {
    marginTop: 32,
  },
  frequencyLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  frequencyButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  frequencyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  frequencyButtonTextActive: {
    color: '#fff',
  },
  dayCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  dayCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  exerciseName: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
