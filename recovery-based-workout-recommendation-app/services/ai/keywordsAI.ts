// services/ai/keywordsAI.ts
import axios from "axios";

const KEYWORDS_AI_API_KEY = process.env.EXPO_PUBLIC_KEYWORDS_AI_API_KEY;
const KEYWORDS_AI_BASE_URL = "https://api.keywordsai.co/api/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RecoveryAnalysis {
  score: number;
  status: "excellent" | "good" | "low";
  reasoning: string;
  recommendations: string[];
  workoutIntensity: "high" | "moderate" | "light";
}

interface WorkoutRecommendation {
  name: string;
  type: string;
  duration: number;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    notes?: string;
  }[];
  reasoning: string;
}

export class KeywordsAIService {
  private async callAPI(
    messages: ChatMessage[],
    model = "groq/llama-3.3-70b-versatile",
  ) {
    try {
      const response = await axios.post(
        KEYWORDS_AI_BASE_URL,
        {
          model,
          messages,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KEYWORDS_AI_API_KEY}`,
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Keywords AI API Error:", error);
      throw error;
    }
  }

  async analyzeRecovery(healthData: {
    steps: number;
    heartRate: { value: number; startDate: string; endDate: string }[];
    sleep: number;
    workoutHistory: any[];
  }): Promise<RecoveryAnalysis> {
    const averageHR =
      healthData.heartRate.reduce((a, b) => a + b.value, 0) /
      healthData.heartRate.length;
    const recentWorkouts = healthData.workoutHistory.slice(0, 7).length;

    const prompt = `You are a fitness recovery expert. Analyze the following health data and provide a recovery score (0-100) and recommendations. Make your response directed towards the individual.

Health Data:
- Daily Steps: ${healthData.steps}
- Average Heart Rate: ${averageHR.toFixed(0)} bpm
- Sleep Duration: ${healthData.sleep} hours
- Workouts in last 7 days: ${recentWorkouts}

Provide your response in the following JSON format:
{
  "score": <number 0-100>,
  "status": <"excellent" | "good" | "low">,
  "reasoning": "<brief explanation>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "workoutIntensity": <"high" | "moderate" | "light">
}`;

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are an expert fitness coach analyzing recovery metrics. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await this.callAPI(messages);

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid response format");
  }

  async generateWorkoutPlan(
    recoveryData: RecoveryAnalysis,
    userPreferences: {
      focusArea?: string;
      duration?: number;
      equipment?: string[];
    },
  ): Promise<WorkoutRecommendation> {
    const duration = userPreferences.duration || 45;

    // Calculate realistic exercise count based on duration
    const maxExercises = Math.floor(duration / 8); // ~8 min per exercise
    const minExercises = Math.max(3, Math.floor(duration / 12));

    // Adjust intensity based on recovery
    const getIntensityGuidelines = (score: number, intensity: string) => {
      if (score < 60 || intensity === "light") {
        return {
          setRange: "2-3",
          repRange: "12-15",
          notes: "Focus on form and recovery. Avoid going to failure.",
          restTime: "60-90 seconds",
        };
      } else if (score >= 80 || intensity === "high") {
        return {
          setRange: "4-5",
          repRange: "6-8",
          notes:
            "Push hard with good intensity. Can approach failure on last set.",
          restTime: "2-3 minutes for compounds",
        };
      } else {
        return {
          setRange: "3-4",
          repRange: "8-12",
          notes: "Moderate intensity. Leave 1-2 reps in reserve.",
          restTime: "90-120 seconds",
        };
      }
    };

    const guidelines = getIntensityGuidelines(
      recoveryData.score,
      recoveryData.workoutIntensity,
    );

    const fewShotExamples = `
EXAMPLE 1 (Recovery: 85/100, High Intensity, Upper Body, 45 min):
{
  "name": "Heavy Push Power",
  "type": "Strength",
  "duration": 45,
  "exercises": [
    {"name": "Flat Barbell Bench Press", "sets": 5, "reps": "5-6", "notes": "Focus on explosive concentric, controlled eccentric"},
    {"name": "Incline Dumbbell Press", "sets": 4, "reps": "8-10", "notes": "Squeeze chest at top of movement"},
    {"name": "Standing Overhead Press", "sets": 4, "reps": "6-8", "notes": "Keep core braced, full lockout"},
    {"name": "Cable Flyes", "sets": 3, "reps": "12-15", "notes": "Control the stretch, feel the contraction"},
    {"name": "Close-Grip Pushups", "sets": 3, "reps": "12-15", "notes": "Drop set on final set"}
  ],
  "reasoning": "With your excellent recovery score of 85/100, your body is primed for a high-intensity strength session. This workout focuses on heavy compounds with lower reps to build strength, followed by higher-rep accessories for hypertrophy."
}

EXAMPLE 2 (Recovery: 55/100, Light Intensity, Full Body, 45 min):
{
  "name": "Active Recovery Flow",
  "type": "Conditioning",
  "duration": 45,
  "exercises": [
    {"name": "Goblet Squats", "sets": 3, "reps": "15-20", "notes": "Controlled tempo, focus on form"},
    {"name": "Dumbbell Romanian Deadlifts", "sets": 3, "reps": "12-15", "notes": "Light weight, feel the hamstring stretch"},
    {"name": "Incline Push-ups", "sets": 3, "reps": "12-15", "notes": "Easier angle to reduce stress"},
    {"name": "Dumbbell Rows", "sets": 3, "reps": "15", "notes": "Lighter weight, perfect form"}
  ],
  "reasoning": "Your recovery score of 55/100 indicates your body needs a lighter session today. This workout uses higher reps with lighter loads to promote blood flow and active recovery while avoiding excessive fatigue."
}

NOW CREATE A UNIQUE WORKOUT BASED ON THE DATA PROVIDED:`;

    const prompt = `You are an expert strength coach with 15+ years of experience. Create a SPECIFIC and REALISTIC workout plan.

CRITICAL CONSTRAINTS:
- MUST create ${minExercises}-${maxExercises} exercises ONLY (not more!)
- Each exercise takes ~8-10 minutes including rest
- Total workout: ${duration} minutes
- Recovery Score: ${recoveryData.score}/100 (${recoveryData.status})
- Recommended Intensity: ${recoveryData.workoutIntensity}

WORKOUT PARAMETERS:
- Focus: ${userPreferences.focusArea || "Full Body"}
- Equipment Available: ${userPreferences.equipment?.join(", ") || "Bodyweight, Dumbbells"}
- Sets per exercise: ${guidelines.setRange}
- Rep range: ${guidelines.repRange}
- Rest between sets: ${guidelines.restTime}

INTENSITY GUIDELINES:
${guidelines.notes}

STRUCTURE RULES:
1. Start with compound movements (multi-joint exercises)
2. Progress from heavy to light
3. End with isolation or accessory work
4. Balance muscle groups (don't only push or only pull)
5. Include 1 warmup set for first compound exercise

RECOVERY-SPECIFIC ADJUSTMENTS:
${
  recoveryData.score < 60
    ? "- LOW RECOVERY: Choose easier variations, reduce volume, avoid high-intensity techniques"
    : recoveryData.score >= 80
      ? "- HIGH RECOVERY: Can include advanced techniques like drop sets or supersets on last exercise"
      : "- MODERATE RECOVERY: Standard progressive overload, focus on consistent execution"
}

EXERCISE SELECTION (${userPreferences.focusArea || "Full Body"}):
${
  userPreferences.focusArea === "Upper Body" ||
  userPreferences.focusArea === "Full Body"
    ? "- Include at least 1 horizontal push (bench/pushup) and 1 vertical push (overhead press)\n- Include 1 pulling movement for balance"
    : ""
}
${
  userPreferences.focusArea === "Lower Body" ||
  userPreferences.focusArea === "Full Body"
    ? "- Include 1 squat or hinge pattern\n- Include posterior chain work"
    : ""
}

EXAMPLE GOOD STRUCTURE (45 min):
1. Compound Exercise 1 (4 sets) - 10 min
2. Compound Exercise 2 (3-4 sets) - 8 min
3. Accessory Exercise 1 (3 sets) - 7 min
4. Accessory Exercise 2 (3 sets) - 7 min
5. Finisher (2-3 sets) - 6 min
Total: 5 exercises, ~40 minutes

Respond ONLY with valid JSON in this EXACT format:
{
  "name": "<creative workout name related to focus area>",
  "type": "<workout type: Strength, Hypertrophy, or Conditioning>",
  "duration": ${duration},
  "exercises": [
    {
      "name": "<specific exercise name>",
      "sets": <number based on ${guidelines.setRange}>,
      "reps": "<rep range like ${guidelines.repRange}>",
      "notes": "<1 concise form cue or technique tip>"
    }
  ],
  "reasoning": "<2-3 sentences explaining WHY this workout matches their ${recoveryData.score}/100 recovery score and ${recoveryData.workoutIntensity} intensity recommendation>"
}

IMPORTANT: 
- Create EXACTLY ${minExercises}-${maxExercises} exercises for ${duration} minutes
- Make the workout DIFFERENT each time (vary exercises, order, rep schemes)
- Be SPECIFIC to the recovery data provided
- Use timestamp: ${Date.now()} to ensure variety`;

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert strength and conditioning coach. You create varied, personalized workout plans based on recovery metrics. You ALWAYS respond with ONLY valid JSON, no markdown or explanations. Each workout you create is unique and specifically tailored to the user's recovery status.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await this.callAPI(
      messages,
      "groq/llama-3.3-70b-versatile",
    );

    console.log("Raw AI Response:", response);

    // Parse JSON from response - handle markdown code blocks
    let jsonString = response.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    // Try to find JSON in the response
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch);

        // Validate the response
        if (!parsed.exercises || parsed.exercises.length < minExercises) {
          throw new Error(
            `Expected ${minExercises}-${maxExercises} exercises, got ${parsed.exercises?.length || 0}`,
          );
        }

        if (parsed.exercises.length > maxExercises) {
          console.warn(
            `Too many exercises (${parsed.exercises.length}), trimming to ${maxExercises}`,
          );
          parsed.exercises = parsed.exercises.slice(0, maxExercises);
        }

        return parsed;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Attempted to parse:", jsonMatch);
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    throw new Error("Invalid response format - no JSON found");
  }
}

export const keywordsAI = new KeywordsAIService();
