// components/HealthDashboard.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useHealthKit } from '../../features/healthkit/hooks/useHealthKit';

export default function HealthDashboard() {
  const { isAvailable, isLoading, getTodaySteps, getWeeklySteps } = useHealthKit();
  const [todaySteps, setTodaySteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState<any[]>([]);

  useEffect(() => {
    if (isAvailable) {
      loadHealthData();
    }
  }, [isAvailable]);

  const loadHealthData = async () => {
    try {
      const steps = await getTodaySteps();
      setTodaySteps(steps);

      const weekly = await getWeeklySteps();
      setWeeklySteps(weekly);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>🎭 Using Mock Data</Text>
      <Text>Today&apos;s Steps: {todaySteps}</Text>
      <Text>Weekly Data:</Text>
      {weeklySteps.map((day, index) => (
        <Text key={index}>
          {new Date(day.startDate).toLocaleDateString()}: {day.value} steps
        </Text>
      ))}
    </View>
  );
}
