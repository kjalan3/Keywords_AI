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
  private async callAPI(messages: ChatMessage[], model = "groq/llama-3.3-70b-versatile") {
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
    heartRate: { value: number; startDate: string; endDate: string; }[];
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
    const prompt = `You are an expert personal trainer. Create a personalized workout plan based on the following information:

Recovery Status:
- Recovery Score: ${recoveryData.score}/100
- Status: ${recoveryData.status}
- Recommended Intensity: ${recoveryData.workoutIntensity}

User Preferences:
- Focus Area: ${userPreferences.focusArea || "Full Body"}
- Duration: ${userPreferences.duration || 45} minutes
- Equipment: ${userPreferences.equipment?.join(", ") || "Bodyweight, Dumbbells"}

Create a workout plan with 5-8 exercises. Provide your response in the following JSON format:
{
  "name": "<workout name>",
  "type": "<workout type>",
  "duration": <number in minutes>,
  "exercises": [
    {
      "name": "<exercise name>",
      "sets": <number>,
      "reps": "<reps or duration>",
      "notes": "<optional form tips>"
    }
  ],
  "reasoning": "<why this workout fits their recovery status>"
}`;

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are an expert personal trainer creating workout plans. Always respond with valid JSON only.",
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
}

export const keywordsAI = new KeywordsAIService();
