import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Zap } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';
import { marketAPI } from '../../services/api';
import { SUPPORTED_COINS } from '../../constants/coins';

// Fetch top movers from real data
const getTopMovers = async () => {
  try {
    // Use supported coins list
    const popularCoins = SUPPORTED_COINS.map(c => c.id);
    
    const data = await marketAPI.getMultipleCoinsData(popularCoins, '24h');
    
    // Process and sort coins
    const coinsWithChange = data.map(item => ({
      symbol: item.coin.symbol.toUpperCase(),
      name: item.coin.name,
      change: item.stats.priceChange24h || 0,
      price: item.stats.currentPrice
    })).filter(coin => coin.price > 0);
    
    // Sort by change percentage
    const sorted = [...coinsWithChange].sort((a, b) => b.change - a.change);
    
    // Get top 3 gainers and losers
    const gainers = sorted.slice(0, 3);
    const losers = sorted.slice(-3).reverse();
    
    // Calculate market mood
    const averageChange = coinsWithChange.reduce((sum, coin) => sum + coin.change, 0) / coinsWithChange.length;
    let marketMood = 'neutral';
    if (averageChange > 2) marketMood = 'bullish';
    else if (averageChange < -2) marketMood = 'bearish';
    
    return {
      gainers,
      losers,
      marketMood,
      averageChange
    };
  } catch (error) {
    console.error('Failed to fetch top movers:', error);
    // Return mock data as fallback
    return {
      gainers: [
        { symbol: 'DOGE', name: 'Dogecoin', change: 15.34, price: 0.089 },
        { symbol: 'SOL', name: 'Solana', change: 8.45, price: 98.45 },
        { symbol: 'AVAX', name: 'Avalanche', change: 6.78, price: 34.56 },
      ],
      losers: [
        { symbol: 'ADA', name: 'Cardano', change: -5.67, price: 0.456 },
        { symbol: 'DOT', name: 'Polkadot', change: -4.23, price: 12.34 },
        { symbol: 'LINK', name: 'Chainlink', change: -3.45, price: 18.90 },
      ],
      marketMood: 'bullish',
      averageChange: 2.34
    };
  }
};

const MoverCard = ({ mover, type }) => {
  const isGainer = type === 'gainer';
  const priceChange = formatPercentage(mover.change);
  
  return (
    <div className={`
      flex items-center justify-between p-3 rounded-lg
      bg-crypto-bg-secondary/50 border transition-all duration-300
      ${isGainer 
        ? 'border-crypto-green/20 hover:border-crypto-green/40 hover:bg-crypto-green/5' 
        : 'border-crypto-red/20 hover:border-crypto-red/40 hover:bg-crypto-red/5'
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          p-2 rounded-lg
          ${isGainer ? 'bg-crypto-green/10' : 'bg-crypto-red/10'}
        `}>
          {isGainer ? (
            <TrendingUp className="w-4 h-4 text-crypto-green" />
          ) : (
            <TrendingDown className="w-4 h-4 text-crypto-red" />
          )}
        </div>
        <div>
          <p className="font-semibold text-white">{mover.symbol}</p>
          <p className="text-xs text-gray-500">{mover.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${priceChange.color}`}>
          {priceChange.formatted}
        </p>
        <p className="text-xs text-gray-400">${mover.price}</p>
      </div>
    </div>
  );
};

const MarketMood = ({ mood, averageChange }) => {
  const moodConfig = {
    bullish: {
      label: 'Bullish',
      color: 'text-crypto-green',
      bg: 'bg-crypto-green/10',
      border: 'border-crypto-green/30',
      icon: '🚀',
      description: 'Market sentiment is positive'
    },
    neutral: {
      label: 'Neutral',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30',
      icon: '⚖️',
      description: 'Market is consolidating'
    },
    bearish: {
      label: 'Bearish',
      color: 'text-crypto-red',
      bg: 'bg-crypto-red/10',
      border: 'border-crypto-red/30',
      icon: '🐻',
      description: 'Market sentiment is negative'
    }
  };
  
  const config = moodConfig[mood];
  
  return (
    <div className={`
      glass-card p-6 text-center
      ${config.border} ${config.bg}
      transform hover:scale-105 transition-all duration-300
    `}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-3xl">{config.icon}</span>
        <BarChart2 className={`w-6 h-6 ${config.color}`} />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">Market Mood</h3>
      <p className={`text-2xl font-bold ${config.color} mb-2`}>
        {config.label}
      </p>
      <p className="text-sm text-gray-400 mb-3">{config.description}</p>
      <div className="pt-3 border-t border-white/10">
        <p className="text-xs text-gray-500">Average 24h Change</p>
        <p className={`text-lg font-semibold ${averageChange >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
          {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export const TopMovers = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const moversData = await getTopMovers();
        setData(moversData);
      } catch (error) {
        console.error('Failed to fetch top movers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovers();
    const interval = setInterval(fetchMovers, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading || !data) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-64 animate-pulse">
                <div className="h-full bg-crypto-bg-secondary rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Market Insights</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Today's Top Performers
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Top Gainers */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-crypto-green" />
              <h3 className="text-lg font-bold text-white">Top Gainers</h3>
            </div>
            <div className="space-y-3">
              {data.gainers.map((gainer) => (
                <MoverCard key={gainer.symbol} mover={gainer} type="gainer" />
              ))}
            </div>
          </div>
          
          {/* Market Mood */}
          <MarketMood mood={data.marketMood} averageChange={data.averageChange} />
          
          {/* Top Losers */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-crypto-red" />
              <h3 className="text-lg font-bold text-white">Top Losers</h3>
            </div>
            <div className="space-y-3">
              {data.losers.map((loser) => (
                <MoverCard key={loser.symbol} mover={loser} type="loser" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
