import csv
import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "sentiment"
    / "rkLpVyRGCPw.json"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "evaluation"
    / "evaluation_sample.csv"
)

# Load sentiment results
with open(INPUT_FILE, "r", encoding="utf-8") as file:
    data = json.load(file)

comments = data["comments"]

# Select 20 random comments
random.seed(42)
sample_size = min(20, len(comments))
samples = random.sample(comments, sample_size)

# Export to CSV
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8-sig") as file:
    fieldnames = [
        "comment_id",
        "text",
        "predicted_sentiment",
        "confidence",
        "manual_sentiment"
    ]

    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()

    for comment in samples:
        writer.writerow({
            "comment_id": comment.get("comment_id", ""),
            "text": comment.get("text", ""),
            "predicted_sentiment": comment.get("sentiment", ""),
            "confidence": comment.get("confidence", ""),
            "manual_sentiment": ""
        })

print(f"Successfully exported {sample_size} comments.")
print(f"Output: {OUTPUT_FILE}")