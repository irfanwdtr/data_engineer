import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]

RAW_DIR = BASE_DIR / "data" / "raw" / "comments"
PROCESSED_DIR = BASE_DIR / "data" / "processed" / "comments"

# Pre-compiled regular expressions for high-performance text processing on CPU
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")
HTML_PATTERN = re.compile(r"<[^>]+>")
WHITESPACE_PATTERN = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """
    Membersihkan teks komentar YouTube dengan regex terkompilasi.
    """
    if not text:
        return ""
    # Hapus URL
    text = URL_PATTERN.sub("", text)
    # Hapus HTML tags
    text = HTML_PATTERN.sub("", text)
    # Rapikan whitespace
    text = WHITESPACE_PATTERN.sub(" ", text)

    return text.strip()


def process_comments(video_id: str, force: bool = False):
    """
    Membaca raw comments, membersihkan,
    menghapus duplikasi, dan menyimpan hasilnya.
    Mendukung disk caching untuk menghindari re-cleaning komputasi berulang.
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    output_file = PROCESSED_DIR / f"{video_id}.json"

    # Fast disk cache check: hindari parsing ulang jika file processed sudah ada
    if not force and output_file.exists():
        try:
            with open(output_file, "r", encoding="utf-8") as file:
                cached = json.load(file)
                return {
                    "video_id": video_id,
                    "total_raw_comments": cached.get("total_raw_comments", 0),
                    "total_cleaned_comments": cached.get("total_cleaned_comments", len(cached.get("comments", []))),
                    "removed_comments": cached.get("removed_comments", 0),
                    "output_file": str(output_file)
                }
        except Exception:
            pass

    input_file = RAW_DIR / f"{video_id}.json"

    if not input_file.exists():
        raise FileNotFoundError(
            f"Raw data tidak ditemukan: {input_file}"
        )

    with open(input_file, "r", encoding="utf-8") as file:
        raw_data = json.load(file)

    raw_comments = raw_data.get("comments", [])
    total_raw = len(raw_comments)
    cleaned_comments = []
    seen_comments = set()

    for comment in raw_comments:
        original_text = comment.get("text", "")
        cleaned = clean_text(original_text)

        # Lewati komentar kosong
        if not cleaned:
            continue

        # Hilangkan duplikasi berdasarkan comment ID
        comment_id = comment.get("comment_id")
        if comment_id:
            if comment_id in seen_comments:
                continue
            seen_comments.add(comment_id)

        cleaned_comments.append({
            **comment,
            "text": cleaned
        })

    # Siapkan output
    processed_data = {
        "video_id": video_id,
        "total_raw_comments": total_raw,
        "total_cleaned_comments": len(cleaned_comments),
        "removed_comments": total_raw - len(cleaned_comments),
        "comments": cleaned_comments
    }

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(
            processed_data,
            file,
            ensure_ascii=False,
            indent=2
        )

    return {
        "video_id": video_id,
        "total_raw_comments": total_raw,
        "total_cleaned_comments": len(cleaned_comments),
        "removed_comments": total_raw - len(cleaned_comments),
        "output_file": str(output_file)
    }
