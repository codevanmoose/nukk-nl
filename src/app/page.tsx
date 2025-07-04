'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SplitScreenLayout from '@/components/layout/split-screen-layout';
import MinimalInputCard from '@/components/homepage/minimal-input-card';
import PremiumAdPane from '@/components/ads/premium-ad-pane';
import Footer from '@/components/layout/footer';

// Lazy load less critical components
const HowItWorks = dynamic(() => import('@/components/homepage/how-it-works'), {
  ssr: true
});

const TrustIndicators = dynamic(() => import('@/components/homepage/trust-indicators'), {
  ssr: true
});

// Import adverteren content
const AdverterenContent = dynamic(() => import('@/components/homepage/adverteren-content'), {
  ssr: false
});

export default function Home() {
  const [showAdverterenInfo, setShowAdverterenInfo] = useState(false);

  return (
    <>
      {/* Main split-screen section */}
      <SplitScreenLayout
        leftContent={<MinimalInputCard />}
        rightContent={
          showAdverterenInfo ? (
            <AdverterenContent onClose={() => setShowAdverterenInfo(false)} />
          ) : (
            <PremiumAdPane onShowAdverterenInfo={() => setShowAdverterenInfo(true)} />
          )
        }
      />
      
      {/* Additional sections below the fold */}
      <div id="how-it-works" className="scroll-mt-20">
        <HowItWorks />
      </div>
      
      <TrustIndicators />
      
      <Footer />
    </>
  );
}