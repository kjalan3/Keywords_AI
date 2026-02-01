import pandas as pd

def load_wearables_csv(path: str) -> pd.DataFrame:
    """
    Load wearable health CSV and normalize column names
    """
    df = pd.read_csv(path)

    # Normalize column names to lowercase
    df.columns = [c.lower() for c in df.columns]

    # Rename common variants → standard names
    rename_map = {
        "date": "date",
        "hrv": "hrv",
        "hrv_ms": "hrv",
        "sleep_hours": "sleep_hours",
        "sleep_duration": "sleep_hours"
    }

    for col in list(df.columns):
        if col in rename_map:
            df.rename(columns={col: rename_map[col]}, inplace=True)

    # Basic sanity check
    required = ["date", "hrv", "sleep_hours"]
    for col in required:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    return df
