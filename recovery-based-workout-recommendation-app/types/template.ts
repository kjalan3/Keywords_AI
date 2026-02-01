// types/template.ts
export type TemplateExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restTime?: number;
  muscleGroup: string;
  notes?: string;
};

export type WorkoutTemplate = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[]; // Changed from 'days' to 'exercises'
  isAiGenerated?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
