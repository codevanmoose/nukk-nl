import HeroSection from '@/components/homepage/hero-section';
import HowItWorks from '@/components/homepage/how-it-works';
import TrustIndicators from '@/components/homepage/trust-indicators';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <TrustIndicators />
    </div>
  );
}
