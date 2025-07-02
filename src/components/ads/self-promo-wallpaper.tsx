'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, Users, BarChart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SelfPromoWallpaperProps {
  onComplete: () => void;
  skipDelay?: number;
}

export default function SelfPromoWallpaper({ onComplete, skipDelay = 7 }: SelfPromoWallpaperProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(skipDelay);

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

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-white text-2xl font-bold mb-1">nukk.nl</h2>
            <p className="text-white/80 text-sm">Premium Advertentie Platform</p>
          </div>

          {/* Skip button */}
          <div>
            {canSkip ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white hover:bg-white/20 border border-white/30"
              >
                <span className="mr-2">Overslaan</span>
                <X className="w-4 h-4" />
              </Button>
            ) : (
              <div className="text-white/80 text-sm px-4 py-2 border border-white/30 rounded">
                Overslaan in {timeRemaining}s
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full px-4">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Adverteer hier
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-8">
                Bereik 50.000+ kritische denkers
              </p>
            </div>

            {/* Features grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Hoge Impact</h3>
                <p className="text-white/80 text-sm">Full-screen premium advertenties</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <Users className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Quality Audience</h3>
                <p className="text-white/80 text-sm">Hoogopgeleid & bewust publiek</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <BarChart className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Transparant</h3>
                <p className="text-white/80 text-sm">Real-time analytics dashboard</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <Clock className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Flexibel</h3>
                <p className="text-white/80 text-sm">Per dag, week of maand</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center">
              <p className="text-3xl text-white mb-6">
                Vanaf <span className="font-bold text-4xl">€299</span> per dag
              </p>
              
              <Link href="/adverteren" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  Ontdek de mogelijkheden →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Premium adverteren zonder de gebruikerservaring te verstoren
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 max-w-xs mx-auto">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000"
                style={{ 
                  width: `${((skipDelay - timeRemaining) / skipDelay) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}