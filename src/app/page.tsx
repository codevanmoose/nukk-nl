'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/homepage/hero-section';
import HowItWorks from '@/components/homepage/how-it-works';
import TrustIndicators from '@/components/homepage/trust-indicators';
import NewsletterSignup from '@/components/newsletter/newsletter-signup';

// Lazy load wallpaper ad for better performance
const WallpaperAd = dynamic(() => import('@/components/ads/wallpaper-ad'), {
  ssr: false
});

export default function Home() {
  const [showWallpaperAd, setShowWallpaperAd] = useState(false);

  useEffect(() => {
    // Check if user has seen the wallpaper ad in this session
    const hasSeenAd = sessionStorage.getItem('wallpaper-ad-seen');
    
    // Show ad only on first visit of the session
    if (!hasSeenAd) {
      setShowWallpaperAd(true);
    }
  }, []);

  const handleAdComplete = () => {
    setShowWallpaperAd(false);
    // Mark ad as seen for this session
    sessionStorage.setItem('wallpaper-ad-seen', 'true');
  };

  return (
    <>
      {/* WeTransfer-style wallpaper ad */}
      {showWallpaperAd && (
        <WallpaperAd 
          onComplete={handleAdComplete}
          skipDelay={5} // 5 seconds before skip button appears
        />
      )}
      
      <div>
        <HeroSection />
      
      
      <HowItWorks />
      
        <TrustIndicators />
        
        {/* Newsletter signup section */}
        <div className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Mis geen belangrijke fact-checks</h2>
            <p className="text-lg text-muted-foreground">
              Ontvang wekelijks de meest opvallende analyses en onthullingen
            </p>
          </div>
          <NewsletterSignup />
        </div>
      </div>
    </>
  );
}
