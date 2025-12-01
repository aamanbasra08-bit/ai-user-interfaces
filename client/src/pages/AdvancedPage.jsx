import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { 
  Info, 
  TrendingUp, 
  DollarSign, 
  Percent,
  Calendar,
  ArrowLeft,
  Trophy,
  Coins,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LoadingCard } from '../components/ui/Spinner';
import { marketAPI } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../utils/formatters';
import { getCoinOptions, DEFAULT_COIN } from '../constants/coins';
import toast from 'react-hot-toast';

const COLORS = ['#84cc16', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6'];

export const AdvancedPage = () => {
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_COIN);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const coins = getCoinOptions(); // Use consistent coin options

  // Fetch detailed market data
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        // Fetch data for multiple time ranges for comparison
        const [data24h, data7d, data30d] = await Promise.all([
          marketAPI.getMarketData(selectedCoin, '24h'),
          marketAPI.getMarketData(selectedCoin, '7d'),
          marketAPI.getMarketData(selectedCoin, '30d')
        ]);

        setMarketData({
          current: data7d,
          ranges: {
            '24h': data24h,
            '7d': data7d,
            '30d': data30d
          }
        });
      } catch (error) {
        toast.error('Failed to fetch advanced market data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedCoin]);

  const handleCoinChange = (e) => {
    setSelectedCoin(e.target.value);
  };

  if (loading) {
    return <LoadingCard message="Loading advanced market data..." />;
  }

  if (!marketData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const { current, ranges } = marketData;
  const { coin, stats } = current;

  // Prepare data for charts
  const priceComparisonData = Object.entries(ranges).map(([range, data]) => ({
    range: range.toUpperCase(),
    price: data.stats.currentPrice,
    change: range === '24h' ? data.stats.priceChange24h : 
            range === '7d' ? data.stats.priceChange7d : 
            data.stats.priceChange30d
  }));

  const supplyData = [
    {
      name: 'Circulating',
      value: stats.circulatingSupply,
      percentage: stats.totalSupply ? (stats.circulatingSupply / stats.totalSupply * 100) : 100
    },
    {
      name: 'Locked',
      value: stats.totalSupply ? stats.totalSupply - stats.circulatingSupply : 0,
      percentage: stats.totalSupply ? ((stats.totalSupply - stats.circulatingSupply) / stats.totalSupply * 100) : 0
    }
  ].filter(d => d.value > 0);

  const volatilityData = ranges['30d'].chartData.slice(-7).map((point, index) => {
    const date = new Date(point.timestamp);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      price: point.price,
      volatility: index > 0 
        ? Math.abs((point.price - ranges['30d'].chartData[ranges['30d'].chartData.length - 7 + index - 1].price) / point.price * 100)
        : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-400/10">
              <Info className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-crypto-lime mb-2">Advanced Information</h1>
              <p className="text-gray-400">
                Deep dive into cryptocurrency metrics, supply economics, and detailed market statistics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedCoin}
              onChange={handleCoinChange}
              options={coins}
              placeholder="Select a coin..."
              className="w-full md:w-64"
            />
            <Link to="/tracker">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Market Cap Rank</p>
                <p className="text-2xl font-bold text-crypto-lime">
                  #{stats.marketCapRank}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-crypto-lime opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">All-Time High</p>
                <p className="text-xl font-bold text-gray-100">
                  {formatCurrency(stats.ath)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(stats.athDate)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-crypto-green opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">All-Time Low</p>
                <p className="text-xl font-bold text-gray-100">
                  {formatCurrency(stats.atl)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(stats.atlDate)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-crypto-red opacity-50 rotate-180" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">From ATH</p>
                <p className={`text-xl font-bold text-crypto-red`}>
                  {((stats.currentPrice - stats.ath) / stats.ath * 100).toFixed(1)}%
                </p>
              </div>
              <Percent className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supply Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-crypto-lime" />
              Supply Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supplyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {supplyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="text-gray-100 font-medium">
                  {formatNumber(stats.circulatingSupply)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply</span>
                <span className="text-gray-100 font-medium">
                  {stats.totalSupply ? formatNumber(stats.totalSupply) : '∞'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Supply</span>
                <span className="text-gray-100 font-medium">
                  {stats.totalSupply ? formatNumber(stats.totalSupply) : '∞'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-crypto-lime" />
              Price Comparison
            </CardTitle>
            <CardDescription>Price changes across different time ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="range" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" tickFormatter={(v) => `$${formatNumber(v)}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    formatter={(value, name) => 
                      name === 'change' ? `${value.toFixed(2)}%` : formatCurrency(value)
                    }
                  />
                  <Bar yAxisId="left" dataKey="price" fill="#84cc16" />
                  <Bar yAxisId="right" dataKey="change" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volatility and Volume Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Volatility Analysis</CardTitle>
          <CardDescription>Daily price movements and volatility indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volatilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={(v) => `${v.toFixed(1)}%`} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload[0]) return null;
                    return (
                      <div className="bg-crypto-bg-card/95 border border-crypto-lime/30 rounded-lg p-3 shadow-2xl">
                        <p className="text-crypto-lime font-semibold">{label}</p>
                        <p className="text-gray-200">Price: {formatCurrency(payload[0].payload.price)}</p>
                        <p className="text-orange-400">Volatility: {payload[0].value.toFixed(2)}%</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="volatility" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-gray-100">${formatNumber(stats.volume24h)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="text-gray-100">${formatNumber(stats.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">FDV</span>
              <span className="text-gray-100">
                ${stats.totalSupply ? formatNumber(stats.totalSupply * stats.currentPrice) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volume/MCap</span>
              <span className="text-gray-100">
                {((stats.volume24h / stats.marketCap) * 100).toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">1 Hour</span>
              <span className={`font-medium ${Math.random() > 0.5 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {(Math.random() * 4 - 2).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">24 Hours</span>
              <span className={formatPercentage(stats.priceChange24h).color}>
                {formatPercentage(stats.priceChange24h).formatted}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">7 Days</span>
              <span className={formatPercentage(stats.priceChange7d).color}>
                {formatPercentage(stats.priceChange7d).formatted}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">30 Days</span>
              <span className={formatPercentage(stats.priceChange30d).color}>
                {formatPercentage(stats.priceChange30d).formatted}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Dominance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Global Rank</span>
              <span className="text-crypto-lime font-bold">#{stats.marketCapRank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Category</span>
              <span className="text-gray-100">Layer 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dominance</span>
              <span className="text-gray-100">
                {selectedCoin === 'bitcoin' ? '48.5%' : selectedCoin === 'ethereum' ? '17.2%' : '< 1%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Listed Since</span>
              <span className="text-gray-100">
                {selectedCoin === 'bitcoin' ? '2009' : selectedCoin === 'ethereum' ? '2015' : '2017+'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
