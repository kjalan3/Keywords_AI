// app/(auth)/onboarding/complete.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export default function CompleteScreen() {
  const router = useRouter();
  const scale = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    // Animate the success icon
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    checkmarkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#81C784']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, containerStyle]}>
          <Animated.View style={checkmarkStyle}>
            <Ionicons name="checkmark-circle" size={120} color="#fff" />
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your personalized workout experience is ready. Let's start your fitness
          journey!
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="sparkles" size={24} color="#fff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>AI Recommendations</Text>
              <Text style={styles.featureDescription}>
                Get personalized workouts based on your recovery
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="trending-up" size={24} color="#fff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Track Progress</Text>
              <Text style={styles.featureDescription}>
                Monitor your gains and break through plateaus
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="heart" size={24} color="#fff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Smart Recovery</Text>
              <Text style={styles.featureDescription}>
                Prevent overtraining with HRV monitoring
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Start Training</Text>
          <Ionicons name="arrow-forward" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 48,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
