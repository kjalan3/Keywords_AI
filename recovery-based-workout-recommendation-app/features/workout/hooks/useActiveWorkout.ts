// features/workout/hooks/useActiveWorkout.ts
import { useUser } from "@clerk/clerk-expo";
import { useWorkoutStore } from "../../../store/workoutStore";
import type { Exercise, WorkoutSet } from "../../../types/workout";

export const useActiveWorkout = () => {
  const { user } = useUser();
  const {
    activeWorkout,
    isWorkoutActive,
    workoutStartTime,
    isLoading,
    error,
    startWorkout,
    endWorkout,
    addExercise,
    removeExercise,
    updateExercise,
    addSet,
    updateSet,
    deleteSet,
    toggleSetCompletion,
    saveWorkout,
  } = useWorkoutStore();

  const createWorkout = (name: string) => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }
    startWorkout(name, user.id);
  };

  const addExerciseToWorkout = (exerciseName: string, exerciseId: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      muscleGroup: "",
      sets: [],
      notes: "",
    };
    addExercise(newExercise);
  };

  const addNewSet = (exerciseId: string, previousSet?: WorkoutSet) => {
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      setNumber:
        activeWorkout?.exercises.find((ex) => ex.id === exerciseId)?.sets
          .length || 0 + 1,
      type: "normal",
      weight: previousSet?.weight || 0,
      reps: previousSet?.reps || 0,
      completed: false,
      restTime: 90,
    };
    addSet(exerciseId, newSet);
  };

  const finishWorkout = async () => {
    if (!activeWorkout || !user) return;
    await saveWorkout();
  };

  return {
    activeWorkout,
    isWorkoutActive,
    workoutStartTime,
    isLoading,
    error,
    createWorkout,
    endWorkout: finishWorkout,
    addExerciseToWorkout,
    removeExercise,
    updateExercise,
    addNewSet,
    updateSet,
    deleteSet,
    toggleSetCompletion,
  };
};
