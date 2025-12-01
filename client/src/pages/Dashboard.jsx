import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Brain,
  Newspaper,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LoadingCard, Spinner } from '../components/ui/Spinner';
import { marketAPI, subscribeAPI } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage, formatChartDate } from '../utils/formatters';
import { SUPPORTED_COINS, getCoinOptions, DEFAULT_COIN } from '../constants/coins';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

// Hero coin cards
const HeroCoinCard = ({ coin, index }) => {
  const priceChange = formatPercentage(coin.price_change_percentage_24h);
  const isPositive = coin.price_change_percentage_24h > 0;
  
  return (
    <div
      className="hero-coin-card glass-card p-4 hover:scale-105 transition-all duration-300 animate-fade-in cursor-pointer"
      style={{ 
        animationDelay: `${index * 100}ms`,
        borderColor: isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {coin.image ? (
            <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-crypto-lime/20 flex items-center justify-center">
              <span className="text-xs font-bold text-crypto-lime">
                {coin.symbol?.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-bold text-white">{coin.symbol?.toUpperCase()}</p>
            <p className="text-xs text-gray-500">{coin.name}</p>
          </div>
        </div>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-crypto-green" />
        ) : (
          <TrendingDown className="w-5 h-5 text-crypto-red" />
        )}
      </div>
      
      <div>
        <p className="text-xl font-bold text-white">
          {formatCurrency(coin.current_price, coin.current_price < 1 ? 4 : 2)}
        </p>
        <p className={`text-sm font-medium ${priceChange.color}`}>
          {priceChange.formatted}
        </p>
      </div>
    </div>
  );
};

// Market snapshot row
const MarketSnapshotRow = ({ coins }) => {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-crypto-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-crypto-bg to-transparent z-10 pointer-events-none" />
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="flex-shrink-0 glass-card p-3 min-w-[150px] hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-white text-sm">{coin.symbol}</span>
              {coin.change24h > 0 ? (
                <TrendingUp className="w-3 h-3 text-crypto-green" />
              ) : (
                <TrendingDown className="w-3 h-3 text-crypto-red" />
              )}
            </div>
            <p className="text-sm text-gray-400">
              {formatCurrency(coin.price, coin.price < 1 ? 4 : 2)}
            </p>
            <p className={`text-xs ${coin.change24h > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
              {coin.change24h > 0 ? '+' : ''}{coin.change24h?.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload[0]) return null;
  
  return (
    <div className="bg-crypto-bg-card/95 border border-crypto-lime/30 rounded-lg p-3 shadow-2xl">
      <p className="text-crypto-lime font-semibold text-sm">
        {formatChartDate(label, '7d')}
      </p>
      <p className="text-gray-200 text-lg font-bold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_COIN);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [marketData, setMarketData] = useState(null);
  const [heroCoins, setHeroCoins] = useState([]);
  const [snapshotCoins, setSnapshotCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  
  const coins = getCoinOptions();
  const timeRanges = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '1M' },
    { value: '90d', label: '3M' }
  ];
  
  // Fetch hero coins and market snapshot
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data for hero coins (top 5)
        const heroData = await marketAPI.getMultipleCoinsData(
          SUPPORTED_COINS.slice(0, 5).map(c => c.id),
          '24h'
        );
        
        setHeroCoins(heroData.map(d => ({
          id: d.coin.id,
          symbol: d.coin.symbol,
          name: d.coin.name,
          image: d.coin.image,
          current_price: d.stats.currentPrice,
          price_change_percentage_24h: d.stats.priceChange24h
        })));
        
        // Fetch snapshot data (all coins)
        const snapshotData = await marketAPI.getMultipleCoinsData(
          SUPPORTED_COINS.map(c => c.id),
          '24h'
        );
        
        setSnapshotCoins(snapshotData.map(d => ({
          id: d.coin.id,
          symbol: d.coin.symbol.toUpperCase(),
          price: d.stats.currentPrice,
          change24h: d.stats.priceChange24h
        })));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);
  
  // Fetch market data for selected coin
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const data = await marketAPI.getMarketData(selectedCoin, selectedRange);
        setMarketData(data);
      } catch (error) {
        toast.error('Failed to fetch market data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
  }, [selectedCoin, selectedRange]);
  
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    setSubscribing(true);
    try {
      const response = await subscribeAPI.subscribe(email);
      if (response.success) {
        toast.success(response.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        toast.error(response.error || 'Failed to subscribe');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };
  
  const stats = marketData?.stats || {};
  const chartData = marketData?.chartData || [];
  const priceChange = formatPercentage(stats.priceChange24h);
  
  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-crypto-lime/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-crypto-green/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-crypto-lime to-crypto-green bg-clip-text text-transparent">
                Crypto Insight Hub
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Professional cryptocurrency tracking with AI-powered insights
            </p>
            
            <div className="flex justify-center gap-4 mb-10">
              <Button
                onClick={() => navigate('/analysis')}
                className="bg-gradient-to-r from-crypto-lime to-crypto-green hover:from-crypto-green hover:to-crypto-lime text-black font-semibold"
              >
                <Brain className="w-5 h-5 mr-2" />
                AI Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/news')}
              >
                <Newspaper className="w-5 h-5 mr-2" />
                Crypto News
              </Button>
            </div>
          </div>
          
          {/* Hero Coin Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {heroCoins.map((coin, index) => (
              <HeroCoinCard key={coin.id} coin={coin} index={index} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Market Snapshot */}
      <section className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-crypto-lime" />
          <h2 className="text-2xl font-bold text-white">Market Snapshot</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-crypto-lime/50 to-transparent" />
        </div>
        
        <MarketSnapshotRow coins={snapshotCoins} />
      </section>
      
      {/* Main Chart + Advanced Metrics */}
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart Section - 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <CardTitle>Price Chart</CardTitle>
                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedCoin}
                      onChange={(e) => setSelectedCoin(e.target.value)}
                      options={coins}
                      className="w-48"
                    />
                    <div className="flex gap-1">
                      {timeRanges.map(range => (
                        <Button
                          key={range.value}
                          variant={selectedRange === range.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRange(range.value)}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={(time) => formatChartDate(time, selectedRange)}
                          stroke="#666"
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${formatNumber(value)}`}
                          stroke="#666"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#84cc16"
                          strokeWidth={2}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Advanced Metrics - 1 column */}
          <div className="space-y-4">
            {/* Current Price */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-400 mb-1">Current Price</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.currentPrice)}
                </p>
                <p className={`text-sm ${priceChange.color}`}>
                  {priceChange.formatted} (24h)
                </p>
              </CardContent>
            </Card>
            
            {/* Market Stats */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Market Cap</span>
                  <span className="text-white font-medium">
                    ${formatNumber(stats.marketCap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">24h Volume</span>
                  <span className="text-white font-medium">
                    ${formatNumber(stats.volume24h)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Market Rank</span>
                  <span className="text-crypto-lime font-bold">
                    #{stats.marketCapRank}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Price Range */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">All-Time High</span>
                  <span className="text-white font-medium">
                    {formatCurrency(stats.ath)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">All-Time Low</span>
                  <span className="text-white font-medium">
                    {formatCurrency(stats.atl)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Supply Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Circulating</span>
                  <span className="text-white font-medium">
                    {formatNumber(stats.circulatingSupply)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Max Supply</span>
                  <span className="text-white font-medium">
                    {stats.totalSupply ? formatNumber(stats.totalSupply) : '∞'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Subscription Banner */}
      <section className="container mx-auto px-4 pb-12">
        <div className="glass-card p-8 bg-gradient-to-br from-crypto-lime/5 to-crypto-green/5">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated with Crypto Insights
            </h3>
            <p className="text-gray-400 mb-6">
              Get weekly market analysis and AI-powered insights delivered to your inbox
            </p>
            
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribing}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="bg-gradient-to-r from-crypto-lime to-crypto-green hover:from-crypto-green hover:to-crypto-lime text-black font-semibold"
              >
                {subscribing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
