// features/onboarding/hooks/useOnboarding.ts
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export type OnboardingStep =
  | 'not-started'
  | 'goals-complete'
  | 'plan-complete'
  | 'permissions-complete'
  | 'complete';

export function useOnboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('not-started');
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete as boolean;
    const step = (user?.unsafeMetadata?.onboardingStep as OnboardingStep) || 'not-started';

    setIsOnboarding(!onboardingComplete);
    setCurrentStep(step);

    // Redirect based on onboarding status
    if (!onboardingComplete && step === 'not-started') {
      router.replace('/(auth)/onboarding/welcome');
    }
  }, [isLoaded, user]);

  const completeOnboarding = async () => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingComplete: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      });
      setIsOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const updateOnboardingStep = async (step: OnboardingStep) => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingStep: step,
        },
      });
      setCurrentStep(step);
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingComplete: false,
          onboardingStep: 'not-started',
        },
      });
      setIsOnboarding(true);
      setCurrentStep('not-started');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  return {
    isOnboarding,
    currentStep,
    completeOnboarding,
    updateOnboardingStep,
    resetOnboarding,
  };
}
