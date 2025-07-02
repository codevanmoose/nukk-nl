import { NextRequest, NextResponse } from 'next/server';

// Mock ads database - in production, this would come from Supabase
const wallpaperAds = [
  {
    id: 'creative-agency-2024',
    imageUrl: '/api/placeholder/1920/1080',
    advertiserName: 'Creative Agency Amsterdam',
    advertiserLogo: '/api/placeholder/120/40',
    clickUrl: 'https://example.com/creative',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    duration: 5
  },
  {
    id: 'tech-startup-2024',
    imageUrl: '/api/placeholder/1920/1080',
    advertiserName: 'Tech Startup NL',
    advertiserLogo: '/api/placeholder/120/40',
    clickUrl: 'https://example.com/tech',
    backgroundColor: '#0066cc',
    textColor: '#ffffff',
    duration: 5
  },
  {
    id: 'media-company-2024',
    imageUrl: '/api/placeholder/1920/1080',
    advertiserName: 'Media Company BV',
    advertiserLogo: '/api/placeholder/120/40',
    clickUrl: 'https://example.com/media',
    backgroundColor: '#ff6600',
    textColor: '#ffffff',
    duration: 5
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would:
    // 1. Check user's location/preferences
    // 2. Apply targeting rules
    // 3. Track impressions
    // 4. Rotate ads based on performance
    
    // For now, return a random ad
    const randomAd = wallpaperAds[Math.floor(Math.random() * wallpaperAds.length)];
    
    // Track impression (in production)
    console.log(`Serving wallpaper ad: ${randomAd.id}`);
    
    return NextResponse.json(randomAd);
  } catch (error) {
    console.error('Error serving wallpaper ad:', error);
    return NextResponse.json(
      { error: 'Failed to load advertisement' },
      { status: 500 }
    );
  }
}