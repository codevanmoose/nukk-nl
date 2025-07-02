'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AdRotationManager, SELF_PROMO_AD } from '@/lib/wallpaper-ads-config';
import SelfPromoWallpaper from './self-promo-wallpaper';

interface WallpaperAd {
  id: string;
  imageUrl: string;
  advertiserName: string;
  advertiserLogo?: string;
  clickUrl: string;
  backgroundColor: string;
  textColor: string;
  duration: number; // seconds before skip button appears
}

interface WallpaperAdProps {
  onComplete: () => void;
  skipDelay?: number; // seconds before skip button appears (default: 3)
}

export default function WallpaperAd({ onComplete, skipDelay = 3 }: WallpaperAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(skipDelay);
  const [currentAd, setCurrentAd] = useState<WallpaperAd | null>(null);
  const [showSelfPromo, setShowSelfPromo] = useState(false);

  // Mock ads for development - replace with API call
  const mockAds: WallpaperAd[] = [
    {
      id: '1',
      imageUrl: '/api/placeholder/1920/1080',
      advertiserName: 'Creative Agency',
      clickUrl: 'https://example.com',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      duration: 5
    }
  ];

  useEffect(() => {
    // Check if we should show self-promo
    const rotationManager = AdRotationManager.getInstance();
    if (rotationManager.shouldShowSelfPromo()) {
      setShowSelfPromo(true);
    } else {
      // Load regular ad from API
      fetchAd();
    }
    
    // Rotate for next time
    if (rotationManager.shouldRotate()) {
      rotationManager.rotate();
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const fetchAd = async () => {
    try {
      const response = await fetch('/api/wallpaper-ads/current');
      if (response.ok) {
        const ad = await response.json();
        setCurrentAd(ad);
      } else {
        // Fallback to mock ad if API fails
        const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];
        setCurrentAd(randomAd);
      }
    } catch (error) {
      console.error('Failed to fetch wallpaper ad:', error);
      // Fallback to mock ad
      const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];
      setCurrentAd(randomAd);
    }
  };

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(onComplete, 300); // Allow transition to complete
  }, [onComplete]);

  const handleAdClick = () => {
    if (currentAd?.clickUrl) {
      // Track click
      trackAdClick(currentAd.id);
      
      // Open in new tab
      window.open(currentAd.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const trackAdClick = async (adId: string) => {
    // TODO: Implement click tracking
    try {
      await fetch('/api/ads/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, type: 'wallpaper' })
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  // Show self-promo ad if it's time
  if (showSelfPromo && isVisible) {
    return <SelfPromoWallpaper onComplete={onComplete} skipDelay={7} />;
  }

  if (!currentAd || !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: currentAd.backgroundColor }}
    >
      {/* Full screen clickable area */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleAdClick}
      >
        {/* Background image with gradient overlay */}
        <div className="relative w-full h-full">
          {currentAd.imageUrl.startsWith('/api/placeholder') ? (
            // Placeholder for development
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4" style={{ color: currentAd.textColor }}>
                  Beautiful Wallpaper Ad
                </h2>
                <p className="text-xl opacity-75" style={{ color: currentAd.textColor }}>
                  This space showcases premium full-screen advertisements
                </p>
              </div>
            </div>
          ) : (
            <Image
              src={currentAd.imageUrl}
              alt={`Advertisement by ${currentAd.advertiserName}`}
              fill
              className="object-cover"
              priority
              quality={90}
            />
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        </div>
      </div>

      {/* Content overlay - not clickable */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
        {/* Top section with advertiser info */}
        <div className="flex justify-between items-start">
          <div className="pointer-events-auto">
            {currentAd.advertiserLogo && (
              <Image
                src={currentAd.advertiserLogo}
                alt={currentAd.advertiserName}
                width={120}
                height={40}
                className="mb-2"
              />
            )}
            <p className="text-sm opacity-75" style={{ color: currentAd.textColor }}>
              Advertentie door {currentAd.advertiserName}
            </p>
          </div>

          {/* Skip button */}
          <div className="pointer-events-auto">
            {canSkip ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="group"
                style={{ 
                  color: currentAd.textColor,
                  borderColor: currentAd.textColor 
                }}
              >
                <span className="mr-2">Overslaan</span>
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </Button>
            ) : (
              <div 
                className="text-sm px-4 py-2"
                style={{ color: currentAd.textColor }}
              >
                Overslaan in {timeRemaining}s
              </div>
            )}
          </div>
        </div>

        {/* Center section - nukk.nl branding */}
        <div className="flex items-center justify-center px-4">
          <div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 pointer-events-auto max-w-sm w-full md:w-auto"
            onClick={(e) => e.stopPropagation()} // Prevent ad click
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: currentAd.textColor }}>
              nukk.nl
            </h1>
            <p className="text-xs md:text-sm opacity-90" style={{ color: currentAd.textColor }}>
              AI-powered fact-checking voor nu.nl
            </p>
            
            {/* Progress bar */}
            <div className="mt-4 w-full max-w-[16rem] h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/60 transition-all duration-1000"
                style={{ 
                  width: `${((skipDelay - timeRemaining) / skipDelay) * 100}%`,
                  backgroundColor: currentAd.textColor 
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom section with CTA */}
        <div className="text-center">
          <p 
            className="text-lg pointer-events-auto cursor-pointer hover:underline"
            style={{ color: currentAd.textColor }}
            onClick={handleAdClick}
          >
            Klik om meer te ontdekken →
          </p>
        </div>
      </div>
    </div>
  );
}