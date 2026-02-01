// features/healthkit/hooks/useRecoveryAnalysis.ts
import { useEffect, useState } from 'react';
import { keywordsAI } from '../../../services/ai/keywordsAI';
import { getMockHealthData } from '../../../services/healthKit/mockHealthKit';
import { useWorkoutStore } from '../../../store/workoutStore';

export interface RecoveryData {
  score: number;
  status: 'excellent' | 'good' | 'low';
  reasoning: string;
  recommendations: string[];
  workoutIntensity: 'high' | 'moderate' | 'light';
}

interface UseRecoveryAnalysisReturn {
  recovery: RecoveryData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecoveryAnalysis = (): UseRecoveryAnalysisReturn => {
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { workouts } = useWorkoutStore();

  const analyzeRecovery = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get mock health data
      const healthData = getMockHealthData();
      
      // Add workout history from store
      healthData.workoutHistory = workouts as any;

      console.log('Analyzing recovery with health data:', {
        steps: healthData.steps,
        heartRateCount: healthData.heartRate.length,
        sleep: healthData.sleep,
        workoutCount: healthData.workoutHistory.length,
      });

      // Call Keywords AI for analysis
      const analysis = await keywordsAI.analyzeRecovery(healthData);
      
      console.log('Recovery analysis complete:', analysis);
      setRecovery(analysis);
    } catch (err: any) {
      console.error('Recovery analysis error:', err);
      setError(err?.message || 'Failed to analyze recovery');
      
      // Fallback to mock data if API fails
      console.log('Using fallback recovery data');
      setRecovery({
        score: 78,
        status: 'good',
        reasoning: 'Based on your recent activity and rest patterns. (Using mock data)',
        recommendations: [
          'Focus on moderate intensity workouts',
          'Ensure 7-8 hours of sleep tonight',
          'Stay hydrated throughout the day',
        ],
        workoutIntensity: 'moderate',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    analyzeRecovery();
  }, []); // Empty dependency array - only run on mount

  // Refetch when workouts change (debounced)
  useEffect(() => {
    if (workouts.length > 0) {
      // Add a small delay to avoid multiple calls
      const timer = setTimeout(() => {
        analyzeRecovery();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [workouts.length]); // Only re-run when workout count changes

  return {
    recovery,
    isLoading,
    error,
    refetch: analyzeRecovery,
  };
};
