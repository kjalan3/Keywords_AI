// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen 
        name="onboarding/welcome" 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="onboarding/goals" 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="onboarding/plan-setup" 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="onboarding/permissions" 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="onboarding/complete" 
        options={{ gestureEnabled: false }} 
      />
    </Stack>
  );
}
