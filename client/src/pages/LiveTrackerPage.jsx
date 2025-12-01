import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Brain,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button, ButtonGroup } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LoadingCard } from '../components/ui/Spinner';
import { marketAPI, aiAPI } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage, formatChartDate } from '../utils/formatters';
import { getCoinOptions, DEFAULT_COIN } from '../constants/coins';
import toast from 'react-hot-toast';

const timeRanges = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];

const CustomTooltip = ({ active, payload, label, range }) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0];
  const price = data.value;
  const previousPrice = data.payload.previousPrice;
  const change = previousPrice ? ((price - previousPrice) / previousPrice * 100) : 0;

  return (
    <div className="bg-crypto-bg-card/95 border border-crypto-lime/30 rounded-lg p-3 shadow-2xl">
      <p className="text-crypto-lime font-semibold text-sm">
        {formatChartDate(label, range)}
      </p>
      <p className="text-gray-200 text-lg font-bold mt-1">
        {formatCurrency(price)}
      </p>
      {previousPrice && (
        <p className={`text-sm mt-1 ${change >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
        </p>
      )}
    </div>
  );
};

export const LiveTrackerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCoin, setSelectedCoin] = useState(searchParams.get('coin') || DEFAULT_COIN);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const coins = getCoinOptions(); // Use consistent coin options
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const data = await marketAPI.getMarketData(selectedCoin, selectedRange);
        
        // Add previous price for change calculation
        const chartDataWithChange = data.chartData.map((point, index) => ({
          ...point,
          previousPrice: index > 0 ? data.chartData[index - 1].price : null
        }));
        
        setMarketData({
          ...data,
          chartData: chartDataWithChange
        });
      } catch (error) {
        toast.error('Failed to fetch market data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [selectedCoin, selectedRange]);

  const handleCoinChange = (e) => {
    const coin = e.target.value;
    setSelectedCoin(coin);
    setSearchParams({ coin });
    setAiExplanation(null);
  };

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setAiExplanation(null);
  };

  const handleExplainMove = async () => {
    setLoadingAI(true);
    try {
      const response = await aiAPI.explainMove(selectedCoin, selectedRange);
      setAiExplanation(response.explanation);
    } catch (error) {
      toast.error('Failed to generate AI explanation');
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return <LoadingCard message="Loading market data..." />;
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

  const { coin, stats, chartData } = marketData;
  const priceChange = formatPercentage(stats.priceChange24h);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-crypto-lime mb-2">Live Crypto Tracker</h1>
            <p className="text-gray-400">
              Track real-time cryptocurrency prices and market movements with interactive charts
            </p>
          </div>
          <Select
            value={selectedCoin}
            onChange={handleCoinChange}
            options={coins}
            placeholder="Select a coin..."
            className="w-full md:w-64"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Price</p>
                <p className="text-2xl font-bold text-gray-100">
                  {formatCurrency(stats.currentPrice)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-crypto-lime opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">24h Change</p>
                <p className={`text-2xl font-bold ${priceChange.color}`}>
                  {priceChange.formatted}
                </p>
              </div>
              {stats.priceChange24h > 0 ? (
                <TrendingUp className="w-8 h-8 text-crypto-green opacity-50" />
              ) : (
                <TrendingDown className="w-8 h-8 text-crypto-red opacity-50" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Market Cap</p>
                <p className="text-2xl font-bold text-gray-100">
                  ${formatNumber(stats.marketCap)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">24h Volume</p>
                <p className="text-2xl font-bold text-gray-100">
                  ${formatNumber(stats.volume24h)}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Chart</CardTitle>
            <div className="flex items-center gap-2">
              <ButtonGroup>
                {timeRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={selectedRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRangeChange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </ButtonGroup>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExplainMove}
                disabled={loadingAI}
                className="ml-2"
              >
                <Brain className="w-4 h-4 mr-1" />
                Explain this move
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${formatNumber(value)}`}
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  content={<CustomTooltip range={selectedRange} />}
                />
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
        </CardContent>
      </Card>

      {/* AI Explanation */}
      {aiExplanation && (
        <Card className="border-purple-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New structured format */}
            {aiExplanation.whatHappened && (
              <>
                <div className="p-4 bg-purple-400/10 rounded-lg">
                  <h4 className="text-crypto-lime font-semibold mb-2">What Happened</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {aiExplanation.whatHappened}
                  </p>
                </div>
                
                {aiExplanation.possibleDrivers && (
                  <div>
                    <h4 className="text-gray-100 font-semibold mb-2">Key Drivers</h4>
                    <div className="p-3 bg-crypto-bg-secondary rounded-lg text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {aiExplanation.possibleDrivers}
                    </div>
                  </div>
                )}
                
                {aiExplanation.whatToWatch && (
                  <div className="p-3 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 border border-yellow-400/20 rounded-lg">
                    <h4 className="text-yellow-400 font-semibold mb-2 text-sm">What to Watch</h4>
                    <p className="text-gray-300 text-sm">
                      {aiExplanation.whatToWatch}
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* Legacy format support */}
            {aiExplanation.summary && !aiExplanation.whatHappened && (
              <>
                <div className="p-4 bg-purple-400/10 rounded-lg">
                  <p className="text-gray-100 font-semibold mb-2">
                    {aiExplanation.summary}
                  </p>
                </div>
                
                {aiExplanation.reasons && (
                  <div className="space-y-3">
                    {aiExplanation.reasons.map((reason, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="text-crypto-lime font-bold mt-1">•</span>
                        <p className="text-gray-300 text-sm leading-relaxed">{reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            <div className="p-3 bg-crypto-bg-secondary rounded-lg">
              <p className="text-xs text-gray-500 italic">
                {aiExplanation.disclaimer || "This analysis is for informational purposes only and not financial advice."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">All-Time High</span>
              <span className="text-gray-100 font-medium">
                {formatCurrency(stats.ath)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">All-Time Low</span>
              <span className="text-gray-100 font-medium">
                {formatCurrency(stats.atl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">7d Change</span>
              <span className={formatPercentage(stats.priceChange7d).color}>
                {formatPercentage(stats.priceChange7d).formatted}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">30d Change</span>
              <span className={formatPercentage(stats.priceChange30d).color}>
                {formatPercentage(stats.priceChange30d).formatted}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap Rank</span>
              <span className="text-gray-100 font-medium">
                #{stats.marketCapRank}
              </span>
            </div>
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
              <span className="text-gray-400">Supply Ratio</span>
              <span className="text-gray-100 font-medium">
                {stats.totalSupply 
                  ? `${((stats.circulatingSupply / stats.totalSupply) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
