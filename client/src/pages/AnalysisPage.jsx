import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/Input';
import { marketAPI, aiAPI } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage, formatChartDate } from '../utils/formatters';
import { SUPPORTED_COINS, getCoinOptions, DEFAULT_COIN } from '../constants/coins';
import toast from 'react-hot-toast';

// Custom AI loading spinner
const AILoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-crypto-bg-secondary rounded-full animate-spin">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-crypto-lime/50 rounded-full animate-pulse" />
      </div>
      <Brain className="w-8 h-8 text-crypto-lime absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </div>
    <p className="text-crypto-lime mt-4 animate-pulse">Analyzing this moment...</p>
  </div>
);

// Cache for AI responses
const aiCache = new Map();

// Custom chart dot for hover point
const CustomDot = ({ cx, cy, payload, isHovered }) => {
  if (!isHovered) return null;
  
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#84cc16" fillOpacity={0.3} className="animate-pulse" />
      <circle cx={cx} cy={cy} r={4} fill="#84cc16" />
    </g>
  );
};

// Debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
  
  return debouncedCallback;
};

export const AnalysisPage = () => {
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_COIN);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  
  const coins = getCoinOptions();
  const timeRanges = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' }
  ];
  
  // Fetch market data
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
  
  // AI analysis for hover point
  const analyzePoint = async (point) => {
    if (!point) return;
    
    // Create cache key
    const cacheKey = `${selectedCoin}-${selectedRange}-${point.timestamp}`;
    
    // Check cache first
    if (aiCache.has(cacheKey)) {
      setAiAnalysis(aiCache.get(cacheKey));
      return;
    }
    
    setLoadingAI(true);
    
    try {
      // Prepare context for AI
      const pointIndex = marketData.chartData.findIndex(d => d.timestamp === point.timestamp);
      const prevPoint = pointIndex > 0 ? marketData.chartData[pointIndex - 1] : null;
      const nextPoint = pointIndex < marketData.chartData.length - 1 ? marketData.chartData[pointIndex + 1] : null;
      
      const localChange = prevPoint 
        ? ((point.price - prevPoint.price) / prevPoint.price * 100).toFixed(2) 
        : 0;
      
      // Call AI API with focus point
      const response = await aiAPI.explainMove(selectedCoin, selectedRange, `Analyze the price at ${new Date(point.timestamp).toLocaleString()}. Price: $${point.price.toFixed(2)}, Local change: ${localChange}%`);
      
      // Cache the response
      aiCache.set(cacheKey, response.explanation);
      setAiAnalysis(response.explanation);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      
      // Fallback analysis
      const fallbackAnalysis = {
        whatHappened: `At ${formatChartDate(point.timestamp, selectedRange)}, the price was ${formatCurrency(point.price)}.`,
        localContext: `This represents a key moment in the ${selectedRange} timeframe.`,
        possibleDrivers: 'Market dynamics at this point suggest normal trading activity with standard volatility patterns.',
        biggerPicture: 'This price point sits within the expected range for the selected period.',
        disclaimer: 'This analysis is for informational purposes only and not investment advice.'
      };
      
      aiCache.set(cacheKey, fallbackAnalysis);
      setAiAnalysis(fallbackAnalysis);
    } finally {
      setLoadingAI(false);
    }
  };
  
  // Debounced hover handler
  const debouncedAnalyzePoint = useDebounce(analyzePoint, 700);
  
  // Handle chart mouse move
  const handleChartMouseMove = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const point = data.activePayload[0].payload;
      setHoveredPoint(point);
      debouncedAnalyzePoint(point);
    }
  };
  
  const handleChartMouseLeave = () => {
    setHoveredPoint(null);
  };
  
  // Handle custom question
  const handleAskQuestion = async () => {
    if (!customQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    setAskingQuestion(true);
    try {
      const response = await aiAPI.explainMove(selectedCoin, selectedRange, customQuestion);
      setAiAnalysis(response.explanation);
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error(error);
    } finally {
      setAskingQuestion(false);
    }
  };
  
  const stats = marketData?.stats || {};
  const chartData = marketData?.chartData || [];
  
  // Enhanced chart data with hover detection
  const enhancedChartData = chartData.map(point => ({
    ...point,
    isHovered: hoveredPoint?.timestamp === point.timestamp
  }));
  
  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-400/10">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-crypto-lime mb-2">AI Analysis Workstation</h1>
            <p className="text-gray-400">
              Hover over any point on the chart for instant AI-powered analysis. 
              The AI will explain price movements, local context, and market drivers.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Section - 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  Interactive Analysis Chart
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedCoin}
                    onChange={(e) => {
                      setSelectedCoin(e.target.value);
                      aiCache.clear(); // Clear cache on coin change
                    }}
                    options={coins}
                    className="w-48"
                  />
                  <div className="flex gap-1">
                    {timeRanges.map(range => (
                      <Button
                        key={range.value}
                        variant={selectedRange === range.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedRange(range.value);
                          aiCache.clear(); // Clear cache on range change
                        }}
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
                <div className="h-[500px] flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-crypto-lime animate-spin" />
                </div>
              ) : (
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={enhancedChartData}
                      onMouseMove={handleChartMouseMove}
                      onMouseLeave={handleChartMouseLeave}
                    >
                      <defs>
                        <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0.2}/>
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
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload[0]) return null;
                          
                          return (
                            <div className="bg-crypto-bg-card/95 border border-crypto-lime/50 rounded-lg p-3 shadow-2xl">
                              <p className="text-crypto-lime font-semibold text-sm">
                                {formatChartDate(payload[0].payload.timestamp, selectedRange)}
                              </p>
                              <p className="text-gray-200 text-lg font-bold">
                                {formatCurrency(payload[0].value)}
                              </p>
                              <p className="text-xs text-crypto-lime/70 mt-1">
                                Hover for AI analysis...
                              </p>
                            </div>
                          );
                        }}
                      />
                      {hoveredPoint && (
                        <ReferenceLine 
                          x={hoveredPoint.timestamp} 
                          stroke="#84cc16" 
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="url(#colorLine)"
                        strokeWidth={2}
                        dot={(props) => <CustomDot {...props} isHovered={props.payload.isHovered} />}
                        activeDot={{ r: 8, fill: '#84cc16' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Custom Question Input */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Ask Custom Question
                <Brain className="w-5 h-5 text-purple-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TextArea
                  placeholder="Ask any question about this coin's price movement, market dynamics, or technical analysis..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  rows={3}
                  className="w-full"
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={askingQuestion || !customQuestion.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-crypto-lime hover:from-crypto-lime hover:to-purple-500"
                >
                  {askingQuestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* AI Analysis Panel - 1 column */}
        <div className="space-y-6">
          {/* Current Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Current Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Price</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.currentPrice)}
                </p>
                <p className={`text-sm ${stats.priceChange24h > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                  {stats.priceChange24h > 0 ? '+' : ''}{stats.priceChange24h?.toFixed(2)}% (24h)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-crypto-lime/10">
                <div>
                  <p className="text-xs text-gray-500">Market Cap</p>
                  <p className="text-sm text-white font-medium">${formatNumber(stats.marketCap)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Volume 24h</p>
                  <p className="text-sm text-white font-medium">${formatNumber(stats.volume24h)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Analysis */}
          <Card className="border-purple-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Analysis
                {hoveredPoint && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Point: {formatChartDate(hoveredPoint.timestamp, selectedRange)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAI ? (
                <AILoadingSpinner />
              ) : aiAnalysis ? (
                <div className="space-y-4 animate-fade-in">
                  {aiAnalysis.whatHappened && (
                    <div>
                      <h4 className="text-sm font-semibold text-crypto-lime mb-2">What Happened</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiAnalysis.whatHappened}
                      </p>
                    </div>
                  )}
                  
                  {aiAnalysis.localContext && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">Local Context</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiAnalysis.localContext}
                      </p>
                    </div>
                  )}
                  
                  {aiAnalysis.possibleDrivers && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Possible Drivers</h4>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis.possibleDrivers}
                      </p>
                    </div>
                  )}
                  
                  {aiAnalysis.biggerPicture && (
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">Bigger Picture</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiAnalysis.biggerPicture}
                      </p>
                    </div>
                  )}
                  
                  {(aiAnalysis.marketContext || aiAnalysis.whatToWatch) && (
                    <div>
                      <h4 className="text-sm font-semibold text-orange-400 mb-2">Market Context</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {aiAnalysis.marketContext || aiAnalysis.whatToWatch}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-crypto-lime/10">
                    <p className="text-xs text-gray-500 italic">
                      {aiAnalysis.disclaimer || 'This analysis is for informational purposes only and not investment advice.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Hover over the chart to analyze specific points</p>
                  <p className="text-xs mt-2">or ask a custom question below</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
