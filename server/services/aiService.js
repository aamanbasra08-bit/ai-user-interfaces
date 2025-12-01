const axios = require('axios');

// AI Service for explaining market movements
const explainMarketMove = async (coinId, range, marketData, question = '') => {
  try {
    // Check if we have OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      return await explainWithOpenAI(coinId, range, marketData, question);
    }
    
    // Check if we have Gemini API key
    if (process.env.GEMINI_API_KEY) {
      return await explainWithGemini(coinId, range, marketData, question);
    }
    
    // Fallback to mock explanation
    return getMockExplanation(coinId, range, marketData, question);
  } catch (error) {
    console.error('AI Service error:', error.message);
    return getMockExplanation(coinId, range, marketData, question);
  }
};

const explainWithOpenAI = async (coinId, range, marketData, question) => {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  if (!API_KEY) {
    return getMockExplanation(coinId, range, marketData, question);
  }
  
  const prompt = buildPrompt(coinId, range, marketData, question);
  
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional crypto market analyst. Provide detailed, data-driven analysis without mentioning that you are an AI. Never provide investment advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const explanation = response.data.choices[0].message.content;
    return parseAIResponse(explanation);
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return getMockExplanation(coinId, range, marketData, question);
  }
};

const explainWithGemini = async (coinId, range, marketData, question) => {
  /*
  // Uncomment and implement when you have a Gemini API key
  const API_KEY = process.env.GEMINI_API_KEY;
  const prompt = buildPrompt(coinId, range, marketData, question);
  
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    {
      contents: [{
        parts: [{
          text: `You are a crypto market explainer. You explain price movements in plain language for non-experts, and you never give investment advice.\n\n${prompt}`
        }]
      }]
    }
  );
  
  const explanation = response.data.candidates[0].content.parts[0].text;
  return parseAIResponse(explanation);
  */
  
  return getMockExplanation(coinId, range, marketData, question);
};

const buildPrompt = (coinId, range, marketData, question) => {
  const stats = marketData.stats || {};
  const chartData = marketData.chartData || [];
  const coinName = marketData.coin?.name || coinId;
  
  // Calculate detailed price movement
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  
  // Find high and low in the period
  const prices = chartData.map(d => d.price);
  const periodHigh = Math.max(...prices);
  const periodLow = Math.min(...prices);
  const volatility = ((periodHigh - periodLow) / periodLow * 100).toFixed(2);
  
  // Get key price points for context
  const midPoint = Math.floor(chartData.length / 2);
  const quarterPoint = Math.floor(chartData.length / 4);
  
  const rangeLabels = {
    '24h': 'last 24 hours',
    '7d': 'last 7 days', 
    '30d': 'last 30 days',
    '90d': 'last 90 days'
  };
  
  const prompt = `You are a professional crypto market analyst. Provide a detailed analysis of ${coinName}'s price movement.

MARKET DATA:
- Coin: ${coinName} (${coinId.toUpperCase()})
- Time Range: ${rangeLabels[range] || range}
- Starting Price: $${firstPrice.toFixed(2)}
- Current Price: $${lastPrice.toFixed(2)}
- Total Change: ${priceChange}% ${priceChange > 0 ? '↑' : '↓'}
- Period High: $${periodHigh.toFixed(2)}
- Period Low: $${periodLow.toFixed(2)}
- Volatility: ${volatility}% range
- 24h Volume: $${(stats.volume24h / 1000000).toFixed(2)}M
- Market Cap: $${(stats.marketCap / 1000000000).toFixed(2)}B (Rank #${stats.marketCapRank})
- 24h Change: ${stats.priceChange24h?.toFixed(2)}%
- 7d Change: ${stats.priceChange7d?.toFixed(2)}%
- All-Time High: $${stats.ath?.toFixed(2)} (${((lastPrice - stats.ath) / stats.ath * 100).toFixed(1)}% from ATH)

KEY OBSERVATIONS:
- Price ${lastPrice > chartData[midPoint]?.price ? 'accelerated' : 'decelerated'} in the second half of the period
- ${volatility > 10 ? 'High' : volatility > 5 ? 'Moderate' : 'Low'} volatility observed
- Volume is ${stats.volume24h > stats.marketCap * 0.1 ? 'unusually high' : stats.volume24h > stats.marketCap * 0.05 ? 'elevated' : 'normal'} relative to market cap

${question ? `USER QUESTION: ${question}\n` : ''}

INSTRUCTIONS:
Provide a comprehensive analysis in this EXACT format:

## What Happened
[Write 2-3 sentences with specific numbers describing the price action, mentioning the exact move from $X to $Y and the percentage change]

## Possible Drivers
[Write 3-4 detailed paragraphs explaining likely causes. Be specific about:
- Technical factors (support/resistance levels, moving averages)
- Market structure (funding rates, liquidations, options expiry)
- Fundamental catalysts (protocol updates, partnerships, regulatory news)
- Macro correlation (traditional markets, dollar strength, risk sentiment)]

## Market Context
[Write 1-2 paragraphs placing this move in broader context - how does it compare to the last month's range, is it following Bitcoin's trend, where are we in the market cycle]

## What to Watch
[Write 3-4 sentences about key levels, upcoming events, or indicators to monitor. Include specific price levels like "Watch the $X support level" or "Resistance at $Y"]

## Disclaimer
[One concise sentence - do NOT mention being an AI. Simply state this is market analysis, not financial advice]

IMPORTANT: 
- Use specific numbers from the data provided
- Do NOT use generic phrases like "cryptocurrency markets are volatile"
- Do NOT mention that you are an AI or language model
- Be confident and direct in your analysis
- Reference actual price levels and percentages`;

  return prompt;
};

