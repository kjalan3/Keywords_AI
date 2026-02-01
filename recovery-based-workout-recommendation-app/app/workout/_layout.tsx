// app/workout/_layout.tsx
import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="new"
        options={{
          title: 'New Workout',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 28, fontWeight: 'bold' },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="suggested"
        options={{
          title: 'AI Suggested Workout',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 28, fontWeight: 'bold' },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Active Workout',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 28, fontWeight: 'bold' },
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="exercise-select"
        options={{
          title: 'Select Exercise',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 28, fontWeight: 'bold' },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Workout Complete',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 28, fontWeight: 'bold' },
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
