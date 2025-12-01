import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Brain, Activity, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { marketAPI } from '../../services/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { SUPPORTED_COINS } from '../../constants/coins';

// Top 5 coins to display in hero
const HERO_COINS = SUPPORTED_COINS.slice(0, 5).map(c => c.id);

const CoinPill = ({ coin, index }) => {
  const priceChange = formatPercentage(coin.price_change_percentage_24h);
  const isPositive = coin.price_change_percentage_24h > 0;
  
  return (
    <div
      className="coin-pill glass-card px-4 py-3 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-fade-in hover:border-crypto-lime/40"
      style={{ 
        animationDelay: `${index * 100}ms`,
        boxShadow: isPositive 
          ? '0 4px 20px rgba(16, 185, 129, 0.1)' 
          : '0 4px 20px rgba(239, 68, 68, 0.1)'
      }}
    >
      {coin.image ? (
        <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-crypto-lime/20 flex items-center justify-center">
          <span className="text-xs font-bold text-crypto-lime">
            {coin.symbol?.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
        <p className="text-white font-semibold truncate">
          {formatCurrency(coin.current_price)}
        </p>
      </div>
      <div className={`text-right ${priceChange.color}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <p className="text-sm font-medium">{priceChange.formatted}</p>
      </div>
    </div>
  );
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const [heroCoins, setHeroCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroCoins = async () => {
      try {
        // Fetch multiple coins data
        const promises = HERO_COINS.map(coinId => marketAPI.getMarketData(coinId, '24h'));
        const results = await Promise.all(promises);
        
        const coinsData = results.map(result => ({
          id: result.coin.id,
          symbol: result.coin.symbol,
          name: result.coin.name,
          image: result.coin.image,
          current_price: result.stats.currentPrice,
          price_change_percentage_24h: result.stats.priceChange24h
        }));
        
        setHeroCoins(coinsData);
      } catch (error) {
        console.error('Failed to fetch hero coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroCoins();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHeroCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-crypto-lime/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crypto-green/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Animated graph pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
          <path
            d="M 0,200 Q 150,100 300,180 T 600,150 T 900,200 T 1200,140 T 1500,200"
            stroke="#84cc16"
            strokeWidth="2"
            fill="none"
            className="animate-pulse-slow"
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crypto-lime/10 border border-crypto-lime/30 mb-6">
            <Activity className="w-4 h-4 text-crypto-lime animate-pulse" />
            <span className="text-crypto-lime text-sm font-medium">Live Market Data</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="inline-block bg-gradient-to-r from-crypto-lime to-crypto-green bg-clip-text text-transparent">
              Crypto
            </span>
            <span className="text-white ml-3">
              Insight Hub
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Professional-grade cryptocurrency tracking with AI-powered insights, real-time data, and market analysis
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Button 
              size="lg"
              onClick={() => navigate('/tracker')}
              className="group min-w-[200px] bg-gradient-to-r from-crypto-lime to-crypto-green hover:from-crypto-green hover:to-crypto-lime text-black font-semibold"
            >
              Open Live Tracker
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/ai-explainer')}
              className="group min-w-[200px]"
            >
              <Brain className="w-5 h-5 mr-2" />
              View AI Explainer
            </Button>
          </div>
        </div>

        {/* Coin Pills Grid */}
        {!loading && heroCoins.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {heroCoins.map((coin, index) => (
              <CoinPill key={coin.id} coin={coin} index={index} />
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card px-4 py-3 h-20 animate-pulse">
                <div className="h-full bg-crypto-bg-secondary rounded-lg" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
