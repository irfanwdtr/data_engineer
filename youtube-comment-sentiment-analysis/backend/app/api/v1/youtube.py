import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.services.cleaning import process_comments
from app.services.storage import save_raw_comments
from app.services.sentiment import (
    analyze_comments,
    get_sentiment_results
)
from pydantic import BaseModel, Field


# Load API Key
env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(env_path)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

router = APIRouter(
    prefix="/youtube",
    tags=["YouTube"]
)

# -------------------------------------------------------------
# PERFORMANCE OPTIMIZATIONS: SINGLETON CLIENT & IN-MEMORY CACHE
# -------------------------------------------------------------
_youtube_client = None

def get_youtube_client():
    """
    Singleton pattern for YouTube API Client.
    Menggunakan satu instance discovery client untuk menghemat CPU dan RAM.
    """
    global _youtube_client
    if not YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="YouTube API Key belum dikonfigurasi."
        )
    if _youtube_client is None:
        _youtube_client = build(
            "youtube",
            "v3",
            developerKey=YOUTUBE_API_KEY,
            cache_discovery=False
        )
    return _youtube_client


# TTL Cache for YouTube Search (eliminates redundant API quota consumption)
_search_cache = {}
SEARCH_CACHE_TTL = 300  # 5 minutes TTL

# Mtime-validated Cache for /dataset endpoint (eliminates repetitive multi-file JSON parsing)
_dataset_cache = {
    "last_mtime": 0.0,
    "last_file_count": 0,
    "cached_response": None
}

RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw" / "comments"
SENTIMENT_DIR = Path(__file__).resolve().parents[3] / "data" / "processed" / "sentiment"


# SEARCH YOUTUBE VIDEOS
@router.get("/search")
def search_videos(
    keyword: str = Query(..., min_length=2),
    max_results: int = Query(default=10, ge=1, le=50)
):
    clean_keyword = keyword.strip()
    cache_key = (clean_keyword.lower(), max_results)

    # 1. Fast TTL In-Memory Cache hit
    if cache_key in _search_cache:
        cached_entry = _search_cache[cache_key]
        if time.time() - cached_entry["timestamp"] < SEARCH_CACHE_TTL:
            return cached_entry["data"]

    try:
        youtube = get_youtube_client()

        response = youtube.search().list(
            part="snippet",
            q=clean_keyword,
            type="video",
            maxResults=max_results,
            order="relevance"
        ).execute()

        videos = []

        for item in response.get("items", []):
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue

            snippet = item.get("snippet", {})
            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = (
                thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
                or thumbnails.get("default", {}).get("url")
                or ""
            )

            videos.append({
                "video_id": video_id,
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
                "channel_title": snippet.get("channelTitle", ""),
                "published_at": snippet.get("publishedAt", ""),
                "thumbnail": thumbnail_url
            })

        result = {
            "status": "success",
            "keyword": clean_keyword,
            "total_results": len(videos),
            "videos": videos
        }

        # Save to memory cache
        _search_cache[cache_key] = {
            "timestamp": time.time(),
            "data": result
        }

        return result

    except HttpError as error:
        raise HTTPException(
            status_code=502,
            detail=f"YouTube API error: {error.reason}"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Search error: {str(error)}"
        )


