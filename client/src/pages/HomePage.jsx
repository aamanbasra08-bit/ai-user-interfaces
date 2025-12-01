import { HeroSection } from '../components/home/HeroSection';
import { MarketSnapshot } from '../components/home/MarketSnapshot';
import { FeatureCards } from '../components/home/FeatureCards';
import { TopMovers } from '../components/home/TopMovers';
import { SubscribeBanner } from '../components/home/SubscribeBanner';

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Live Coin Pills */}
      <HeroSection />
      
      {/* Market Snapshot Scrolling Strip */}
      <MarketSnapshot />
      
      {/* Feature Cards with Glassmorphism */}
      <FeatureCards />
      
      {/* Top Movers & Market Mood */}
      <TopMovers />
      
      {/* Subscribe Banner */}
      <SubscribeBanner />
    </div>
  );
};