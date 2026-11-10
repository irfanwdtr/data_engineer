/**
 * API Client Layer for YouTube Comment Sentiment Analysis
 *
 * Communicates with FastAPI backend through Next.js Rewrites Gateway:
 * Base URL: /api/backend/api/v1 -> proxies to http://localhost:8000/api/v1
 */

import {
  AdaptedAnalyzeResult,
  AdaptedVideoSentimentResult,
  CommentItem,
  RawBackendAnalyzeRequest,
  RawBackendAnalyzeResponse,
  RawBackendComment,
  RawBackendSearchResponse,
  RawBackendSearchVideo,
  RawBackendSentimentResponse,
  SentimentCategory,
  VideoItem,
} from './types';

export const API_BASE_URL = '/api/backend/api/v1';

/**
 * Custom Error Class for API Client
 */
export class ApiClientError extends Error {
  public statusCode?: number;
  public details?: unknown;
  public isNetworkError: boolean;

  constructor(
    message: string,
    options?: { statusCode?: number; details?: unknown; isNetworkError?: boolean }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = options?.statusCode;
    this.details = options?.details;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

/**
 * Helper to normalize backend sentiment label to frontend standard
 * 'positif' | 'positive' -> 'positive'
 * 'negatif' | 'negative' -> 'negative'
 * 'netral' | 'neutral' -> 'neutral'
 */
export function normalizeSentiment(rawSentiment: string): SentimentCategory {
  const normalized = (rawSentiment || '').trim().toLowerCase();
  if (normalized === 'positif' || normalized === 'positive') {
    return 'positive';
  }
  if (normalized === 'negatif' || normalized === 'negative') {
    return 'negative';
  }
  return 'neutral';
}

/**
 * Adapter: Convert raw backend search video (snake_case) to frontend VideoItem (camelCase)
 */
export function adaptSearchVideo(raw: RawBackendSearchVideo): VideoItem {
  return {
    id: raw.video_id,
    title: raw.title,
    channelTitle: raw.channel_title,
    publishedAt: raw.published_at,
    viewCount: 0,
    commentCount: 0,
    thumbnailUrl: raw.thumbnail,
    sentimentSummary: {
      positive: 0,
      negative: 0,
      neutral: 0,
    },
  };
}

/**
 * Adapter: Convert raw backend comment (snake_case) to frontend CommentItem (camelCase)
 */
export function adaptComment(raw: RawBackendComment, videoTitle?: string): CommentItem {
  return {
    id: raw.comment_id,
    videoId: raw.video_id,
    videoTitle: videoTitle || '',
    author: raw.author,
    comment: raw.text,
    publishedDate: raw.published_at,
    likeCount: raw.like_count ?? 0,
    sentiment: normalizeSentiment(raw.sentiment),
    confidenceScore: raw.confidence ?? 0,
  };
}

/**
 * In-memory client cache for fast responsiveness and reduced network load
 */
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * Low-level request helper with comprehensive error handling and caching
 */
async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase();
  const url = `${API_BASE_URL}${endpoint}`;

  // Check in-memory cache for GET requests
  if (method === 'GET') {
    const cached = apiCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Accept': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new ApiClientError(
      `Tidak dapat terhubung ke server backend FastAPI (${errorMsg}). Pastikan backend aktif di port 8000.`,
      { isNetworkError: true, details: error }
    );
  }

  // Handle HTTP error responses (4xx, 5xx)
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    let parsedBody: unknown = null;

    try {
      const textBody = await response.text();
      try {
        parsedBody = JSON.parse(textBody);
        if (parsedBody && typeof parsedBody === 'object' && 'detail' in parsedBody) {
          const detail = (parsedBody as { detail: unknown }).detail;
          errorDetail = typeof detail === 'string' ? detail : JSON.stringify(detail);
        }
      } catch {
        if (textBody) errorDetail = textBody;
      }
    } catch {
      // ignore reading error
    }

    if (response.status === 500 && errorDetail.trim().toLowerCase() === 'internal server error') {
      errorDetail =
        'Backend FastAPI di port 8000 tidak merespons atau sedang offline. Pastikan uvicorn berjalan.';
    }

    throw new ApiClientError(errorDetail, {
      statusCode: response.status,
      details: parsedBody,
    });
  }

  // Parse JSON response
  try {
    const data = (await response.json()) as T;
    if (method === 'GET') {
      apiCache.set(endpoint, { timestamp: Date.now(), data });
    } else {
      // Invalidate cache on mutations
      apiCache.clear();
    }
    return data;
  } catch (parseError: unknown) {
    throw new ApiClientError(
      'Format response dari backend FastAPI tidak valid (bukan JSON yang sesuai).',
      { details: parseError }
    );
  }
}

/**
 * Core API Client Functions
 */

/**
 * 1. Search YouTube videos by keyword
 * Endpoint: GET /api/v1/youtube/search?keyword=...&max_results=...
 */
export async function searchYouTubeVideos(
  keyword: string,
  maxResults: number = 10
): Promise<{
  keyword: string;
  totalResults: number;
  videos: VideoItem[];
  raw: RawBackendSearchResponse;
}> {
  if (!keyword || keyword.trim().length < 2) {
    throw new ApiClientError('Keyword pencarian minimal 2 karakter.');
  }

  const query = new URLSearchParams({
    keyword: keyword.trim(),
    max_results: String(maxResults),
  }).toString();

  const raw = await request<RawBackendSearchResponse>(`/youtube/search?${query}`, {
    method: 'GET',
  });

  const videos = (raw.videos || []).map(adaptSearchVideo);

  return {
    keyword: raw.keyword,
    totalResults: raw.total_results,
    videos,
    raw,
  };
}

