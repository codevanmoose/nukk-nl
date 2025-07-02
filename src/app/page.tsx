import HeroSection from '@/components/homepage/hero-section';
import HowItWorks from '@/components/homepage/how-it-works';
import TrustIndicators from '@/components/homepage/trust-indicators';
import AdBanner from '@/components/ads/ad-banner';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Ad placement 1: After hero, before how it works */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdBanner 
          slot="1234567890" 
          format="horizontal"
          className="min-h-[90px]"
        />
      </div>
      
      <HowItWorks />
      
      {/* Ad placement 2: After how it works, before stats */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdBanner 
          slot="0987654321" 
          format="rectangle"
          className="min-h-[250px] max-w-[300px] mx-auto"
        />
      </div>
      
      <TrustIndicators />
    </div>
  );
}
