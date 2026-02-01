// app/workout/summary.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function WorkoutSummaryScreen() {
  const router = useRouter();

  // Mock data - replace with actual workout data
  const workoutData = {
    name: 'Push Day',
    duration: '52:14',
    date: 'Jan 31, 2026',
    exercises: [
      {
        name: 'Bench Press',
        sets: 4,
        volume: 5920,
        personalRecord: true,
      },
      {
        name: 'Incline Dumbbell Press',
        sets: 3,
        volume: 3600,
      },
      {
        name: 'Overhead Press',
        sets: 3,
        volume: 2850,
      },
      {
        name: 'Lateral Raises',
        sets: 3,
        volume: 1200,
      },
      {
        name: 'Tricep Pushdowns',
        sets: 3,
        volume: 1500,
      },
    ],
    totalVolume: 15070,
    totalSets: 16,
    personalRecords: 1,
  };

  React.useEffect(() => {
    // Trigger confetti animation
    const confettiRef = React.createRef<any>();
    setTimeout(() => {
      confettiRef.current?.startConfetti();
    }, 300);
  }, []);

  const shareWorkout = async () => {
    try {
      await Share.share({
        message: `Just crushed a ${workoutData.name}! 💪\n\n🏋️ ${workoutData.exercises.length} exercises\n⏱️ ${workoutData.duration}\n📊 ${(workoutData.totalVolume / 1000).toFixed(1)}k lbs total volume\n${workoutData.personalRecords > 0 ? `🏆 ${workoutData.personalRecords} PR${workoutData.personalRecords > 1 ? 's' : ''}!` : ''}\n\n#FitTrackAI #WorkoutComplete`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const finishAndReturn = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <LinearGradient
          colors={['#4CAF50', '#81C784']}
          style={styles.successHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Workout Complete!</Text>
          <Text style={styles.successSubtitle}>Great job staying consistent</Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#007AFF" />
            <Text style={styles.statValue}>{workoutData.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="barbell" size={32} color="#FF6B35" />
            <Text style={styles.statValue}>
              {(workoutData.totalVolume / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="fitness" size={32} color="#9C27B0" />
            <Text style={styles.statValue}>{workoutData.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="repeat" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{workoutData.totalSets}</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
        </View>

        {/* Personal Records */}
        {workoutData.personalRecords > 0 && (
          <View style={styles.section}>
            <View style={styles.prBanner}>
              <Ionicons name="trophy" size={28} color="#FFD700" />
              <Text style={styles.prText}>
                {workoutData.personalRecords} Personal Record
                {workoutData.personalRecords > 1 ? 's' : ''}!
              </Text>
            </View>
          </View>
        )}

        {/* Exercise Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Summary</Text>
          {workoutData.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseDetails}>
                <View style={styles.exerciseNameRow}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.personalRecord && (
                    <View style={styles.prBadge}>
                      <Ionicons name="trophy" size={12} color="#FFD700" />
                      <Text style={styles.prBadgeText}>PR</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.exerciseStats}>
                  {exercise.sets} sets • {(exercise.volume / 1000).toFixed(1)}k lbs
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* AI Feedback */}
        <View style={styles.section}>
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={24} color="#007AFF" />
              <Text style={styles.aiTitle}>AI Insights</Text>
            </View>
            <Text style={styles.aiText}>
              Excellent workout! Your volume is up 8% compared to your last push day. 
              Keep up this intensity. Consider increasing weight on bench press next session.
            </Text>
          </View>
        </View>

        {/* Recovery Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Ionicons name="water" size={24} color="#00BCD4" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Recovery Tip</Text>
              <Text style={styles.tipText}>
                Drink water and consume protein within 30 minutes for optimal recovery
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareButton} onPress={shareWorkout}>
          <Ionicons name="share-social" size={20} color="#007AFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={finishAndReturn}>
          <Text style={styles.doneButtonText}>Done</Text>
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
  successHeader: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  prText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  exerciseRow: {
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  prBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  exerciseStats: {
    fontSize: 14,
    color: '#8E8E93',
  },
  aiCard: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  aiText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
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
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  doneButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
});
