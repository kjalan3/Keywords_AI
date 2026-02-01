// store/templateStore.ts
import { create } from "zustand";
import { supabase } from "../services/supabase/client";
import type { WorkoutTemplate } from "../types/template";

type TemplateState = {
  templates: WorkoutTemplate[];
  currentTemplate: WorkoutTemplate | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTemplates: (userId: string) => Promise<void>;
  createTemplate: (
    template: Omit<WorkoutTemplate, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string | null>;
  updateTemplate: (
    templateId: string,
    updates: Partial<WorkoutTemplate>,
  ) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  setCurrentTemplate: (template: WorkoutTemplate | null) => void;
  getTemplateById: (templateId: string) => WorkoutTemplate | null;
};

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,

  loadTemplates: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        set({ error: error.message, isLoading: false });
        return;
      }

      const templates: WorkoutTemplate[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        exercises: row.exercises,
        isAiGenerated: row.is_ai_generated,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      set({ templates, isLoading: false, error: null });
    } catch (error: any) {
      console.error("Failed to load templates:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  createTemplate: async (template) => {
    set({ isLoading: true, error: null });

    try {
      const id = Date.now().toString();
      const { error: insertError } = await supabase
        .from("workout_templates")
        .insert({
          id,
          user_id: template.userId,
          name: template.name,
          description: template.description,
          exercises: template.exercises,
          is_ai_generated: template.isAiGenerated || false,
        });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        set({ error: insertError.message, isLoading: false });
        return null;
      }

      // Reload templates
      await get().loadTemplates(template.userId);
      set({ isLoading: false, error: null });
      return id;
    } catch (error: any) {
      console.error("Failed to create template:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateTemplate: async (templateId, updates) => {
    set({ isLoading: true, error: null });

    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined)
        dbUpdates.description = updates.description;
      if (updates.exercises) dbUpdates.exercises = updates.exercises;

      const { error } = await supabase
        .from("workout_templates")
        .update(dbUpdates)
        .eq("id", templateId);

      if (error) {
        console.error("Supabase update error:", error);
        set({ error: error.message, isLoading: false });
        return;
      }

      // Update local state
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === templateId ? { ...t, ...updates } : t,
        ),
        currentTemplate:
          state.currentTemplate?.id === templateId
            ? { ...state.currentTemplate, ...updates }
            : state.currentTemplate,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Failed to update template:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  deleteTemplate: async (templateId) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from("workout_templates")
        .delete()
        .eq("id", templateId);

      if (error) {
        console.error("Supabase delete error:", error);
        set({ error: error.message, isLoading: false });
        return;
      }

      set((state) => ({
        templates: state.templates.filter((t) => t.id !== templateId),
        currentTemplate:
          state.currentTemplate?.id === templateId
            ? null
            : state.currentTemplate,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Failed to delete template:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  setCurrentTemplate: (template) => set({ currentTemplate: template }),

  getTemplateById: (templateId) => {
    const { templates } = get();
    return templates.find((t) => t.id === templateId) || null;
  },
}));
