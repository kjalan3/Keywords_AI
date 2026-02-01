from utils.data_adapter import load_wearables_csv
from agents.recovery import compute_recovery

# Load wearable data
df = load_wearables_csv("wearables_health_6mo_daily.csv")

# Compute recovery status
result = compute_recovery(df)

print("\n=== RECOVERY RESULT ===")
for k, v in result.items():
    print(f"{k}: {v}")
