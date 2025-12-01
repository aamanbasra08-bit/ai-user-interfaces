const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const getNews = async (topic = 'general') => {
  const cacheKey = `news_${topic}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Check if we have a real NewsAPI key
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (API_KEY) {
      const BASE_URL = process.env.NEWS_API_BASE_URL || 'https://newsapi.org/v2';
      
      let query = 'cryptocurrency OR bitcoin OR ethereum OR crypto';
      if (topic === 'btc') query = 'bitcoin OR BTC';
      if (topic === 'eth') query = 'ethereum OR ETH';
      if (topic === 'altcoins') query = 'altcoin OR defi OR NFT OR solana OR cardano';
      
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 20,
          apiKey: API_KEY
        }
      });
      
      const articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage
      }));
      
      cache.set(cacheKey, articles);
      return articles;
    } else {
      // Return mock news data if no API key
      return getMockNews(topic);
    }
  } catch (error) {
    console.error('News API error:', error.message);
    return getMockNews(topic);
  }
};

const getMockNews = (topic) => {
  const now = new Date();
  const baseNews = [
    {
      title: "Bitcoin Surges Past $50,000 Mark Amid Institutional Interest",
      description: "Bitcoin has broken through the $50,000 resistance level as institutional investors continue to show strong interest in cryptocurrency markets.",
      url: "https://example.com/news/btc-surge",
      source: "Crypto Daily",
      publishedAt: new Date(now - 2 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "Ethereum 2.0 Staking Reaches New All-Time High",
      description: "The amount of ETH staked in Ethereum 2.0 has reached a new record, signaling strong confidence in the network's future.",
      url: "https://example.com/news/eth-staking",
      source: "DeFi News",
      publishedAt: new Date(now - 4 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "SEC Provides Clarity on Crypto Regulations",
      description: "The Securities and Exchange Commission has released new guidelines for cryptocurrency projects, providing much-needed regulatory clarity.",
      url: "https://example.com/news/sec-regulations",
      source: "Finance Weekly",
      publishedAt: new Date(now - 6 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "Major Bank Announces Crypto Custody Services",
      description: "One of the world's largest banks has announced it will begin offering cryptocurrency custody services to institutional clients.",
      url: "https://example.com/news/bank-custody",
      source: "Banking Times",
      publishedAt: new Date(now - 8 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "DeFi Protocol Reaches $10 Billion in Total Value Locked",
      description: "A leading decentralized finance protocol has surpassed $10 billion in total value locked, marking a significant milestone.",
      url: "https://example.com/news/defi-tvl",
      source: "DeFi Pulse",
      publishedAt: new Date(now - 10 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "NFT Marketplace Volume Hits Monthly Record",
      description: "NFT trading volume across major marketplaces has reached an all-time monthly high, driven by increased mainstream adoption.",
      url: "https://example.com/news/nft-volume",
      source: "NFT Weekly",
      publishedAt: new Date(now - 12 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "Central Bank Digital Currency Pilot Program Launches",
      description: "A major economy has launched a pilot program for its central bank digital currency, marking a significant step in digital finance.",
      url: "https://example.com/news/cbdc-pilot",
      source: "Global Finance",
      publishedAt: new Date(now - 14 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    },
    {
      title: "Crypto Exchange Reports Record Trading Volume",
      description: "One of the world's largest cryptocurrency exchanges has reported record-breaking trading volume for the quarter.",
      url: "https://example.com/news/exchange-volume",
      source: "Exchange News",
      publishedAt: new Date(now - 16 * 3600000).toISOString(),
      urlToImage: "https://via.placeholder.com/600x400"
    }
  ];

  // Filter based on topic
  let filtered = baseNews;
  if (topic === 'btc') {
    filtered = baseNews.filter(n => n.title.toLowerCase().includes('bitcoin') || n.title.toLowerCase().includes('btc'));
  } else if (topic === 'eth') {
    filtered = baseNews.filter(n => n.title.toLowerCase().includes('ethereum') || n.title.toLowerCase().includes('eth'));
  } else if (topic === 'altcoins') {
    filtered = baseNews.filter(n => 
      n.title.toLowerCase().includes('defi') || 
      n.title.toLowerCase().includes('nft') ||
      !n.title.toLowerCase().includes('bitcoin') && 
      !n.title.toLowerCase().includes('ethereum')
    );
  }

  // If filtering resulted in too few articles, return all
  return filtered.length > 2 ? filtered : baseNews;
};

module.exports = {
  getNews
};
