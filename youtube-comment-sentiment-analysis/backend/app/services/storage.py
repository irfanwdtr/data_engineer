import json
from pathlib import Path
from datetime import datetime, timezone


# Lokasi folder penyimpanan raw comments
BASE_DIR = Path(__file__).resolve().parents[2]
RAW_COMMENTS_DIR = BASE_DIR / "data" / "raw" / "comments"


def save_raw_comments(video_id: str, comments: list):
    """
    Menyimpan komentar YouTube ke file JSON.
    Satu video memiliki satu file JSON.
    Menggunakan indent=2 untuk efisiensi serialisasi dan ukuran file.
    """

    RAW_COMMENTS_DIR.mkdir(parents=True, exist_ok=True)

    file_path = RAW_COMMENTS_DIR / f"{video_id}.json"

    data = {
        "video_id": video_id,
        "total_comments": len(comments),
        "extracted_at": datetime.now(timezone.utc).isoformat(),
        "comments": comments
    }

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

    return {
        "file_path": str(file_path),
        "total_comments": len(comments)
    }
