/**
 * Topic & Keyword Extractor Utility
 *
 * Extracts word frequencies, visual word cloud tags, and customer pain points
 * dynamically from real YouTube comments in Indonesian / English.
 */

import { CommentItem, KeywordFrequency, PainPointItem, WordCloudItem } from './types';

// Stopwords in Indonesian & English to filter out non-informative words
const INDONESIAN_STOPWORDS = new Set([
  'yang', 'di', 'dan', 'ini', 'itu', 'untuk', 'dari', 'ke', 'ada', 'bisa',
  'aja', 'ya', 'udah', 'gak', 'ga', 'sama', 'nya', 'kalo', 'kalau', 'tapi',
  'sih', 'juga', 'buat', 'lebih', 'jadi', 'mau', 'dong', 'bang', 'hp', 'video',
  'konten', 'lah', 'kan', 'yg', 'dgn', 'dr', 'bgt', 'si', 'nih', 'deh', 'aku',
  'gw', 'gue', 'lu', 'lo', 'kita', 'dia', 'mereka', 'kalian', 'masih', 'udh',
  'sudah', 'belum', 'blm', 'kok', 'apa', 'kenapa', 'bagus', 'suka', 'mantap',
  'sangat', 'terlalu', 'paling', 'kurang', 'jangan', 'hanya', 'cuma', 'bukan',
  'the', 'is', 'a', 'an', 'and', 'or', 'to', 'in', 'on', 'with', 'for', 'it',
  'this', 'that', 'i', 'you', 'my', 'your', 'so', 'just', 'at', 'by', 'be'
]);

// Pre-compiled regular expressions for fast keyword tokenization
const URL_REGEX = /https?:\/\/\S+/g;
const MENTION_REGEX = /@\w+/g;
const NON_ALPHANUM_REGEX = /[^a-z0-9\s]/g;
const WHITESPACE_REGEX = /\s+/;

/**
 * Clean and tokenize comment text into meaningful keywords
 */
export function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];

  // Remove URLs, mentions (@user), emojis, special symbols
  const cleaned = text
    .toLowerCase()
    .replace(URL_REGEX, '')
    .replace(MENTION_REGEX, '')
    .replace(NON_ALPHANUM_REGEX, ' ');

  const tokens = cleaned
    .split(WHITESPACE_REGEX)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !INDONESIAN_STOPWORDS.has(w));

  return tokens;
}

/**
 * Dynamically extract top keyword frequencies and their positive sentiment ratio
 */
