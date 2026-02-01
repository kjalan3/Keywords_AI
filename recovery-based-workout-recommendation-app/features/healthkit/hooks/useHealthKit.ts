// // features/healthkit/hooks/useHealthKit.ts
import { useEffect, useState } from "react";
import { Platform } from "react-native";

// Import mock instead of real
import type {
  HealthKitPermissions,
  HealthValue,
  WorkoutSample,
} from "../../../services/healthKit/mockHealthKit";
import { MockAppleHealthKit as AppleHealthKit } from "../../../services/healthKit/mockHealthKit";

// When ready to use real HealthKit, change to:
// import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

export const useHealthKit = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeHealthKit();
  }, []);

  const initializeHealthKit = () => {
    if (Platform.OS !== "ios") {
      console.log("HealthKit only available on iOS");
      setIsLoading(false);
      return;
    }

    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        ],
        write: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.Workout,
        ],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (error: string | null) => {
      if (error) {
        console.log("[ERROR] HealthKit init failed:", error);
        setIsLoading(false);
        return;
      }
      console.log("✅ HealthKit initialized");
      setIsAvailable(true);
      setIsLoading(false);
    });
  };

  const getTodaySteps = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const options = {
        date: new Date().toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err: any, results: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results.value);
      });
    });
  };

  const getWeeklySteps = (): Promise<HealthValue[]> => {
    return new Promise((resolve, reject) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const options = {
        startDate: startDate.toISOString(),
      };

      AppleHealthKit.getDailyStepCountSamples(
        options,
        (err: any, results: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(results);
        },
      );
    });
  };

  const getHeartRate = (): Promise<HealthValue[]> => {
    return new Promise((resolve, reject) => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 2);

      const options = {
        startDate: startDate.toISOString(),
      };

      AppleHealthKit.getHeartRateSamples(options, (err: any, results: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  };

  const getRecentWorkouts = (): Promise<WorkoutSample[]> => {
    return new Promise((resolve, reject) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const options = {
        startDate: startDate.toISOString(),
      };

      AppleHealthKit.getSamples(options, (err: any, results: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  };

  const saveWorkout = (workout: {
    activityType: string;
    duration: number;
    calories?: number;
    distance?: number;
    startDate: string;
    endDate: string;
  }): Promise<string> => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.saveWorkout(workout, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  };

  return {
    isAvailable,
    isLoading,
    getTodaySteps,
    getWeeklySteps,
    getHeartRate,
    getRecentWorkouts,
    saveWorkout,
  };
};