# GET YOUTUBE COMMENTS + SAVE RAW DATA
@router.get("/comments")
def get_video_comments(
    video_id: str = Query(..., min_length=1),
    max_results: int = Query(default=100, ge=1, le=100),
    force: bool = Query(default=False)
):
    # 1. Fast Cache check: jika komentar raw sudah pernah diambil dan force=False, gunakan file lokal
    raw_file = RAW_DIR / f"{video_id}.json"
    if not force and raw_file.exists():
        try:
            with open(raw_file, "r", encoding="utf-8") as f:
                saved = json.load(f)
                return {
                    "status": "success",
                    "video_id": video_id,
                    "total_comments": saved.get("total_comments", len(saved.get("comments", []))),
                    "storage": {
                        "file_path": str(raw_file),
                        "total_comments": saved.get("total_comments", len(saved.get("comments", [])))
                    },
                    "comments": saved.get("comments", [])
                }
        except Exception:
            pass

    try:
        youtube = get_youtube_client()

        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_results,
            order="relevance",
            textFormat="plainText"
        ).execute()

        comments = []

        for item in response.get("items", []):
            comment_data = item["snippet"]["topLevelComment"]
            comment = comment_data["snippet"]

            comments.append({
                "comment_id": comment_data["id"],
                "video_id": video_id,
                "author": comment["authorDisplayName"],
                "text": comment["textDisplay"],
                "published_at": comment["publishedAt"],
                "like_count": comment["likeCount"]
            })

        # Save comments to raw JSON
        storage_result = save_raw_comments(video_id, comments)

        return {
            "status": "success",
            "video_id": video_id,
            "total_comments": len(comments),
            "storage": storage_result,
            "comments": comments
        }

    except HttpError as error:
        raise HTTPException(
            status_code=502,
            detail=f"YouTube API error: {error.reason}"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Comments error: {str(error)}"
        )


