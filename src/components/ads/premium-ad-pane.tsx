'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdRotationManager, SELF_PROMO_AD } from '@/lib/wallpaper-ads-config';

interface PremiumAd {
  id: string;
  imageUrl: string;
  advertiserName: string;
  advertiserLogo?: string;
  clickUrl: string;
  backgroundColor: string;
  textColor: string;
  altText?: string;
}

interface PremiumAdPaneProps {
  onShowAdverterenInfo?: () => void;
}

export default function PremiumAdPane({ onShowAdverterenInfo }: PremiumAdPaneProps = {}) {
  const [currentAd, setCurrentAd] = useState<PremiumAd | null>(null);
  const [showSelfPromo, setShowSelfPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock ads for development
  const mockAds: PremiumAd[] = [
    {
      id: '1',
      imageUrl: '/api/placeholder/1200/800',
      advertiserName: 'Premium Brand',
      clickUrl: 'https://example.com',
      backgroundColor: '#f8f9fa',
      textColor: '#000000',
      altText: 'Premium advertisement'
    }
  ];

  useEffect(() => {
    loadAd();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const loadAd = async () => {
    setIsLoading(true);
    
    // Check if we should show self-promo
    const rotationManager = AdRotationManager.getInstance();
    if (rotationManager.shouldShowSelfPromo()) {
      setShowSelfPromo(true);
      setIsLoading(false);
      return;
    }

    try {
      // Try to fetch ad from API
      const response = await fetch('/api/wallpaper-ads/current');
      if (response.ok) {
        const ad = await response.json();
        setCurrentAd(ad);
      } else {
        // Fallback to mock ad
        setCurrentAd(mockAds[0]);
      }
    } catch (error) {
      console.error('Failed to fetch ad:', error);
      // Fallback to mock ad
      setCurrentAd(mockAds[0]);
    } finally {
      setIsLoading(false);
    }

    // Rotate for next time
    if (rotationManager.shouldRotate()) {
      rotationManager.rotate();
    }
  };

  const handleAdClick = async () => {
    if (!currentAd) return;
    
    // Track click
    try {
      await fetch('/api/ads/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: currentAd.id, type: 'premium' })
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  // Self-promotion ad
  if (showSelfPromo && !isLoading) {
    return (
      <div 
        className="relative w-full h-full block group cursor-pointer"
        onClick={() => {
          handleAdClick();
          if (onShowAdverterenInfo) {
            onShowAdverterenInfo();
          }
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: SELF_PROMO_AD.backgroundColor }}
        >
          <div className="text-center text-white p-8 max-w-2xl">
            <h2 className="text-5xl font-bold mb-4">
              {SELF_PROMO_AD.content.headline}
            </h2>
            <p className="text-2xl mb-8 opacity-90">
              {SELF_PROMO_AD.content.subheadline}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
              {SELF_PROMO_AD.content.features.map((feature, index) => (
                <div key={index} className="text-left">
                  <span className="text-lg">✓ {feature}</span>
                </div>
              ))}
            </div>
            
            <div className="inline-flex items-center gap-2 text-xl font-medium group-hover:gap-4 transition-all">
              <span>{SELF_PROMO_AD.content.cta}</span>
              <span>→</span>
            </div>
          </div>
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
          }} />
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !currentAd) {
    return (
      <div className="relative w-full h-full bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="w-48 h-4 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Regular ad display
  return (
    <a
      href={currentAd.clickUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="relative w-full h-full block group"
      onClick={handleAdClick}
      style={{ backgroundColor: currentAd.backgroundColor }}
    >
      {/* Ad content */}
      {currentAd.imageUrl.startsWith('/api/placeholder') ? (
        // Placeholder for development
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-bold mb-4" style={{ color: currentAd.textColor }}>
              Premium Advertisement Space
            </h2>
            <p className="text-xl opacity-75 mb-8" style={{ color: currentAd.textColor }}>
              Bereik 50.000+ kritische denkers met uw boodschap
            </p>
            <div className="inline-flex items-center gap-2 text-lg font-medium group-hover:gap-4 transition-all" style={{ color: currentAd.textColor }}>
              <span>Meer informatie</span>
              <span>→</span>
            </div>
          </div>
        </div>
      ) : (
        // Real ad image
        <div className="relative w-full h-full">
          <Image
            src={currentAd.imageUrl}
            alt={currentAd.altText || `Advertisement by ${currentAd.advertiserName}`}
            fill
            className="object-cover"
            priority
            quality={90}
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      )}

      {/* Advertiser attribution */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
          <p className="text-xs text-gray-600">
            Advertentie • {currentAd.advertiserName}
          </p>
        </div>
        
        {/* CTA hint on hover */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Klik voor meer
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </p>
        </div>
      </div>
    </a>
  );
}