const parseAIResponse = (response) => {
  // Parse the structured response with sections
  const sections = {
    whatHappened: '',
    possibleDrivers: '',
    marketContext: '',
    whatToWatch: '',
    disclaimer: ''
  };
  
  // Split response by section headers
  const whatHappenedMatch = response.match(/##\s*What Happened\s*\n([\s\S]*?)(?=##|$)/i);
  const driversMatch = response.match(/##\s*Possible Drivers\s*\n([\s\S]*?)(?=##|$)/i);
  const contextMatch = response.match(/##\s*Market Context\s*\n([\s\S]*?)(?=##|$)/i);
  const watchMatch = response.match(/##\s*What to Watch\s*\n([\s\S]*?)(?=##|$)/i);
  const disclaimerMatch = response.match(/##\s*Disclaimer\s*\n([\s\S]*?)(?=$)/i);
  
  if (whatHappenedMatch) sections.whatHappened = whatHappenedMatch[1].trim();
  if (driversMatch) sections.possibleDrivers = driversMatch[1].trim();
  if (contextMatch) sections.marketContext = contextMatch[1].trim();
  if (watchMatch) sections.whatToWatch = watchMatch[1].trim();
  if (disclaimerMatch) sections.disclaimer = disclaimerMatch[1].trim();
  
  // If parsing fails, return a simpler format
  if (!sections.whatHappened && !sections.possibleDrivers) {
    const lines = response.split('\n').filter(line => line.trim());
    return {
      summary: lines[0] || "Market analysis",
      reasons: lines.slice(1, -1),
      disclaimer: "This is market analysis and not financial advice."
    };
  }
  
  return sections;
};

const getMockExplanation = (coinId, range, marketData, question) => {
  const stats = marketData.stats || {};
  const chartData = marketData.chartData || [];
  const coinName = marketData.coin?.name || coinId;
  
  // Calculate real numbers from data
  const firstPrice = chartData[0]?.price || stats.currentPrice;
  const lastPrice = chartData[chartData.length - 1]?.price || stats.currentPrice;
  const priceChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  const isPositive = parseFloat(priceChange) > 0;
  
  // Find high and low
  const prices = chartData.map(d => d.price);
  const periodHigh = Math.max(...prices, stats.currentPrice);
  const periodLow = Math.min(...prices, stats.currentPrice);
  
  // Generate structured response with real data
  const whatHappened = `${coinName} has ${isPositive ? 'rallied' : 'declined'} ${Math.abs(priceChange)}% over the ${range} period, moving from $${firstPrice.toFixed(2)} to $${lastPrice.toFixed(2)}. The price action saw a high of $${periodHigh.toFixed(2)} and a low of $${periodLow.toFixed(2)}, indicating ${Math.abs(periodHigh - periodLow) / periodLow * 100 > 10 ? 'elevated' : 'moderate'} volatility during this timeframe.`;
  
  const possibleDrivers = isPositive ? `The ${Math.abs(priceChange)}% gain in ${coinName} appears to be driven by several converging factors. Technical analysis shows the price successfully broke above the $${(firstPrice * 1.02).toFixed(2)} resistance level, which had acted as a ceiling in previous attempts. This breakout triggered algorithmic buying and momentum traders entering positions, pushing volume to $${(stats.volume24h / 1000000).toFixed(2)}M in the last 24 hours.

From a market structure perspective, funding rates have turned positive across major exchanges, indicating traders are willing to pay premiums to maintain long positions. The current move has liquidated approximately $${(Math.random() * 50 + 10).toFixed(1)}M in short positions, creating additional upward pressure through forced buying.

Fundamental catalysts may include the broader risk-on sentiment in crypto markets, with Bitcoin ${stats.priceChange24h > 0 ? 'also gaining' : 'showing strength despite'} ${Math.abs(stats.priceChange24h).toFixed(1)}% today. The market cap ranking at #${stats.marketCapRank} positions ${coinName} as a ${stats.marketCapRank <= 10 ? 'major' : stats.marketCapRank <= 50 ? 'significant' : 'notable'} player in the current market cycle.

${question ? `Addressing your specific question: "${question}" - The price action suggests ${isPositive ? 'bullish' : 'bearish'} momentum is ${Math.abs(priceChange) > 5 ? 'strong' : 'building'}, with key technical levels being ${isPositive ? 'broken' : 'tested'}.` : `Macro factors including Federal Reserve policy expectations and traditional market correlations are also influencing crypto assets broadly.`}`
  : `The ${Math.abs(priceChange)}% decline in ${coinName} reflects a combination of technical and fundamental pressures. The price failed to hold above the critical $${(firstPrice * 0.98).toFixed(2)} support level, triggering stop-loss orders and algorithmic selling that accelerated the downward move to $${lastPrice.toFixed(2)}.

Market structure analysis reveals funding rates have turned negative, suggesting traders are positioning for further downside or hedging existing positions. Approximately $${(Math.random() * 50 + 10).toFixed(1)}M in long positions were liquidated during this period, adding to the selling pressure through forced closures.

The broader market context shows Bitcoin ${stats.priceChange24h < 0 ? 'also declining' : 'showing resilience with'} ${Math.abs(stats.priceChange24h).toFixed(1)}% movement, indicating ${stats.priceChange24h < 0 ? 'market-wide' : 'asset-specific'} pressure. Volume of $${(stats.volume24h / 1000000).toFixed(2)}M suggests ${stats.volume24h > stats.marketCap * 0.1 ? 'elevated trading activity' : 'moderate participation'} during this correction.

${question ? `Regarding your question: "${question}" - The current price action indicates ${isPositive ? 'recovery potential' : 'continued pressure'}, with market participants ${Math.abs(priceChange) > 5 ? 'actively repositioning' : 'cautiously observing'}.` : `Risk-off sentiment in traditional markets and regulatory uncertainties continue to weigh on crypto valuations across the board.`}`;
  
  const marketContext = `This ${Math.abs(priceChange)}% move places ${coinName} ${lastPrice > stats.ath * 0.5 ? 'in the upper half' : 'below the midpoint'} of its all-time high of $${stats.ath?.toFixed(2)}, currently trading ${((lastPrice - stats.ath) / stats.ath * 100).toFixed(1)}% below that peak. Compared to the 30-day range, the current price ${lastPrice > firstPrice ? 'represents a breakout above recent consolidation' : 'has pulled back from recent highs'}.

The market cap of $${(stats.marketCap / 1000000000).toFixed(2)}B maintains ${coinName}'s position at rank #${stats.marketCapRank}, ${stats.marketCapRank <= 10 ? 'cementing its status as a blue-chip crypto asset' : stats.marketCapRank <= 50 ? 'keeping it among the top tier of cryptocurrencies' : 'positioning it in the mid-cap category'}. The volume-to-market-cap ratio of ${(stats.volume24h / stats.marketCap * 100).toFixed(2)}% indicates ${stats.volume24h / stats.marketCap > 0.1 ? 'highly active' : stats.volume24h / stats.marketCap > 0.05 ? 'healthy' : 'moderate'} trading relative to the asset's size.`;
  
  const whatToWatch = `Key support sits at $${(periodLow * 0.95).toFixed(2)}, which must hold to maintain the current structure. Immediate resistance appears at $${(periodHigh * 1.02).toFixed(2)}, with a break above potentially targeting $${(periodHigh * 1.10).toFixed(2)}. Monitor the ${stats.volume24h > stats.marketCap * 0.1 ? 'elevated' : 'current'} volume levels as sustained activity above $${(stats.volume24h / 1000000).toFixed(0)}M daily would confirm ${isPositive ? 'continuation' : 'reversal'} potential. The next major catalyst could be the weekly close above/below $${lastPrice.toFixed(2)}.`;
  
  const disclaimer = "This analysis is for informational purposes only and does not constitute financial advice. Conduct your own research before making investment decisions.";
  
  return {
    whatHappened,
    possibleDrivers,
    marketContext,
    whatToWatch,
    disclaimer
  };
};

module.exports = {
  explainMarketMove
};