@router.post("/process")
def process_video_comments(
    video_id: str = Query(..., min_length=1),
    force: bool = Query(default=False)
):
    try:
        result = process_comments(video_id, force=force)

        return {
            "status": "success",
            "message": "Comment cleaning completed successfully.",
            "data": result
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ANALYZE COMMENT SENTIMENT
@router.post("/sentiment")
def analyze_video_sentiment(
    video_id: str = Query(..., min_length=1),
    force: bool = Query(default=False)
):
    try:
        result = analyze_comments(video_id, force=force)

        return {
            "status": "success",
            "message": "Sentiment analysis completed successfully.",
            "data": result
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# GET SENTIMENT RESULTS
@router.get("/sentiment/{video_id}")
def get_video_sentiment(video_id: str):
    try:
        result = get_sentiment_results(video_id)

        return {
            "status": "success",
            "data": result
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# GET ALL PROCESSED SENTIMENT DATASET (FAST API FOR DASHBOARD WITH MTIME CACHING)
@router.get("/dataset")
def get_all_dataset():
    if not SENTIMENT_DIR.exists():
        return {
            "status": "success",
            "total_videos": 0,
            "total_comments": 0,
            "summary": {"positive": 0, "negative": 0, "neutral": 0},
            "videos": []
        }

    # Check latest mtime and file count to validate cache
    try:
        files = list(SENTIMENT_DIR.glob("*.json"))
        current_file_count = len(files)
        current_mtime = max((f.stat().st_mtime for f in files), default=0.0)
    except Exception:
        files = []
        current_file_count = 0
        current_mtime = 0.0

    if (
        _dataset_cache["cached_response"] is not None
        and _dataset_cache["last_mtime"] == current_mtime
        and _dataset_cache["last_file_count"] == current_file_count
    ):
        return _dataset_cache["cached_response"]

    videos = []
    total_comments = 0
    total_summary = {"positive": 0, "negative": 0, "neutral": 0}

    for json_file in sorted(files):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                vid = data.get("video_id", json_file.stem)
                smry = data.get("summary", {"positive": 0, "negative": 0, "neutral": 0})
                cnt = data.get("total_comments", len(data.get("comments", [])))
                total_comments += cnt
                total_summary["positive"] += smry.get("positive", 0)
                total_summary["negative"] += smry.get("negative", 0)
                total_summary["neutral"] += smry.get("neutral", 0)
                videos.append({
                    "video_id": vid,
                    "total_comments": cnt,
                    "summary": smry
                })
        except Exception:
            continue

    response_data = {
        "status": "success",
        "total_videos": len(videos),
        "total_comments": total_comments,
        "summary": total_summary,
        "videos": videos
    }

    _dataset_cache["last_mtime"] = current_mtime
    _dataset_cache["last_file_count"] = current_file_count
    _dataset_cache["cached_response"] = response_data

    return response_data


# REQUEST MODEL FOR AUTOMATIC ANALYSIS
class AnalyzeRequest(BaseModel):
    keyword: str = Field(..., min_length=2)
    max_videos: int = Field(default=5, ge=1, le=5)
    comments_per_video: int = Field(default=100, ge=1, le=100)
    force: bool = Field(default=False)


# AUTOMATIC YOUTUBE ANALYSIS PIPELINE
@router.post("/analyze")
def analyze_keyword(request: AnalyzeRequest):
    try:
        youtube = get_youtube_client()

        # STEP 1: Search YouTube videos
        search_response = youtube.search().list(
            part="snippet",
            q=request.keyword.strip(),
            type="video",
            maxResults=request.max_videos,
            order="relevance"
        ).execute()

        videos = search_response.get("items", [])

        if not videos:
            raise HTTPException(
                status_code=404,
                detail="Tidak ada video ditemukan."
            )

        results = []
        failed_videos = []

        total_comments = 0
        total_summary = {
            "positive": 0,
            "negative": 0,
            "neutral": 0
        }

        # STEP 2-5: Extract, clean, and analyze each video
        for item in videos:
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue

            snippet = item.get("snippet", {})
            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = (
                thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
                or thumbnails.get("default", {}).get("url")
                or ""
            )

            video_info = {
                "video_id": video_id,
                "title": snippet.get("title", ""),
                "channel_title": snippet.get("channelTitle", ""),
                "thumbnail": thumbnail_url
            }

            try:
                # Extract comments (or use disk cache if already extracted and not force)
                raw_file = RAW_DIR / f"{video_id}.json"
                if not request.force and raw_file.exists():
                    with open(raw_file, "r", encoding="utf-8") as f:
                        raw_data = json.load(f)
                        comments = raw_data.get("comments", [])
                else:
                    comment_response = youtube.commentThreads().list(
                        part="snippet",
                        videoId=video_id,
                        maxResults=request.comments_per_video,
                        order="relevance",
                        textFormat="plainText"
                    ).execute()

                    comments = []

                    for comment_item in comment_response.get("items", []):
                        comment_data = comment_item["snippet"]["topLevelComment"]
                        comment = comment_data["snippet"]

                        comments.append({
                            "comment_id": comment_data["id"],
                            "video_id": video_id,
                            "author": comment["authorDisplayName"],
                            "text": comment["textDisplay"],
                            "published_at": comment["publishedAt"],
                            "like_count": comment["likeCount"]
                        })

                    # Save raw comments
                    save_raw_comments(video_id, comments)

                # Clean comments (fast cached if already processed)
                cleaning_result = process_comments(video_id, force=request.force)

                # Analyze sentiment (fast length-bucketed INT8 batch inference or disk cache)
                sentiment_result = analyze_comments(video_id, force=request.force)

                # Aggregate sentiment
                total_comments += sentiment_result["total_comments"]

                for sentiment, count in sentiment_result["summary"].items():
                    total_summary[sentiment] += count

                results.append({
                    **video_info,
                    "total_comments": sentiment_result["total_comments"],
                    "cleaning": cleaning_result,
                    "sentiment": sentiment_result["summary"]
                })

            except HttpError as error:
                failed_videos.append({
                    **video_info,
                    "error": str(error.reason)
                })

            except Exception as error:
                failed_videos.append({
                    **video_info,
                    "error": str(error)
                })

        return {
            "status": "success",
            "keyword": request.keyword,
            "total_videos_found": len(videos),
            "total_videos_analyzed": len(results),
            "total_comments_analyzed": total_comments,
            "summary": total_summary,
            "videos": results,
            "failed_videos": failed_videos
        }

    except HttpError as error:
        raise HTTPException(
            status_code=502,
            detail=f"YouTube API error: {error.reason}"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Analyze error: {str(error)}"
        )
