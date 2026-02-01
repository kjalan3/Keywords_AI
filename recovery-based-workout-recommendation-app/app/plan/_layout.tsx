// app/plan/_layout.tsx
import { Stack } from 'expo-router';

export default function PlanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Workout Templates',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontSize: 28, color: '#1C1C1E', fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Template',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
