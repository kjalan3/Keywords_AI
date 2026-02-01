// app/(tabs)/workouts.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Workout = {
  id: string;
  name: string;
  date: string;
  duration: string;
  exercises: number;
  volume: number;
};

export default function WorkoutsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data later
  const workouts: Workout[] = [
    {
      id: '1',
      name: 'Push Day',
      date: 'Jan 29, 2026',
      duration: '52 min',
      exercises: 8,
      volume: 12500,
    },
    {
      id: '2',
      name: 'Pull Day',
      date: 'Jan 27, 2026',
      duration: '48 min',
      exercises: 7,
      volume: 11200,
    },
    {
      id: '3',
      name: 'Leg Day',
      date: 'Jan 26, 2026',
      duration: '65 min',
      exercises: 6,
      volume: 15800,
    },
    {
      id: '4',
      name: 'Upper Body',
      date: 'Jan 24, 2026',
      duration: '55 min',
      exercises: 9,
      volume: 13400,
    },
  ];

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => router.push(`/workout/${item.id}`)}
    >
      <View style={styles.workoutHeader}>
        <View>
          <Text style={styles.workoutName}>{item.name}</Text>
          <Text style={styles.workoutDate}>{item.date}</Text>
        </View>
        <View style={styles.volumeBadge}>
          <Text style={styles.volumeText}>{(item.volume / 1000).toFixed(1)}k</Text>
          <Text style={styles.volumeLabel}>lbs</Text>
        </View>
      </View>
      <View style={styles.workoutStats}>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text style={styles.statText}>{item.duration}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="barbell-outline" size={16} color="#8E8E93" />
          <Text style={styles.statText}>{item.exercises} exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Workout List */}
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/workout/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  volumeBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  volumeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  volumeLabel: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
