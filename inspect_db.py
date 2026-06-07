import os

file_path = r"d:\Studlyf_v2\frontend\pages\institution-dashboard\EventDetails.tsx"
queries = ["notified", "notif", "badge", "Approved &", "APPROVED_NOTIFIED"]

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for query in queries:
    print(f"--- Search results for: '{query}' ---")
    for i, line in enumerate(lines):
        if query.lower() in line.lower():
            print(f"{i+1}: {line.strip()}")
