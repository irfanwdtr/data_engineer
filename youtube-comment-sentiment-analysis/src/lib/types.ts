export type SentimentCategory = 'positive' | 'negative' | 'neutral';

export interface CommentItem {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  authorAvatar?: string;
  comment: string;
  publishedDate: string;
  likeCount: number;
  sentiment: SentimentCategory;
  confidenceScore: number;
  topic?: string;
  keywords?: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  commentCount: number;
  thumbnailUrl: string;
  duration?: string;
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface AnalysisSession {
  id: string;
  keyword: string;
  analysisDate: string;
  videosCollected: number;
  commentsCollected: number;
  status: 'Completed' | 'Processing' | 'Failed';
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
  category?: string;
  positiveRatio: number;
}

export interface WordCloudItem {
  text: string;
  weight: number;
  sentiment: SentimentCategory;
}

export interface PainPointItem {
  id: string;
  title: string;
  description: string;
  mentions: number;
  severity: 'high' | 'medium' | 'low';
  category: string;
  sampleComments: string[];
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

// ==========================================
// FASTAPI BACKEND RAW SCHEMAS (snake_case)
// ==========================================

export type RawBackendSentiment = 'positif' | 'negatif' | 'netral' | 'positive' | 'negative' | 'neutral';

export interface RawBackendSearchVideo {
  video_id: string;
  title: string;
  description: string;
  channel_title: string;
  published_at: string;
  thumbnail: string;
}

export interface RawBackendSearchResponse {
  status: string;
  keyword: string;
  total_results: number;
  videos: RawBackendSearchVideo[];
}

export interface RawBackendComment {
  comment_id: string;
  video_id: string;
  author: string;
  text: string;
  published_at: string;
  like_count: number;
  sentiment: RawBackendSentiment;
  confidence: number;
}

export interface RawBackendSentimentSummary {
  positive: number;
  negative: number;
  neutral: number;
}

export interface RawBackendVideoSentimentData {
  video_id: string;
  total_comments: number;
  summary: RawBackendSentimentSummary;
  comments: RawBackendComment[];
}

export interface RawBackendSentimentResponse {
  status: string;
  data: RawBackendVideoSentimentData;
}

export interface RawBackendAnalyzeRequest {
  keyword: string;
  max_videos?: number;
  comments_per_video?: number;
}

export interface RawBackendAnalyzedVideoItem {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail: string;
  total_comments: number;
  cleaning?: Record<string, unknown>;
  sentiment: RawBackendSentimentSummary;
}

export interface RawBackendFailedVideoItem {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail: string;
  error: string;
}

export interface RawBackendAnalyzeResponse {
  status: string;
  keyword: string;
  total_videos_found: number;
  total_videos_analyzed: number;
  total_comments_analyzed: number;
  summary: RawBackendSentimentSummary;
  videos: RawBackendAnalyzedVideoItem[];
  failed_videos: RawBackendFailedVideoItem[];
}

// ==========================================
// ADAPTED SCHEMAS (camelCase for Frontend)
// ==========================================

export interface AdaptedAnalyzeResult {
  keyword: string;
  totalVideosFound: number;
  totalVideosAnalyzed: number;
  totalCommentsAnalyzed: number;
  summary: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  videos: VideoItem[];
  failedVideos: RawBackendFailedVideoItem[];
}

export interface AdaptedVideoSentimentResult {
  videoId: string;
  totalComments: number;
  summary: RawBackendSentimentSummary;
  comments: CommentItem[];
}