/**
 * 2. Get saved sentiment analysis results for a specific video
 * Endpoint: GET /api/v1/youtube/sentiment/{video_id}
 */
export async function getVideoSentiment(
  videoId: string,
  videoTitle?: string
): Promise<AdaptedVideoSentimentResult> {
  if (!videoId || videoId.trim().length === 0) {
    throw new ApiClientError('Video ID tidak boleh kosong.');
  }

  const raw = await request<RawBackendSentimentResponse>(
    `/youtube/sentiment/${encodeURIComponent(videoId.trim())}`,
    {
      method: 'GET',
    }
  );

  const data = raw.data;
  const comments = (data.comments || []).map((c) => adaptComment(c, videoTitle));

  return {
    videoId: data.video_id,
    totalComments: data.total_comments,
    summary: data.summary,
    comments,
  };
}

/**
 * 2a. Run analysis on a single video (fetches existing processed sentiment or triggers pipeline)
 */
export async function analyzeSingleVideo(
  video: VideoItem
): Promise<AdaptedVideoSentimentResult> {
  if (!video.id) {
    throw new ApiClientError('ID video tidak valid.');
  }

  try {
    // 1. Check if sentiment is already pre-computed
    return await getVideoSentiment(video.id, video.title);
  } catch {
    // 2. If not pre-computed, execute comment extraction, cleaning & sentiment steps
    await request<unknown>(
      `/youtube/comments?video_id=${encodeURIComponent(video.id)}&max_results=100`,
      { method: 'GET' }
    );
    await request<unknown>(
      `/youtube/process?video_id=${encodeURIComponent(video.id)}`,
      { method: 'POST' }
    );
    await request<unknown>(
      `/youtube/sentiment?video_id=${encodeURIComponent(video.id)}`,
      { method: 'POST' }
    );
    return await getVideoSentiment(video.id, video.title);
  }
}

/**
 * 2b. Get all analyzed dataset overview from backend
 * Endpoint: GET /api/v1/youtube/dataset
 */
export async function getBackendDataset(): Promise<{
  totalVideos: number;
  totalComments: number;
  summary: { positive: number; negative: number; neutral: number };
  videos: { video_id: string; total_comments: number; summary: { positive: number; negative: number; neutral: number } }[];
}> {
  const raw = await request<{
    status: string;
    total_videos: number;
    total_comments: number;
    summary: { positive: number; negative: number; neutral: number };
    videos: { video_id: string; total_comments: number; summary: { positive: number; negative: number; neutral: number } }[];
  }>('/youtube/dataset');

  return {
    totalVideos: raw.total_videos,
    totalComments: raw.total_comments,
    summary: raw.summary,
    videos: raw.videos,
  };
}

/**
 * 3. Run automatic YouTube sentiment analysis pipeline
 * Endpoint: POST /api/v1/youtube/analyze
 */
export async function analyzeYouTubeKeyword(
  params: RawBackendAnalyzeRequest
): Promise<AdaptedAnalyzeResult> {
  if (!params.keyword || params.keyword.trim().length < 2) {
    throw new ApiClientError('Keyword analisis minimal 2 karakter.');
  }

  const payload: RawBackendAnalyzeRequest = {
    keyword: params.keyword.trim(),
    max_videos: params.max_videos ?? 5,
    comments_per_video: params.comments_per_video ?? 100,
  };

  const raw = await request<RawBackendAnalyzeResponse>('/youtube/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const totalAnalyzed = raw.total_comments_analyzed || 0;
  const posCount = raw.summary?.positive || 0;
  const negCount = raw.summary?.negative || 0;
  const neuCount = raw.summary?.neutral || 0;

  const positivePercentage = totalAnalyzed > 0 ? Math.round((posCount / totalAnalyzed) * 100) : 0;
  const negativePercentage = totalAnalyzed > 0 ? Math.round((negCount / totalAnalyzed) * 100) : 0;
  const neutralPercentage =
    totalAnalyzed > 0 ? Math.max(0, 100 - positivePercentage - negativePercentage) : 0;

  const videos: VideoItem[] = (raw.videos || []).map((v) => ({
    id: v.video_id,
    title: v.title,
    channelTitle: v.channel_title,
    publishedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    viewCount: 0,
    commentCount: v.total_comments,
    thumbnailUrl: v.thumbnail,
    sentimentSummary: {
      positive: v.sentiment?.positive || 0,
      negative: v.sentiment?.negative || 0,
      neutral: v.sentiment?.neutral || 0,
    },
  }));

  return {
    keyword: raw.keyword,
    totalVideosFound: raw.total_videos_found,
    totalVideosAnalyzed: raw.total_videos_analyzed,
    totalCommentsAnalyzed: raw.total_comments_analyzed,
    summary: {
      positive: posCount,
      negative: negCount,
      neutral: neuCount,
      positivePercentage,
      negativePercentage,
      neutralPercentage,
    },
    videos,
    failedVideos: raw.failed_videos || [],
  };
}

/**
 * Consolidated API Service export for backwards-compatibility
 */
export const apiService = {
  searchYouTubeVideos,
  getVideoSentiment,
  analyzeSingleVideo,
  analyzeYouTubeKeyword,

  // Backwards compatible method names
  searchVideos: async (keyword: string, maxResults: number = 10) => {
    const res = await searchYouTubeVideos(keyword, maxResults);
    return res.videos;
  },
  getSentiment: getVideoSentiment,
  analyzeKeyword: analyzeYouTubeKeyword,
};

export default apiService;
