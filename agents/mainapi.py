from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os
import sys
from datetime import datetime, date
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.recovery import compute_recovery
from agents.pattern import detect_patterns
from agents.coach import generate_coaching, generate_workout_plan, generate_experiment

app = FastAPI(title="Recovery Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ SCHEMAS (matching Supabase exactly) ============

class DailyLog(BaseModel):
    user_id: str
    date: str
    hrv: float
    rhr: float
    sleep_hrs: float
    workout_type: Optional[str] = None
    total_sets: Optional[int] = None
    water_oz: Optional[int] = None
    protein_g: Optional[int] = None
    last_meal_hour: Optional[int] = None

class UserCreate(BaseModel):
    bodyweight_lbs: int

class Workout(BaseModel):
    user_id: str
    name: str
    exercises: List[dict]
    duration: Optional[float] = None
    total_volume: Optional[float] = None
    total_sets: Optional[int] = None
    notes: Optional[str] = None
    is_template: bool = False
    ai_generated: bool = False
    status: str = "completed"

class WorkoutTemplate(BaseModel):
    user_id: str
    name: str
    description: Optional[str] = None
    exercises: List[dict]
    is_ai_generated: bool = False

class Experiment(BaseModel):
    user_id: str
    hypothesis: str
    intervention: str
    start_date: str
    end_date: str
    status: str = "active"
    result: Optional[str] = None

class Task(BaseModel):
    name: str
    user_id: str

# ============ ROOT ============

@app.get("/")
def root():
    return {"status": "Recovery Agent API running"}

# ============ USERS ============

@app.post("/api/users")
def create_user(user: UserCreate):
    result = supabase.table("users_kt").insert({
        "bodyweight_lbs": user.bodyweight_lbs
    }).execute()
    return {"success": True, "data": result.data}

@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    result = supabase.table("users_kt").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]

# ============ DAILY LOGS ============

@app.post("/api/daily_logs")
def create_daily_log(log: DailyLog):
    data = log.dict()
    result = supabase.table("daily_logs").insert(data).execute()
    return {"success": True, "data": result.data}

@app.post("/api/daily_logs/bulk")
def bulk_create_logs(logs: List[DailyLog]):
    data = [log.dict() for log in logs]
    result = supabase.table("daily_logs").insert(data).execute()
    return {"success": True, "count": len(result.data)}

@app.get("/api/daily_logs/{user_id}")
def get_daily_logs(user_id: str, limit: int = 30):
    result = supabase.table("daily_logs").select("*").eq("user_id", user_id).order("date", desc=True).limit(limit).execute()
    return {"user_id": user_id, "logs": result.data}

# ============ BASELINES ============

@app.get("/api/baselines/{user_id}")
def get_baseline(user_id: str):
    result = supabase.table("baselines").select("*").eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No baseline found")
    return result.data[0]

@app.post("/api/baselines/{user_id}/compute")
def compute_baseline(user_id: str):
    """Compute and save baseline from daily logs."""
    logs = supabase.table("daily_logs").select("*").eq("user_id", user_id).order("date", desc=True).limit(14).execute()
    
    if not logs.data or len(logs.data) < 7:
        raise HTTPException(status_code=400, detail="Need at least 7 days of data")
    
    df = pd.DataFrame(logs.data)
    avg_hrv = df['hrv'].median()
    avg_rhr = df['rhr'].median()
    avg_sleep = df['sleep_hrs'].median()
    
    # Upsert baseline
    supabase.table("baselines").upsert({
        "user_id": user_id,
        "avg_hrv": avg_hrv,
        "avg_rhr": avg_rhr,
        "avg_sleep": avg_sleep
    }, on_conflict="user_id").execute()
    
    return {"avg_hrv": avg_hrv, "avg_rhr": avg_rhr, "avg_sleep": avg_sleep}

# ============ RECOVERY ============

@app.get("/api/recovery/{user_id}")
def get_recovery(user_id: str):
    """Compute recovery state from Supabase daily_logs."""
    result = supabase.table("daily_logs").select("*").eq("user_id", user_id).order("date", desc=True).limit(30).execute()
    
    if not result.data or len(result.data) < 7:
        raise HTTPException(status_code=400, detail="Need at least 7 days of data")
    
    df = pd.DataFrame(result.data)
    # Rename to match recovery.py expectations
    df = df.rename(columns={'hrv': 'hrv', 'sleep_hrs': 'sleep_hours'})
    df = df.sort_values('date')
    
    recovery = compute_recovery(df)
    return recovery

# ============ PATTERNS ============

@app.get("/api/patterns/{user_id}")
def get_patterns(user_id: str):
    """Detect patterns from Supabase daily_logs."""
    result = supabase.table("daily_logs").select("*").eq("user_id", user_id).order("date", desc=True).limit(60).execute()
    
    if not result.data or len(result.data) < 14:
        raise HTTPException(status_code=400, detail="Need at least 14 days of data")
    
    df = pd.DataFrame(result.data)
    # Rename columns to match pattern.py expectations
    df = df.rename(columns={
        'hrv': 'hrv_rmssd_ms',
        'sleep_hrs': 'sleep_duration_hours',
        'rhr': 'resting_hr_bpm'
    })
    
    patterns = detect_patterns(df)
    return {"user_id": user_id, "patterns": patterns}

