import { NextResponse } from 'next/server';
import { getCachedPlatformStats } from '@/lib/stats';

export async function GET() {
  try {
    const stats = await getCachedPlatformStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    
    return NextResponse.json({
      success: false,
      stats: {
        totalAnalyses: 0,
        averageAccuracy: 95,
        averageProcessingTime: 3000,
        uniqueArticles: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  }
}

// Enable caching for this route
export const revalidate = 300; // Revalidate every 5 minutes