import pandas as pd
import numpy as np

# Recovery Logic (HRV + Sleep, personal baseline)

def _compute_baseline(series: pd.Series, window: int = 14):
    """
    Robust personal baseline using median of last N days.
    """
    recent = series.tail(window)
    return recent.median()


def _compute_trend(series: pd.Series, window: int = 5):
    """
    Simple HRV trend:
    recent avg - previous avg
    """
    if len(series) < window * 2:
        return 0.0

    recent_avg = series.tail(window).mean()
    prev_avg = series.iloc[-2 * window:-window].mean()
    return recent_avg - prev_avg


def compute_recovery(df: pd.DataFrame):
    """
    Main recovery entry point.

    Required columns (already normalized):
    - date
    - hrv        (RMSSD, ms)
    - sleep_hours

    Returns:
    dict with recovery_state + metrics + reasons
    """

    df = df.sort_values("date").reset_index(drop=True)

    # Baselines
    baseline_hrv = _compute_baseline(df["hrv"])
    baseline_sleep = _compute_baseline(df["sleep_hours"])

    # Today values
    today = df.iloc[-1]
    today_hrv = today["hrv"]
    today_sleep = today["sleep_hours"]

    hrv_pct = (today_hrv / baseline_hrv) * 100
    hrv_trend = _compute_trend(df["hrv"])

    # Recovery classification
    if hrv_pct < 80 or today_sleep < 5.5:
        recovery_state = "LOW"

    elif hrv_pct >= 95 and today_sleep >= 7 and hrv_trend >= 0:
        recovery_state = "HIGH"

    else:
        recovery_state = "MODERATE"

    # Reasons (for UI / LLM)
    reasons = []

    if hrv_pct < 85:
        reasons.append(f"HRV is {hrv_pct:.0f}% of your personal baseline")

    if today_sleep < baseline_sleep - 1:
        reasons.append(
            f"Sleep duration ({today_sleep:.1f}h) is below your normal"
        )

    if hrv_trend < 0:
        reasons.append("HRV has been trending down over the last few days")

    if not reasons:
        reasons.append("HRV and sleep are within your normal range")

    return {
        "date": today["date"],
        "recovery_state": recovery_state,
        "today_hrv": round(today_hrv, 1),
        "baseline_hrv": round(baseline_hrv, 1),
        "hrv_pct_of_baseline": round(hrv_pct, 1),
        "sleep_hours": round(today_sleep, 1),
        "hrv_trend": round(hrv_trend, 2),
        "reasons": reasons
    }
