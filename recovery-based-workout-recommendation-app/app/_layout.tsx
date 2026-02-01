// app/_layout.tsx
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

console.log('Clerk Key:', CLERK_PUBLISHABLE_KEY); // Debug log

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments.includes('onboarding');

    console.log('Navigation State:', {
      isSignedIn,
      inAuthGroup,
      inOnboarding,
      segments,
      onboardingComplete: user?.unsafeMetadata?.onboardingComplete,
    });

    if (isSignedIn) {
      // User is signed in
      const onboardingComplete = user?.unsafeMetadata?.onboardingComplete;

      if (!onboardingComplete) {
        // Not completed onboarding - send to welcome screen
        if (!inOnboarding) {
          console.log('Redirecting to onboarding/welcome');
          router.replace('/(auth)/onboarding/welcome' as any);
        }
      } else {
        // Onboarding complete - send to main app
        if (inAuthGroup) {
          console.log('Redirecting to tabs');
          router.replace('/(tabs)' as any);
        }
      }
    } else {
      // User is not signed in
      if (!inAuthGroup) {
        console.log('Redirecting to sign-in');
        router.replace('/(auth)/sign-in' as any);
      }
    }
  }, [isLoaded, isSignedIn, segments, user?.unsafeMetadata?.onboardingComplete, router]);

  return <Slot />;
}

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error(
      'Missing Clerk Publishable Key. Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file'
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
}