// app/(auth)/onboarding/welcome.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#007AFF', '#0051D5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="barbell" size={80} color="#fff" />
        </View>

        <Text style={styles.title}>Welcome to Recovery Based Workout Recommendation</Text>
        <Text style={styles.subtitle}>
          Your intelligent workout companion powered by AI
        </Text>

        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Ionicons name="sparkles" size={24} color="#fff" />
            <Text style={styles.featureText}>AI-powered workout recommendations</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={styles.featureText}>Recovery-based training adjustments</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={24} color="#fff" />
            <Text style={styles.featureText}>Track progress and break plateaus</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="phone-portrait" size={24} color="#fff" />
            <Text style={styles.featureText}>Apple Health integration</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/onboarding/goals')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#007AFF" />
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  featureList: {
    width: '100%',
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
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
    padding: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
