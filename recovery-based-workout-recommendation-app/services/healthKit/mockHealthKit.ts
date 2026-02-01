// services/healthKit/mockHealthKit.ts
export interface HealthKitPermissions {
  permissions: {
    read: string[];
    write: string[];
  };
}

export interface HealthValue {
  value: number;
  startDate: string;
  endDate: string;
  id?: string;
  sourceName?: string;
}

export interface WorkoutSample {
  id: string;
  activityType: string;
  duration: number;
  calories: number;
  distance?: number;
  startDate: string;
  endDate: string;
}

class MockHealthKit {
  private initialized = false;

  // Mock permissions
  Constants = {
    Permissions: {
      Steps: "Steps",
      HeartRate: "HeartRate",
      ActiveEnergyBurned: "ActiveEnergyBurned",
      DistanceWalkingRunning: "DistanceWalkingRunning",
      Weight: "Weight",
      Height: "Height",
      BodyMass: "BodyMass",
      Workout: "Workout",
    },
  };

  // Initialize mock HealthKit
  initHealthKit(
    permissions: HealthKitPermissions,
    callback: (error: string | null) => void,
  ) {
    console.log("🎭 Mock HealthKit initialized with permissions:", permissions);
    setTimeout(() => {
      this.initialized = true;
      callback(null); // Success
    }, 500);
  }

  // Mock: Get step count
  getStepCount(
    options: { date?: string; startDate?: string; endDate?: string },
    callback: (error: string | null, results: HealthValue) => void,
  ) {
    if (!this.initialized) {
      callback("HealthKit not initialized", {
        value: 0,
        startDate: "",
        endDate: "",
      });
      return;
    }

    setTimeout(() => {
      const mockSteps = Math.floor(Math.random() * 5000) + 3000; // 3000-8000 steps
      callback(null, {
        value: mockSteps,
        startDate: options.startDate || new Date().toISOString(),
        endDate: options.endDate || new Date().toISOString(),
      });
    }, 200);
  }

  // Mock: Get daily step samples
  getDailyStepCountSamples(
    options: { startDate: string; endDate?: string },
    callback: (error: string | null, results: HealthValue[]) => void,
  ) {
    setTimeout(() => {
      const days = 7;
      const samples: HealthValue[] = [];

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        samples.push({
          value: Math.floor(Math.random() * 5000) + 3000,
          startDate: date.toISOString(),
          endDate: date.toISOString(),
        });
      }

      callback(null, samples.reverse());
    }, 200);
  }

  // Mock: Get heart rate samples
  getHeartRateSamples(
    options: { startDate: string; endDate?: string },
    callback: (error: string | null, results: HealthValue[]) => void,
  ) {
    setTimeout(() => {
      const samples: HealthValue[] = [];

      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - i * 5);
        samples.push({
          value: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
          startDate: date.toISOString(),
          endDate: date.toISOString(),
        });
      }

      callback(null, samples.reverse());
    }, 200);
  }

  // Mock: Get calories burned
  getActiveEnergyBurned(
    options: { startDate: string; endDate?: string },
    callback: (error: string | null, results: HealthValue) => void,
  ) {
    setTimeout(() => {
      callback(null, {
        value: Math.floor(Math.random() * 500) + 200, // 200-700 calories
        startDate: options.startDate,
        endDate: options.endDate || new Date().toISOString(),
      });
    }, 200);
  }

  // Mock: Get workout samples
  getSamples(
    options: { startDate: string; endDate?: string },
    callback: (error: string | null, results: WorkoutSample[]) => void,
  ) {
    setTimeout(() => {
      const workouts: WorkoutSample[] = [
        {
          id: "1",
          activityType: "Running",
          duration: 1800, // 30 minutes
          calories: 250,
          distance: 5000, // 5km in meters
          startDate: new Date(Date.now() - 86400000).toISOString(),
          endDate: new Date(Date.now() - 84600000).toISOString(),
        },
        {
          id: "2",
          activityType: "Cycling",
          duration: 2400, // 40 minutes
          calories: 320,
          distance: 12000,
          startDate: new Date(Date.now() - 172800000).toISOString(),
          endDate: new Date(Date.now() - 170400000).toISOString(),
        },
        {
          id: "3",
          activityType: "WeightTraining",
          duration: 3600, // 60 minutes
          calories: 400,
          startDate: new Date(Date.now() - 259200000).toISOString(),
          endDate: new Date(Date.now() - 255600000).toISOString(),
        },
      ];

      callback(null, workouts);
    }, 200);
  }

  // Mock: Save workout
  saveWorkout(
    workout: {
      activityType: string;
      duration: number;
      calories?: number;
      distance?: number;
      startDate: string;
      endDate: string;
    },
    callback: (error: string | null, result: string) => void,
  ) {
    console.log("🎭 Mock: Saving workout", workout);
    setTimeout(() => {
      callback(null, "workout-" + Date.now());
    }, 200);
  }
}

export const MockAppleHealthKit = new MockHealthKit();

export const getMockHealthData = () => {
  return {
    steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000
    heartRate: Array.from({ length: 20 }, (_, i) => ({
      value: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
      startDate: new Date(Date.now() - i * 300000).toISOString(), // Every 5 mins
      endDate: new Date(Date.now() - i * 300000).toISOString(),
    })),
    sleep: Math.floor(Math.random() * 3) + 6, // 6-9 hours
    workoutHistory: [], // Will be populated from workout store
  };
};
