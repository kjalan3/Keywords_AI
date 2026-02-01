// app/plan/_layout.tsx
import { Stack } from 'expo-router';

export default function PlanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Workout Plan',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="exercise/[id]"
        options={{
          title: 'Exercise Details',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
