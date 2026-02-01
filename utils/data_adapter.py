import pandas as pd

def load_wearables_csv(path: str) -> pd.DataFrame:
    """
    Adapter for:
    Health + Wearables + Stress/Sleep Tracking (synthetic)

    Required raw columns:
    - date
    - hrv_rmssd_ms
    - sleep_duration_hours
    """

    df = pd.read_csv(path)

    df = df.rename(columns={
        "hrv_rmssd_ms": "hrv",
        "sleep_duration_hours": "sleep_hours"
    })

    # Safety: convert minutes -> hours if needed
    if df["sleep_hours"].max() > 24:
        df["sleep_hours"] = df["sleep_hours"] / 60.0

    return df[["date", "hrv", "sleep_hours"]].dropna()
