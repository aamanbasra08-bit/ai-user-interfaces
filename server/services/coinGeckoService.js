const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 5 minutes to avoid hitting API limits
const cache = new NodeCache({ stdTTL: 300 });

const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

// Helper to determine days from range string
const getRangeDays = (range) => {
  const rangeMap = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  return rangeMap[range] || 7;
};

// Get market data for a specific coin
const getMarketData = async (coinId = 'bitcoin', range = '7d') => {
  const cacheKey = `market_${coinId}_${range}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const days = getRangeDays(range);
    
    // Get current price and stats
    const marketResponse = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: coinId,
        order: 'market_cap_desc',
        per_page: 1,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d,30d'
      }
    });

    // Get historical price data
    const chartResponse = await axios.get(`${BASE_URL}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days > 30 ? 'daily' : 'hourly'
      }
    });

    const coinData = marketResponse.data[0] || {};
    const priceHistory = chartResponse.data.prices || [];

    const result = {
      coin: {
        id: coinData.id,
        symbol: coinData.symbol,
        name: coinData.name,
        image: coinData.image
      },
      stats: {
        currentPrice: coinData.current_price,
        marketCap: coinData.market_cap,
        volume24h: coinData.total_volume,
        priceChange24h: coinData.price_change_percentage_24h,
        priceChange7d: coinData.price_change_percentage_7d_in_currency,
        priceChange30d: coinData.price_change_percentage_30d_in_currency,
        ath: coinData.ath,
        athDate: coinData.ath_date,
        atl: coinData.atl,
        atlDate: coinData.atl_date,
        circulatingSupply: coinData.circulating_supply,
        totalSupply: coinData.total_supply,
        marketCapRank: coinData.market_cap_rank
      },
      chartData: priceHistory.map(([timestamp, price]) => ({
        timestamp,
        date: new Date(timestamp).toISOString(),
        price: price
      }))
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('CoinGecko API error:', error.message);
    
    // Return mock data if API fails
    return getMockMarketData(coinId, range);
  }
};

// Get list of available coins
const getCoinsList = async () => {
  const cacheKey = 'coins_list';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${BASE_URL}/coins/list`);
    const topCoins = response.data.slice(0, 100); // Get top 100 coins
    cache.set(cacheKey, topCoins, 86400); // Cache for 24 hours
    return topCoins;
  } catch (error) {
    console.error('CoinGecko API error:', error.message);
    return getMockCoinsList();
  }
};

// Mock data fallback
const getMockMarketData = (coinId, range) => {
  const now = Date.now();
  const days = getRangeDays(range);
  const dataPoints = days === 1 ? 24 : days;
  
  const basePrice = coinId === 'bitcoin' ? 50000 : coinId === 'ethereum' ? 3000 : 100;
  const volatility = 0.05;

  const chartData = [];
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * (days === 1 ? 3600000 : 86400000);
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + randomChange);
    chartData.push({
      timestamp,
      date: new Date(timestamp).toISOString(),
      price: price
    });
  }

  return {
    coin: {
      id: coinId,
      symbol: coinId === 'bitcoin' ? 'btc' : coinId === 'ethereum' ? 'eth' : coinId.slice(0, 3),
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      image: `https://via.placeholder.com/50`
    },
    stats: {
      currentPrice: basePrice,
      marketCap: basePrice * 19000000,
      volume24h: basePrice * 1000000,
      priceChange24h: (Math.random() - 0.5) * 10,
      priceChange7d: (Math.random() - 0.5) * 20,
      priceChange30d: (Math.random() - 0.5) * 30,
      ath: basePrice * 1.5,
      athDate: new Date(now - 30 * 86400000).toISOString(),
      atl: basePrice * 0.5,
      atlDate: new Date(now - 180 * 86400000).toISOString(),
      circulatingSupply: 19000000,
      totalSupply: 21000000,
      marketCapRank: 1
    },
    chartData
  };
};

const getMockCoinsList = () => {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    { id: 'binancecoin', symbol: 'bnb', name: 'Binance Coin' },
    { id: 'solana', symbol: 'sol', name: 'Solana' },
    { id: 'cardano', symbol: 'ada', name: 'Cardano' },
    { id: 'ripple', symbol: 'xrp', name: 'Ripple' },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot' },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche' },
    { id: 'chainlink', symbol: 'link', name: 'Chainlink' }
  ];
};

module.exports = {
  getMarketData,
  getCoinsList
};

