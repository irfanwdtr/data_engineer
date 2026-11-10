'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AnalysisSession,
  AdaptedAnalyzeResult,
  CommentItem,
  KeywordFrequency,
  PainPointItem,
  SentimentTrendPoint,
  VideoItem,
  RawBackendSentimentSummary,
} from '@/lib/types';
import { extractPainPoints, extractTopKeywords } from '@/lib/topicExtractor';

export interface OverviewDataType {
  keyword: string;
  totalVideos: number;
  videosChange: string;
  totalComments: number;
  commentsChange: string;
  positivePct: number;
  positiveChange: string;
  positiveCount: number;
  negativePct: number;
  negativeChange: string;
  negativeCount: number;
  neutralPct: number;
  neutralChange: string;
  neutralCount: number;
  sampleRecordCount: number;
}

export interface SentimentDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface AppContextType {
  currentKeyword: string;
  setCurrentKeyword: (kw: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  overviewData: OverviewDataType;
  sentimentDistribution: SentimentDistributionItem[];
  trendData: SentimentTrendPoint[];
  topKeywords: KeywordFrequency[];
  historyList: AnalysisSession[];
  videos: VideoItem[];
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  analyzedVideos: VideoItem[];
  setAnalyzedVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  comments: CommentItem[];
  setComments: React.Dispatch<React.SetStateAction<CommentItem[]>>;
  painPoints: PainPointItem[];
  isAnalyzing: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  pipelineModalOpen: boolean;
  setPipelineModalOpen: (open: boolean) => void;
  pipelineStep: number;
  runAnalysisForKeyword: (keyword: string, showPipelineModal?: boolean) => Promise<void>;
  saveAnalysisResult: (result: AdaptedAnalyzeResult, newComments?: CommentItem[]) => void;
  aggregateVideoAnalysis: (
    video: VideoItem,
    newComments: CommentItem[],
    summary?: RawBackendSentimentSummary
  ) => void;
  resetSessionForKeyword: (newKeyword: string) => void;
  selectSession: (sessionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_KEYWORD = 'Review iPhone 17';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentKeyword, setCurrentKeyword] = useState<string>(INITIAL_KEYWORD);
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [historyList, setHistoryList] = useState<AnalysisSession[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [pipelineModalOpen, setPipelineModalOpen] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  // Search results list
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // Incremental aggregation state: only videos that the user clicked "Analyze Video Comments" on
  const [analyzedVideos, setAnalyzedVideos] = useState<VideoItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);

  const [overviewData, setOverviewData] = useState<OverviewDataType>({
    keyword: INITIAL_KEYWORD,
    totalVideos: 0,
    videosChange: '0',
    totalComments: 0,
    commentsChange: '0',
    positivePct: 0,
    positiveChange: '0%',
    positiveCount: 0,
    negativePct: 0,
    negativeChange: '0%',
    negativeCount: 0,
    neutralPct: 0,
    neutralChange: '0%',
    neutralCount: 0,
    sampleRecordCount: 0,
  });

  const [sentimentDistribution, setSentimentDistribution] = useState<SentimentDistributionItem[]>([
    { name: 'Positive', value: 0, percentage: 0, color: '#10b981' },
    { name: 'Negative', value: 0, percentage: 0, color: '#ef4444' },
    { name: 'Neutral', value: 0, percentage: 0, color: '#8590a5' },
  ]);

  const [trendData, setTrendData] = useState<SentimentTrendPoint[]>([]);
  const [topKeywords, setTopKeywords] = useState<KeywordFrequency[]>([]);
  const [painPoints, setPainPoints] = useState<PainPointItem[]>([]);

  // Restore session from sessionStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSession = sessionStorage.getItem('sentiment_active_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.currentKeyword) setCurrentKeyword(parsed.currentKeyword);
        if (Array.isArray(parsed.analyzedVideos)) setAnalyzedVideos(parsed.analyzedVideos);
        if (Array.isArray(parsed.comments) && parsed.comments.length > 0) {
          setComments(parsed.comments);
          // Recompute metrics
          const comms: CommentItem[] = parsed.comments;
          const total = comms.length;
          const pos = comms.filter((c) => c.sentiment === 'positive').length;
          const neg = comms.filter((c) => c.sentiment === 'negative').length;
          const neu = comms.filter((c) => c.sentiment === 'neutral').length;
          const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
          const negPct = total > 0 ? Math.round((neg / total) * 100) : 0;
          const neuPct = total > 0 ? Math.max(0, 100 - posPct - negPct) : 0;

          setOverviewData({
            keyword: parsed.currentKeyword || INITIAL_KEYWORD,
            totalVideos: parsed.analyzedVideos?.length || 0,
            videosChange: `+${parsed.analyzedVideos?.length || 0}`,
            totalComments: total,
            commentsChange: `+${total}`,
            positivePct: posPct,
            positiveChange: `${posPct}%`,
            positiveCount: pos,
            negativePct: negPct,
            negativeChange: `${negPct}%`,
            negativeCount: neg,
            neutralPct: neuPct,
            neutralChange: `${neuPct}%`,
            neutralCount: neu,
            sampleRecordCount: total,
          });

          setSentimentDistribution([
            { name: 'Positive', value: pos, percentage: posPct, color: '#10b981' },
            { name: 'Negative', value: neg, percentage: negPct, color: '#ef4444' },
            { name: 'Neutral', value: neu, percentage: neuPct, color: '#8590a5' },
          ]);

          setTopKeywords(extractTopKeywords(comms));
          setPainPoints(extractPainPoints(comms));
        }
      }
    } catch (e) {
      console.warn('Failed to restore sentiment session from storage:', e);
    }
  }, []);

  // Save to sessionStorage when aggregated state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(
        'sentiment_active_session',
        JSON.stringify({
          currentKeyword,
          analyzedVideos,
          comments,
        })
      );
    } catch {
      // ignore storage quota issues
    }
  }, [currentKeyword, analyzedVideos, comments]);

  /**
   * Reset the active analysis session when user changes search keyword
   */
  const resetSessionForKeyword = (newKeyword: string) => {
    const kw = newKeyword.trim();
    console.log('[AppContext] Resetting session for new keyword:', kw);
    setCurrentKeyword(kw);
    setAnalyzedVideos([]);
    setComments([]);
    setOverviewData({
      keyword: kw,
      totalVideos: 0,
      videosChange: '0',
      totalComments: 0,
      commentsChange: '0',
      positivePct: 0,
      positiveChange: '0%',
      positiveCount: 0,
      negativePct: 0,
      negativeChange: '0%',
      negativeCount: 0,
      neutralPct: 0,
      neutralChange: '0%',
      neutralCount: 0,
      sampleRecordCount: 0,
    });
    setSentimentDistribution([
      { name: 'Positive', value: 0, percentage: 0, color: '#10b981' },
      { name: 'Negative', value: 0, percentage: 0, color: '#ef4444' },
      { name: 'Neutral', value: 0, percentage: 0, color: '#8590a5' },
    ]);
    setTrendData([]);
    setTopKeywords([]);
    setPainPoints([]);

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('sentiment_active_session');
      } catch {
        // ignore
      }
    }
  };

  /**
   * Incrementally aggregate a newly analyzed video and its comments into the active session
   */
  const aggregateVideoAnalysis = (
    video: VideoItem,
    newComments: CommentItem[],
    summary?: RawBackendSentimentSummary
  ) => {
    console.log('[AppContext] Incrementally aggregating video:', video.title, 'with comments:', newComments.length);

    // Calculate individual video metrics
    const vidTotal = newComments.length;
    const vidPos = summary
      ? summary.positive
      : newComments.filter((c) => c.sentiment === 'positive').length;
    const vidNeg = summary
      ? summary.negative
      : newComments.filter((c) => c.sentiment === 'negative').length;
    const vidNeu = summary
      ? summary.neutral
      : newComments.filter((c) => c.sentiment === 'neutral').length;

    const vidPosPct = vidTotal > 0 ? Math.round((vidPos / vidTotal) * 100) : 0;
    const vidNegPct = vidTotal > 0 ? Math.round((vidNeg / vidTotal) * 100) : 0;
    const vidNeuPct = vidTotal > 0 ? Math.max(0, 100 - vidPosPct - vidNegPct) : 0;

    const updatedVideo: VideoItem = {
      ...video,
      commentCount: vidTotal > 0 ? vidTotal : video.commentCount,
      sentimentSummary: {
        positive: vidPosPct,
        negative: vidNegPct,
        neutral: vidNeuPct,
      },
    };

    // 2. Update search result item state
    setVideos((prevVideos) =>
      prevVideos.map((v) => (v.id === video.id ? updatedVideo : v))
    );

    // 3. Update analyzedVideos list (synchronous array construction)
    const existingIdx = analyzedVideos.findIndex((v) => v.id === video.id);
    const updatedAnalyzedVideos =
      existingIdx >= 0
        ? analyzedVideos.map((v, i) => (i === existingIdx ? updatedVideo : v))
        : [...analyzedVideos, updatedVideo];
    setAnalyzedVideos(updatedAnalyzedVideos);

    // 4. Update comments list (synchronous array construction)
    const filteredExistingComments = comments.filter((c) => c.videoId !== video.id);
    const allComments = [...filteredExistingComments, ...newComments];
    setComments(allComments);

    // 5. Combined calculations across all aggregated comments
    const combinedTotal = allComments.length;
    const combinedPos = allComments.filter((c) => c.sentiment === 'positive').length;
    const combinedNeg = allComments.filter((c) => c.sentiment === 'negative').length;
    const combinedNeu = allComments.filter((c) => c.sentiment === 'neutral').length;

    const posPct = combinedTotal > 0 ? Math.round((combinedPos / combinedTotal) * 100) : 0;
    const negPct = combinedTotal > 0 ? Math.round((combinedNeg / combinedTotal) * 100) : 0;
    const neuPct = combinedTotal > 0 ? Math.max(0, 100 - posPct - negPct) : 0;

    const totalVideosCount = updatedAnalyzedVideos.length;

    setOverviewData({
      keyword: currentKeyword,
      totalVideos: totalVideosCount,
      videosChange: `+${totalVideosCount}`,
      totalComments: combinedTotal,
      commentsChange: `+${combinedTotal}`,
      positivePct: posPct,
      positiveChange: `${posPct}%`,
      positiveCount: combinedPos,
      negativePct: negPct,
      negativeChange: `${negPct}%`,
      negativeCount: combinedNeg,
      neutralPct: neuPct,
      neutralChange: `${neuPct}%`,
      neutralCount: combinedNeu,
      sampleRecordCount: combinedTotal,
    });

    setSentimentDistribution([
      { name: 'Positive', value: combinedPos, percentage: posPct, color: '#10b981' },
      { name: 'Negative', value: combinedNeg, percentage: negPct, color: '#ef4444' },
      { name: 'Neutral', value: combinedNeu, percentage: neuPct, color: '#8590a5' },
    ]);

    // Dynamic Top Keywords & Word Cloud from aggregated comments
    const keywords = extractTopKeywords(allComments);
    setTopKeywords(keywords);

    // Dynamic Pain Points from aggregated negative comments
    const extractedPains = extractPainPoints(allComments);
    setPainPoints(extractedPains);
  };

  /**
   * Adapts full pipeline result into incremental aggregation
   */
  const saveAnalysisResult = (result: AdaptedAnalyzeResult, newComments?: CommentItem[]) => {
    if (result.videos && result.videos.length > 0) {
      const v = result.videos[0];
      aggregateVideoAnalysis(v, newComments || [], {
        positive: result.summary.positive,
        negative: result.summary.negative,
        neutral: result.summary.neutral,
      });
    }
  };

  const runAnalysisForKeyword = async (keyword: string, showPipelineModal = true) => {
    setIsAnalyzing(true);
    setCurrentKeyword(keyword);

    if (showPipelineModal) {
      setPipelineModalOpen(true);
      setPipelineStep(1);
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStep(2);
      await new Promise((r) => setTimeout(r, 700));
      setPipelineStep(3);
      await new Promise((r) => setTimeout(r, 800));
      setPipelineStep(4);
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStep(5);
      await new Promise((r) => setTimeout(r, 500));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsAnalyzing(false);
  };

  const selectSession = (sessionId: string) => {
    const session = historyList.find((s) => s.id === sessionId);
    if (session) {
      runAnalysisForKeyword(session.keyword);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentKeyword,
        setCurrentKeyword,
        dateRange,
        setDateRange,
        overviewData,
        sentimentDistribution,
        trendData,
        topKeywords,
        historyList,
        videos,
        setVideos,
        analyzedVideos,
        setAnalyzedVideos,
        comments,
        setComments,
        painPoints,
        isAnalyzing,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        pipelineModalOpen,
        setPipelineModalOpen,
        pipelineStep,
        runAnalysisForKeyword,
        saveAnalysisResult,
        aggregateVideoAnalysis,
        resetSessionForKeyword,
        selectSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
