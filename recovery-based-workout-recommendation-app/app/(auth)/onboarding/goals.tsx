// app/(auth)/onboarding/goals.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Goal = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const GOALS: Goal[] = [
  {
    id: 'lose-fat',
    title: 'Lose Fat',
    description: 'Shed body fat while maintaining muscle',
    icon: 'flame',
    color: '#FF6B35',
  },
  {
    id: 'build-strength',
    title: 'Build Strength',
    description: 'Increase your overall strength and power',
    icon: 'barbell',
    color: '#007AFF',
  },
  {
    id: 'gain-muscle',
    title: 'Gain Muscle',
    description: 'Build lean muscle mass and size',
    icon: 'fitness',
    color: '#9C27B0',
  },
  {
    id: 'get-toned',
    title: 'Get Toned',
    description: 'Achieve a lean, defined physique',
    icon: 'body',
    color: '#4CAF50',
  },
  {
    id: 'maintain',
    title: 'Maintain Fitness',
    description: 'Stay in shape and maintain current level',
    icon: 'checkmark-circle',
    color: '#00BCD4',
  },
  {
    id: 'general-fitness',
    title: 'General Fitness',
    description: 'Improve overall health and wellness',
    icon: 'heart',
    color: '#FF4081',
  },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      // Allow up to 2 goals
      if (selectedGoals.length < 2) {
        setSelectedGoals([...selectedGoals, goalId]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 2 primary goals');
      }
    }
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one fitness goal');
      return;
    }

    // Save goals to Clerk user metadata
    try {
      await user?.update({
        unsafeMetadata: {
          fitnessGoals: selectedGoals,
          onboardingStep: 'goals-complete',
        },
      });
      router.push('/(auth)/onboarding/plan-setup');
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    }
  };

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
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are your fitness goals?</Text>
        <Text style={styles.subtitle}>
          Select up to 2 primary goals. This helps us personalize your experience.
        </Text>

        <View style={styles.goalsGrid}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                  { borderColor: goal.color },
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.goalIconContainer,
                    { backgroundColor: goal.color },
                  ]}
                >
                  <Ionicons name={goal.icon} size={32} color="#fff" />
                </View>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: goal.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedGoals.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
        >
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
  goalsGrid: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    position: 'relative',
  },
  goalCardSelected: {
    borderWidth: 3,
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
