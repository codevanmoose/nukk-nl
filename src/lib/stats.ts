import { supabase } from './supabase-client';

export interface PlatformStats {
  totalAnalyses: number;
  averageAccuracy: number;
  averageProcessingTime: number;
  uniqueArticles: number;
  lastUpdated: string;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // Get total analyses count
    const { count: analysesCount } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true });

    // Get unique articles count
    const { count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    // Get average accuracy and processing time
    const { data: analysesData } = await supabase
      .from('analyses')
      .select('objectivity_score, processing_time_ms');

    let averageAccuracy = 95; // Default fallback
    let averageProcessingTime = 3000; // Default 3 seconds

    if (analysesData && analysesData.length > 0) {
      // Calculate average objectivity score (which represents accuracy)
      const totalScore = analysesData.reduce((sum, analysis) => sum + analysis.objectivity_score, 0);
      averageAccuracy = Math.round(totalScore / analysesData.length);

      // Calculate average processing time
      const totalTime = analysesData.reduce((sum, analysis) => sum + analysis.processing_time_ms, 0);
      averageProcessingTime = Math.round(totalTime / analysesData.length);
    }

    return {
      totalAnalyses: analysesCount || 0,
      averageAccuracy,
      averageProcessingTime,
      uniqueArticles: articlesCount || 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    // Return defaults if database is not accessible
    return {
      totalAnalyses: 0,
      averageAccuracy: 95,
      averageProcessingTime: 3000,
      uniqueArticles: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Cache stats for 5 minutes to avoid excessive database calls
let cachedStats: PlatformStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedPlatformStats(): Promise<PlatformStats> {
  const now = Date.now();
  
  if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedStats;
  }

  cachedStats = await getPlatformStats();
  cacheTimestamp = now;
  
  return cachedStats;
}