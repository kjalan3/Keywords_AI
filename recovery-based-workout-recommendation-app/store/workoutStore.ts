// store/workoutStore.ts
import { create } from "zustand";
import { supabase } from "../services/supabase/client";
import type { Exercise, Workout, WorkoutSet } from "../types/workout";

type WorkoutState = {
  // Active workout
  activeWorkout: Workout | null;
  isWorkoutActive: boolean;
  workoutStartTime: string | null;

  // Workout history
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;

  // Actions
  startWorkout: (name: string, userId: string) => void;
  endWorkout: () => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  addSet: (exerciseId: string, set: WorkoutSet) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>,
  ) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  toggleSetCompletion: (exerciseId: string, setId: string) => void;
  saveWorkout: () => Promise<void>;
  loadWorkouts: (userId: string) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  isWorkoutActive: false,
  workoutStartTime: null,
  workouts: [],
  isLoading: false,
  error: null,

  startWorkout: (name: string, userId: string) => {
    const now = new Date().toISOString();
    set({
      activeWorkout: {
        id: Date.now().toString(),
        userId,
        name,
        date: now,
        startTime: now,
        exercises: [],
        isTemplate: false,
      },
      isWorkoutActive: true,
      workoutStartTime: now,
      error: null,
    });
  },

  endWorkout: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const endTime = new Date().toISOString();
    const duration =
      (new Date(endTime).getTime() -
        new Date(activeWorkout.startTime).getTime()) /
      1000;

    const totalVolume = activeWorkout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight || 0) * (set.reps || 0);
        }, 0)
      );
    }, 0);

    const totalSets = activeWorkout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);

    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime,
      duration,
      totalVolume,
      totalSets,
    };

    set((state) => ({
      workouts: [completedWorkout, ...state.workouts],
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
    }));
  },

  addExercise: (exercise: Exercise) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: [...state.activeWorkout.exercises, exercise],
          }
        : null,
    }));
  },

  removeExercise: (exerciseId: string) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.filter(
              (ex) => ex.id !== exerciseId,
            ),
          }
        : null,
    }));
  },

  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex,
            ),
          }
        : null,
    }));
  },

  addSet: (exerciseId: string, workoutSet: WorkoutSet) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((ex) =>
              ex.id === exerciseId
                ? { ...ex, sets: [...ex.sets, workoutSet] }
                : ex,
            ),
          }
        : null,
    }));
  },

  updateSet: (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>,
  ) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((ex) =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map((s) =>
                      s.id === setId ? { ...s, ...updates } : s,
                    ),
                  }
                : ex,
            ),
          }
        : null,
    }));
  },

  deleteSet: (exerciseId: string, setId: string) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((ex) =>
              ex.id === exerciseId
                ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
                : ex,
            ),
          }
        : null,
    }));
  },

  toggleSetCompletion: (exerciseId: string, setId: string) => {
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((ex) =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map((s) =>
                      s.id === setId ? { ...s, completed: !s.completed } : s,
                    ),
                  }
                : ex,
            ),
          }
        : null,
    }));
  },

  saveWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) {
      set({ error: "No active workout to save" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const endTime = new Date().toISOString();
      const duration =
        (new Date(endTime).getTime() -
          new Date(activeWorkout.startTime).getTime()) /
        1000;

      const totalVolume = activeWorkout.exercises.reduce((total, exercise) => {
        return (
          total +
          exercise.sets.reduce((setTotal, workoutSet) => {
            return setTotal + (workoutSet.weight || 0) * (workoutSet.reps || 0);
          }, 0)
        );
      }, 0);

      const totalSets = activeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.sets.length;
      }, 0);

      const completedWorkout: Workout = {
        ...activeWorkout,
        endTime,
        duration,
        totalVolume,
        totalSets,
      };

      // Insert into Supabase
      const { error: insertError } = await supabase.from("workouts").insert({
        id: completedWorkout.id,
        user_id: completedWorkout.userId,
        name: completedWorkout.name,
        date: completedWorkout.date,
        start_time: completedWorkout.startTime,
        end_time: completedWorkout.endTime,
        duration: completedWorkout.duration,
        exercises: completedWorkout.exercises,
        total_volume: completedWorkout.totalVolume,
        total_sets: completedWorkout.totalSets,
        notes: completedWorkout.notes,
        is_template: completedWorkout.isTemplate,
        ai_generated: completedWorkout.aiGenerated,
      });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        set({ error: insertError.message, isLoading: false });
        return;
      }

      // Update local state
      set((state) => ({
        workouts: [completedWorkout, ...state.workouts],
        activeWorkout: null,
        isWorkoutActive: false,
        workoutStartTime: null,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Failed to save workout:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  loadWorkouts: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        set({ error: error.message, isLoading: false });
        return;
      }

      // Transform snake_case to camelCase
      const workouts: Workout[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        exercises: row.exercises,
        totalVolume: row.total_volume,
        totalSets: row.total_sets,
        notes: row.notes,
        isTemplate: row.is_template,
        aiGenerated: row.ai_generated,
      }));

      set({ workouts, isLoading: false, error: null });
    } catch (error: any) {
      console.error("Failed to load workouts:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  deleteWorkout: async (workoutId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) {
        console.error("Supabase delete error:", error);
        set({ error: error.message, isLoading: false });
        return;
      }

      // Update local state
      set((state) => ({
        workouts: state.workouts.filter((w) => w.id !== workoutId),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Failed to delete workout:", error);
      set({ error: error.message, isLoading: false });
    }
  },
}));
