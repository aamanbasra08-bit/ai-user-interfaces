import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { marketAPI } from '../../services/api';
import { SUPPORTED_COINS } from '../../constants/coins';

// Use all supported coins for market snapshot
const SNAPSHOT_COINS = SUPPORTED_COINS.map(c => c.id);

const getMarketSnapshot = async () => {
  try {
    const data = await marketAPI.getMultipleCoinsData(SNAPSHOT_COINS, '24h');
    
    return data.map(item => {
      const chartData = item.chartData || [];
      const sparkline = chartData.slice(-6).map(d => d.price);
      
      return {
        id: item.coin.id,
        symbol: item.coin.symbol,
        name: item.coin.name,
        price: item.stats.currentPrice,
        change24h: item.stats.priceChange24h || 0,
        sparkline: sparkline.length > 0 ? sparkline : [item.stats.currentPrice]
      };
    });
  } catch (error) {
    console.error('Failed to fetch market snapshot:', error);
    // Return mock data as fallback
    return [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', price: 51234.56, change24h: 2.34, sparkline: [45000, 47000, 49000, 48000, 50000, 51234] },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', price: 3021.78, change24h: -1.23, sparkline: [2900, 2950, 3100, 3050, 3000, 3021] },
    ];
  }
};

// Mini sparkline component
const Sparkline = ({ data, isPositive }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 60;
  const height = 20;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
      />
    </svg>
  );
};

const SnapshotCard = ({ coin }) => {
  const priceChange = formatPercentage(coin.change24h);
  const isPositive = coin.change24h > 0;
  
  return (
    <div className="snapshot-card flex-shrink-0 glass-card p-4 hover:scale-105 transition-all duration-300 hover:border-crypto-lime/40 cursor-pointer min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{coin.symbol}</span>
          <span className="text-xs text-gray-500">{coin.name}</span>
        </div>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-crypto-green" />
        ) : (
          <TrendingDown className="w-4 h-4 text-crypto-red" />
        )}
      </div>
      
      <div className="mb-2">
        <p className="text-lg font-semibold text-gray-100">
          {formatCurrency(coin.price, coin.price < 1 ? 4 : 2)}
        </p>
        <p className={`text-sm ${priceChange.color}`}>
          {priceChange.formatted}
        </p>
      </div>
      
      <div className="flex justify-end">
        <Sparkline data={coin.sparkline} isPositive={isPositive} />
      </div>
    </div>
  );
};

export const MarketSnapshot = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const data = await getMarketSnapshot();
        setCoins(data);
      } catch (error) {
        console.error('Failed to fetch market snapshot:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-crypto-lime" />
          <h2 className="text-2xl font-bold text-white">Market Snapshot</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-crypto-lime/50 to-transparent" />
        </div>
        
        {/* Scrolling Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-crypto-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-crypto-bg to-transparent z-10 pointer-events-none" />
          
          {/* Cards Container */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {loading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 glass-card p-4 min-w-[200px] h-32 animate-pulse">
                  <div className="h-full bg-crypto-bg-secondary rounded-lg" />
                </div>
              ))
            ) : (
              coins.map((coin) => (
                <SnapshotCard key={coin.id} coin={coin} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