# ============ COACHING (LLM via Keywords AI) ============

@app.get("/api/coaching/{user_id}")
def get_coaching(user_id: str):
    """Get AI coaching based on recovery + patterns."""
    recovery = get_recovery(user_id)
    patterns_result = get_patterns(user_id)
    patterns = patterns_result['patterns']
    
    coaching = generate_coaching(recovery, patterns)
    
    return {
        "user_id": user_id,
        "recovery": recovery,
        "patterns": patterns[:3],
        "coaching": coaching
    }

@app.post("/api/workout/generate/{user_id}")
def generate_workout_endpoint(user_id: str, goals: List[str] = ["general fitness"]):
    """Generate AI workout based on recovery."""
    recovery = get_recovery(user_id)
    workout = generate_workout_plan(recovery, goals)
    
    # Save to workouts table
    if "error" not in workout:
        workout_data = {
            "id": str(int(datetime.now().timestamp() * 1000)),
            "user_id": user_id,
            "name": f"AI Workout - {datetime.now().strftime('%Y-%m-%d')}",
            "date": datetime.now().isoformat(),
            "exercises": workout.get("exercises", []),
            "ai_generated": True,
            "status": "suggested"
        }
        supabase.table("workouts").insert(workout_data).execute()
    
    return workout

# ============ EXPERIMENTS ============

@app.post("/api/experiments")
def create_experiment(exp: Experiment):
    data = exp.dict()
    result = supabase.table("experiments").insert(data).execute()
    return {"success": True, "data": result.data}

@app.get("/api/experiments/{user_id}")
def get_experiments(user_id: str):
    result = supabase.table("experiments").select("*").eq("user_id", user_id).execute()
    return {"experiments": result.data}

@app.post("/api/experiments/suggest/{user_id}")
def suggest_experiment(user_id: str):
    """AI suggests experiment based on patterns."""
    patterns_result = get_patterns(user_id)
    patterns = patterns_result['patterns']
    
    experiment = generate_experiment(patterns)
    return experiment

@app.put("/api/experiments/{experiment_id}/complete")
def complete_experiment(experiment_id: str, result: str):
    supabase.table("experiments").update({
        "status": "completed",
        "result": result
    }).eq("id", experiment_id).execute()
    return {"success": True}

# ============ WORKOUTS ============

@app.post("/api/workouts")
def create_workout(workout: Workout):
    data = workout.dict()
    data["id"] = str(int(datetime.now().timestamp() * 1000))
    data["date"] = datetime.now().isoformat()
    data["created_at"] = datetime.now().isoformat()
    data["updated_at"] = datetime.now().isoformat()
    result = supabase.table("workouts").insert(data).execute()
    return {"success": True, "data": result.data}

@app.get("/api/workouts/{user_id}")
def get_workouts(user_id: str, limit: int = 20):
    result = supabase.table("workouts").select("*").eq("user_id", user_id).order("date", desc=True).limit(limit).execute()
    return {"workouts": result.data}

@app.put("/api/workouts/{workout_id}")
def update_workout(workout_id: str, updates: dict):
    updates["updated_at"] = datetime.now().isoformat()
    supabase.table("workouts").update(updates).eq("id", workout_id).execute()
    return {"success": True}

# ============ WORKOUT TEMPLATES ============

@app.post("/api/workout_templates")
def create_template(template: WorkoutTemplate):
    data = template.dict()
    data["id"] = str(int(datetime.now().timestamp() * 1000))
    data["created_at"] = datetime.now().isoformat()
    data["updated_at"] = datetime.now().isoformat()
    result = supabase.table("workout_templates").insert(data).execute()
    return {"success": True, "data": result.data}

@app.get("/api/workout_templates/{user_id}")
def get_templates(user_id: str):
    result = supabase.table("workout_templates").select("*").eq("user_id", user_id).execute()
    return {"templates": result.data}

# ============ TASKS ============

@app.post("/api/tasks")
def create_task(task: Task):
    result = supabase.table("tasks").insert(task.dict()).execute()
    return {"success": True, "data": result.data}

@app.get("/api/tasks/{user_id}")
def get_tasks(user_id: str):
    result = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
    return {"tasks": result.data}

# ============ DEMO (uses local CSV) ============

@app.get("/api/demo")
def demo():
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "wearables_health_6mo_daily.csv")
    df = pd.read_csv(csv_path)
    user_df = df[df['user_id'] == 'U0001'].copy()
    
    recovery_df = user_df.rename(columns={
        'hrv_rmssd_ms': 'hrv',
        'sleep_duration_hours': 'sleep_hours'
    })[['date', 'hrv', 'sleep_hours']].copy()
    
    recovery = compute_recovery(recovery_df)
    patterns = detect_patterns(user_df)
    
    return {"recovery": recovery, "patterns": patterns[:3]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)