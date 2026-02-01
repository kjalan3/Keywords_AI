import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Keywords AI client
client = OpenAI(
    api_key=os.getenv("KEYWORDS_API_KEY"),
    base_url="https://api.keywordsai.co/api/"
)

def generate_coaching(recovery_data: dict, patterns: list, workout_history: list = None):
    """
    Takes recovery state + detected patterns → returns personalized coaching.
    Calls GPT-4o via Keywords AI for tracing.
    """
    
    # Build context for LLM
    patterns_text = "\n".join([
        f"- [{p['strength']}] {p['pattern']} → {p['action']}"
        for p in patterns[:5]
    ])
    
    workout_context = ""
    if workout_history:
        recent = workout_history[-3:]  # Last 3 workouts
        workout_context = f"\nRecent workouts: {recent}"
    
    prompt = f"""You are a recovery-focused fitness coach. Based on the user's data, give specific, actionable advice.

## User's Current State
- Recovery: {recovery_data['recovery_state']}
- Today's HRV: {recovery_data['today_hrv']}ms ({recovery_data['hrv_pct_of_baseline']:.0f}% of their baseline)
- Sleep: {recovery_data['sleep_hours']} hours
- HRV Trend: {recovery_data['hrv_trend']:+.1f}ms (last 5 days)
- Reasons: {', '.join(recovery_data['reasons'])}

## Detected Patterns (from their data)
{patterns_text}
{workout_context}

## Your Task
1. Explain their recovery state in plain language (2 sentences max)
2. Give TODAY's workout recommendation (intensity level + specific adjustments)
3. Give ONE specific habit change based on the strongest pattern
4. If they should skip training today, say so directly, it is important to have muscle growth and recovery via rest days

Keep it conversational, like a coach texting them. No generic advice — use their actual numbers."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a concise, data-driven fitness coach. Use the user's actual metrics in your response."},
            {"role": "user", "content": prompt}
        ],
        extra_body={
            "metadata": {
                "agent_step": "coaching",
                "recovery_state": recovery_data['recovery_state'],
                "hrv_pct": recovery_data['hrv_pct_of_baseline']
            }
        }
    )
    
    return {
        "coaching": response.choices[0].message.content,
        "recovery_state": recovery_data['recovery_state'],
        "top_pattern": patterns[0] if patterns else None
    }


def generate_workout_plan(recovery_data: dict, user_goals: list = None):
    """
    Generate a specific workout based on recovery state.
    """
    
    goals_text = ", ".join(user_goals) if user_goals else "general fitness"
    
    intensity_map = {
        "HIGH": "Push hard today — your body is ready for high intensity",
        "MODERATE": "Medium intensity — solid work but don't max out",
        "LOW": "Active recovery only — light movement, no heavy lifting"
    }
    
    prompt = f"""Generate a workout for someone with:
- Recovery state: {recovery_data['recovery_state']}
- HRV: {recovery_data['today_hrv']}ms ({recovery_data['hrv_pct_of_baseline']:.0f}% of baseline)
- Sleep: {recovery_data['sleep_hours']} hours
- Goals: {goals_text}

Guidance: {intensity_map[recovery_data['recovery_state']]}

Return a JSON object with:
{{
  "intensity": "low|medium|high",
  "explanation": "1-2 sentence reason based on their metrics",
  "exercises": [
    {{"name": "...", "sets": N, "reps": "...", "notes": "..."}}
  ],
  "estimated_duration_min": N,
  "warning": "optional — only if they should be careful"
}}

Only return valid JSON, no markdown."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a fitness AI that outputs only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        extra_body={
            "metadata": {
                "agent_step": "workout_generation",
                "recovery_state": recovery_data['recovery_state']
            }
        }
    )
    
    import json
    try:
        workout = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        workout = {"error": "Failed to parse workout", "raw": response.choices[0].message.content}
    
    return workout


def generate_experiment(patterns: list):
    """
    Based on detected patterns, propose an experiment to test.
    This is the N-of-1 experiment loop.
    """
    
    if not patterns or patterns[0].get('strength') == 'NONE':
        return {"experiment": None, "reason": "Not enough data to propose experiment"}
    
    top_pattern = patterns[0]
    
    prompt = f"""Based on this detected pattern from a user's health data:

Pattern: {top_pattern['pattern']}
Strength: {top_pattern['strength']}
Suggested action: {top_pattern['action']}

Design a simple 5-7 day experiment they can run to test if fixing this actually improves their recovery.

Return JSON:
{{
  "hypothesis": "If I [change], then my [metric] will [improve]",
  "intervention": "Specific behavior change",
  "duration_days": N,
  "what_to_track": ["metric1", "metric2"],
  "success_criteria": "How to know if it worked",
  "daily_reminder": "One sentence to show them each day"
}}

Only return valid JSON."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a health researcher designing N-of-1 experiments."},
            {"role": "user", "content": prompt}
        ],
        extra_body={
            "metadata": {
                "agent_step": "experiment_design",
                "pattern_strength": top_pattern['strength']
            }
        }
    )
    
    import json
    try:
        experiment = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        experiment = {"error": "Failed to parse", "raw": response.choices[0].message.content}
    
    return experiment


# ============ TEST ============
if __name__ == "__main__":
    # Mock data for testing
    recovery_data = {
        "date": "2025-11-10",
        "recovery_state": "MODERATE",
        "today_hrv": 36.0,
        "baseline_hrv": 42.2,
        "hrv_pct_of_baseline": 85.4,
        "sleep_hours": 6.3,
        "hrv_trend": -7.55,
        "reasons": ["HRV has been trending down over the last few days"]
    }
    
    patterns = [
        {"pattern": "High stress drops HRV by 27.5%", "strength": "STRONG", "action": "Add meditation or breathing exercises"},
        {"pattern": "Sleep <6.5h drops HRV by 16.0%", "strength": "STRONG", "action": "Get 7+ hours of sleep"},
        {"pattern": "High screen time adds 4min to fall asleep", "strength": "MODERATE", "action": "Reduce screens before bed"},
    ]
    
    print("=== COACHING ===\n")
    result = generate_coaching(recovery_data, patterns)
    print(result['coaching'])
    
    print("\n=== WORKOUT PLAN ===\n")
    workout = generate_workout_plan(recovery_data, ["build-strength", "gain-muscle"])
    print(workout)
    
    print("\n=== EXPERIMENT ===\n")
    experiment = generate_experiment(patterns)
    print(experiment)
# ```