export function extractTopKeywords(comments: CommentItem[], maxKeywords = 12): KeywordFrequency[] {
  if (!comments || comments.length === 0) return [];

  const freqMap: Record<string, { total: number; positive: number }> = {};

  for (const item of comments) {
    const words = extractKeywordsFromText(item.comment);
    const uniqueInComment = Array.from(new Set(words));
    const isPositive = item.sentiment === 'positive';

    for (const w of uniqueInComment) {
      if (!freqMap[w]) {
        freqMap[w] = { total: 0, positive: 0 };
      }
      freqMap[w].total += 1;
      if (isPositive) {
        freqMap[w].positive += 1;
      }
    }
  }

  const entries = Object.entries(freqMap)
    .filter(([, stats]) => stats.total >= 2) // At least mentioned 2 times
    .map(([keyword, stats]) => ({
      keyword,
      count: stats.total,
      positiveRatio: Number((stats.positive / stats.total).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);

  return entries.slice(0, maxKeywords);
}

/**
 * Dynamically extract Word Cloud tags from comments
 */
export function extractWordCloud(comments: CommentItem[], maxTags = 20): WordCloudItem[] {
  if (!comments || comments.length === 0) return [];

  const freqMap: Record<string, { total: number; pos: number; neg: number; neu: number }> = {};

  for (const item of comments) {
    const words = extractKeywordsFromText(item.comment);
    const uniqueInComment = Array.from(new Set(words));

    for (const w of uniqueInComment) {
      if (!freqMap[w]) {
        freqMap[w] = { total: 0, pos: 0, neg: 0, neu: 0 };
      }
      freqMap[w].total += 1;
      if (item.sentiment === 'positive') freqMap[w].pos += 1;
      else if (item.sentiment === 'negative') freqMap[w].neg += 1;
      else freqMap[w].neu += 1;
    }
  }

  const entries = Object.entries(freqMap)
    .filter(([, stats]) => stats.total >= 2)
    .map(([text, stats]) => {
      // Determine dominant sentiment
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (stats.pos > stats.neg && stats.pos > stats.neu) {
        sentiment = 'positive';
      } else if (stats.neg > stats.pos && stats.neg > stats.neu) {
        sentiment = 'negative';
      }

      return {
        text,
        weight: stats.total,
        sentiment,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  const topTags = entries.slice(0, maxTags);
  if (topTags.length === 0) return [];

  // Normalize weight to a readable pixel scale between 14 and 38
  const maxWeight = Math.max(...topTags.map((t) => t.weight), 1);
  const minWeight = Math.min(...topTags.map((t) => t.weight), 1);

  return topTags.map((t) => {
    const normalized =
      maxWeight === minWeight
        ? 20
        : Math.round(14 + ((t.weight - minWeight) / (maxWeight - minWeight)) * 24);

    return {
      text: t.text,
      weight: normalized,
      sentiment: t.sentiment,
    };
  });
}

/**
 * Dynamically extract customer pain points from negative comments
 */
export function extractPainPoints(comments: CommentItem[]): PainPointItem[] {
  if (!comments || comments.length === 0) return [];

  const negativeComments = comments.filter((c) => c.sentiment === 'negative');
  if (negativeComments.length === 0) return [];

  // Categorize negative comments based on topical keywords
  const categories: Array<{
    id: string;
    category: string;
    title: string;
    keywords: string[];
    description: string;
  }> = [
    {
      id: 'pain-price',
      category: 'Harga & Nilai',
      title: 'Harga Mahal & Reseller / Pajak',
      keywords: ['harga', 'mahal', 'reseller', 'pajak', 'kemahalan', 'jutaan', 'duit', 'worth', 'budget', 'gaji', 'beli'],
      description: 'Konsumen menyoroti harga jual yang tinggi serta selisih harga dari reseller atau regulasi pajak.',
    },
    {
      id: 'pain-battery',
      category: 'Baterai & Suhu',
      title: 'Kapasitas Baterai & Suhu Panas',
      keywords: ['baterai', 'batere', 'battery', 'boros', 'cas', 'charging', 'panas', 'suhu', 'cepat habis', 'mah'],
      description: 'Audiens mengeluhkan daya tahan baterai dan peningkatan suhu saat pemakaian intensif.',
    },
    {
      id: 'pain-camera',
      category: 'Kamera & Desain',
      title: 'Ekspektasi Kamera & Desain Fisik',
      keywords: ['kamera', 'camera', 'layar', 'bezel', 'desain', 'warna', 'bodi', 'bobot', 'berat', 'jelek', 'kurang'],
      description: 'Keluhan mengenai peningkatan fitur kamera dan bentuk fisik yang dinilai kurang berbeda dari generasi sebelumnya.',
    },
    {
      id: 'pain-performance',
      category: 'Performa & Software',
      title: 'Isu Performa & Sistem Operasi',
      keywords: ['lag', 'bug', 'drop', 'fps', 'gaming', 'update', 'stutter', 'lemot', 'patah', 'error'],
      description: 'Masalah kestabilan performa saat multitasking atau bug pada versi sistem operasi terkini.',
    },
  ];

  const results: PainPointItem[] = [];

  for (const cat of categories) {
    const matched = negativeComments.filter((c) => {
      const lower = c.comment.toLowerCase();
      return cat.keywords.some((kw) => lower.includes(kw));
    });

    if (matched.length > 0) {
      const mentions = matched.length;
      const severity: 'high' | 'medium' | 'low' =
        mentions >= 15 ? 'high' : mentions >= 5 ? 'medium' : 'low';

      // Pick top 2 most liked or distinct sample comments
      const sortedByLikes = [...matched].sort((a, b) => b.likeCount - a.likeCount);
      const sampleComments = sortedByLikes.slice(0, 2).map((c) => c.comment.trim());

      results.push({
        id: cat.id,
        category: cat.category,
        title: cat.title,
        description: cat.description,
        mentions,
        severity,
        sampleComments,
      });
    }
  }

  // If none matched predefined categories, create an organic pain point from negative comments
  if (results.length === 0 && negativeComments.length > 0) {
    const sortedByLikes = [...negativeComments].sort((a, b) => b.likeCount - a.likeCount);
    results.push({
      id: 'pain-general',
      category: 'Kritik & Keluhan Umum',
      title: 'Keluhan dan Saran Pengguna',
      description: 'Kritik dan catatan negatif yang disampaikan langsung oleh audiens pada kolom komentar.',
      mentions: negativeComments.length,
      severity: negativeComments.length >= 10 ? 'high' : 'medium',
      sampleComments: sortedByLikes.slice(0, 2).map((c) => c.comment.trim()),
    });
  }

  return results.sort((a, b) => b.mentions - a.mentions);
}

