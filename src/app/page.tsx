'use client';

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

export default function Home() {
  return (
    <>
      {/* Main split-screen section */}
      <SplitScreenLayout
        leftContent={<MinimalInputCard />}
        rightContent={<PremiumAdPane />}
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
