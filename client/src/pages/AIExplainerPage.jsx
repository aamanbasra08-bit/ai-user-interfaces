import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, TrendingDown, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { marketAPI, aiAPI } from '../services/api';
import { getCoinOptions, DEFAULT_COIN } from '../constants/coins';
import toast from 'react-hot-toast';

const timeRanges = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

export const AIExplainerPage = () => {
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_COIN);
  const [selectedRange, setSelectedRange] = useState('24h');
  const [question, setQuestion] = useState('');
  const coins = getCoinOptions(); // Use consistent coin options
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [marketData, setMarketData] = useState(null);

  // Fetch market data when coin or range changes
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await marketAPI.getMarketData(selectedCoin, selectedRange);
        setMarketData(data);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };
    
    if (selectedCoin) {
      fetchMarketData();
    }
  }, [selectedCoin, selectedRange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCoin) {
      toast.error('Please select a cryptocurrency');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.explainMove(selectedCoin, selectedRange, question);
      setExplanation(response.explanation);
    } catch (error) {
      toast.error('Failed to generate AI explanation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const priceChange = marketData?.stats?.priceChange24h || 0;
  const isPositive = priceChange > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-400/10">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-crypto-lime mb-2">AI Market Explainer</h1>
            <p className="text-gray-400">
              Get AI-powered explanations for cryptocurrency price movements and market trends. 
              Our AI analyzes recent price data and market conditions to provide clear, understandable insights.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Analysis</CardTitle>
          <CardDescription>
            Select a cryptocurrency and time range to analyze market movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Cryptocurrency
                </label>
                <Select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  options={coins}
                  placeholder="Choose a coin..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Range
                </label>
                <Select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  options={timeRanges}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Specific Question (Optional)
              </label>
              <TextArea
                placeholder="E.g., Why did the price spike at 2 PM? What factors are affecting the current trend?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>

            {marketData && (
              <div className="p-4 bg-crypto-bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Current Market Status</span>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-crypto-green" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-crypto-red" />
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="font-semibold text-gray-100">
                      ${marketData.stats.currentPrice?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">24h Change:</span>
                    <p className={`font-semibold ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Market Cap:</span>
                    <p className="font-semibold text-gray-100">
                      ${(marketData.stats.marketCap / 1e9).toFixed(2)}B
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rank:</span>
                    <p className="font-semibold text-gray-100">
                      #{marketData.stats.marketCapRank}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Analyzing Market Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Explanation Result */}
      {explanation && (
        <Card className="border-purple-400/30 animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <CardTitle>AI Analysis Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* What Happened */}
            {explanation.whatHappened && (
              <div className="p-4 bg-gradient-to-r from-purple-400/10 to-crypto-lime/10 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-crypto-lime mb-2">What Happened</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {explanation.whatHappened}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Possible Drivers */}
            {explanation.possibleDrivers && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-crypto-lime" />
                  Possible Drivers
                </h3>
                <div className="p-4 bg-crypto-bg-secondary rounded-lg">
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {explanation.possibleDrivers}
                  </div>
                </div>
              </div>
            )}

            {/* Market Context */}
            {explanation.marketContext && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                  Market Context
                </h3>
                <div className="p-4 bg-crypto-bg-secondary/50 border border-blue-400/20 rounded-lg">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {explanation.marketContext}
                  </p>
                </div>
              </div>
            )}

            {/* What to Watch */}
            {explanation.whatToWatch && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-yellow-400" />
                  What to Watch
                </h3>
                <div className="p-4 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 border border-yellow-400/20 rounded-lg">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {explanation.whatToWatch}
                  </p>
                </div>
              </div>
            )}

            {/* Legacy format support */}
            {explanation.summary && !explanation.whatHappened && (
              <div className="p-4 bg-gradient-to-r from-purple-400/10 to-crypto-lime/10 rounded-lg">
                <h3 className="font-semibold text-gray-100 mb-2">Summary</h3>
                <p className="text-gray-300">{explanation.summary}</p>
              </div>
            )}
            
            {explanation.reasons && !explanation.possibleDrivers && (
              <div className="space-y-3">
                {explanation.reasons.map((reason, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-crypto-bg-secondary rounded-lg">
                    <span className="text-crypto-lime font-bold">{index + 1}.</span>
                    <p className="text-gray-300 text-sm">{reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-crypto-red/10 border border-crypto-red/30 rounded-lg">
              <p className="text-xs text-gray-400 italic">
                ⚠️ {explanation.disclaimer || "This analysis is for informational purposes only and does not constitute financial advice."}
              </p>
            </div>

            {/* Meta Info */}
            <div className="pt-4 border-t border-crypto-lime/10 flex items-center justify-between text-xs text-gray-500">
              <span>Analysis for {selectedCoin.toUpperCase()} • {selectedRange} timeframe</span>
              <span>Powered by AI</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How AI Market Explainer Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-crypto-lime/10 flex items-center justify-center">
                <span className="text-crypto-lime font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-100 mb-1">Data Collection</h4>
              <p className="text-sm text-gray-400">
                We gather real-time price data, volume, and market metrics
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-crypto-lime/10 flex items-center justify-center">
                <span className="text-crypto-lime font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-100 mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-400">
                Our AI processes patterns and correlates with market events
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-crypto-lime/10 flex items-center justify-center">
                <span className="text-crypto-lime font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-100 mb-1">Clear Insights</h4>
              <p className="text-sm text-gray-400">
                Get explanations in simple language, no expertise required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
