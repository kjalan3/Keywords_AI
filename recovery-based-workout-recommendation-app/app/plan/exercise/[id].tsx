// app/plan/exercise/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

type ExerciseSet = {
  id: string;
  type: SetType;
  weight: string;
  reps: string;
  completed: boolean;
};

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock data - replace with actual data fetching
  const [exerciseName, setExerciseName] = useState('Bench Press');
  const [notes, setNotes] = useState('Focus on controlled descent');
  const [restTime, setRestTime] = useState('90');
  const [trackWeight, setTrackWeight] = useState(true);
  const [trackReps, setTrackReps] = useState(true);
  const [trackTime, setTrackTime] = useState(false);

  const [sets, setSets] = useState<ExerciseSet[]>([
    { id: '1', type: 'warmup', weight: '135', reps: '10', completed: false },
    { id: '2', type: 'normal', weight: '185', reps: '8', completed: false },
    { id: '3', type: 'normal', weight: '185', reps: '8', completed: false },
    { id: '4', type: 'normal', weight: '185', reps: '8', completed: false },
  ]);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet: ExerciseSet = {
      id: Date.now().toString(),
      type: 'normal',
      weight: lastSet?.weight || '',
      reps: lastSet?.reps || '8',
      completed: false,
    };
    setSets([...sets, newSet]);
  };

  const deleteSet = (setId: string) => {
    if (sets.length === 1) {
      Alert.alert('Error', 'Exercise must have at least one set');
      return;
    }
    setSets(sets.filter((set) => set.id !== setId));
  };

  const updateSet = (setId: string, field: keyof ExerciseSet, value: any) => {
    setSets(
      sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set))
    );
  };

  const getSetTypeLabel = (type: SetType) => {
    switch (type) {
      case 'warmup':
        return { label: 'W', color: '#FF9500' };
      case 'dropset':
        return { label: 'D', color: '#FF3B30' };
      case 'failure':
        return { label: 'F', color: '#5856D6' };
      default:
        return { label: (sets.findIndex((s) => s.id === type) + 1).toString(), color: '#007AFF' };
    }
  };

  const cycleSetType = (setId: string) => {
    const set = sets.find((s) => s.id === setId);
    if (!set) return;

    const types: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];
    const currentIndex = types.indexOf(set.type);
    const nextType = types[(currentIndex + 1) % types.length];

    updateSet(setId, 'type', nextType);
  };

  const saveChanges = () => {
    Alert.alert('Success', 'Exercise updated successfully');
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Exercise Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Name</Text>
          <TextInput
            style={styles.input}
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="Enter exercise name"
          />
        </View>

        {/* Tracking Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Track Weight</Text>
              <Switch
                value={trackWeight}
                onValueChange={setTrackWeight}
                trackColor={{ true: '#007AFF', false: '#E5E5EA' }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Track Reps</Text>
              <Switch
                value={trackReps}
                onValueChange={setTrackReps}
                trackColor={{ true: '#007AFF', false: '#E5E5EA' }}
              />
            </View>
            <View style={[styles.settingRow, styles.noBorder]}>
              <Text style={styles.settingLabel}>Track Time</Text>
              <Switch
                value={trackTime}
                onValueChange={setTrackTime}
                trackColor={{ true: '#007AFF', false: '#E5E5EA' }}
              />
            </View>
          </View>
        </View>

        {/* Sets Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sets</Text>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.setHeaderRow}>
              <Text style={[styles.setHeaderText, { width: 50 }]}>Set</Text>
              {trackWeight && <Text style={[styles.setHeaderText, { flex: 1 }]}>Weight</Text>}
              {trackReps && <Text style={[styles.setHeaderText, { flex: 1 }]}>Reps</Text>}
              <View style={{ width: 40 }} />
            </View>

            {/* Sets */}
            {sets.map((set, index) => {
              const typeInfo = getSetTypeLabel(set.type);
              return (
                <View key={set.id} style={styles.setRow}>
                  <TouchableOpacity
                    style={[styles.setNumberBadge, { backgroundColor: typeInfo.color }]}
                    onPress={() => cycleSetType(set.id)}
                  >
                    <Text style={styles.setNumberText}>
                      {set.type === 'normal' ? index + 1 : typeInfo.label}
                    </Text>
                  </TouchableOpacity>

                  {trackWeight && (
                    <TextInput
                      style={styles.setInput}
                      value={set.weight}
                      onChangeText={(text) => updateSet(set.id, 'weight', text)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  )}

                  {trackReps && (
                    <TextInput
                      style={styles.setInput}
                      value={set.reps}
                      onChangeText={(text) => updateSet(set.id, 'reps', text)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  )}

                  <TouchableOpacity onPress={() => deleteSet(set.id)}>
                    <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Add Set Button */}
            <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Tap the set number to cycle through: Normal → Warmup → Drop Set → Failure
          </Text>
        </View>

        {/* Rest Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rest Time (seconds)</Text>
          <TextInput
            style={styles.input}
            value={restTime}
            onChangeText={setRestTime}
            placeholder="90"
            keyboardType="numeric"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about form, tempo, etc."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Video Tutorial Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tutorial</Text>
          <TouchableOpacity style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={48} color="#007AFF" />
            <Text style={styles.videoText}>Watch Form Video</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F7',
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  setNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addSetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  helpText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },
  videoPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  videoText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
