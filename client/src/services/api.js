import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Market Data API
export const marketAPI = {
  getMarketData: async (coinId = 'bitcoin', range = '7d') => {
    const response = await api.get('/market-data', {
      params: { coinId, range }
    });
    return response.data;
  },
  
  getCoinsList: async () => {
    const response = await api.get('/coins-list');
    return response.data;
  },
  
  // Helper to fetch multiple coins data - now using batch endpoint
  getMultipleCoinsData: async (coinIds = [], range = '24h') => {
    try {
      // Use batch endpoint if available
      const response = await api.get('/market-data-batch', {
        params: { 
          coinIds: coinIds.join(','),
          range 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch batch data, falling back to individual calls:', error);
      // Fallback to individual calls if batch fails
      try {
        const promises = coinIds.map(coinId => 
          api.get('/market-data', { params: { coinId, range } })
        );
        const responses = await Promise.all(promises);
        return responses.map(res => res.data);
      } catch (fallbackError) {
        console.error('Failed to fetch multiple coins data:', fallbackError);
        return [];
      }
    }
  }
};

// News API
export const newsAPI = {
  getNews: async (topic = 'general') => {
    const response = await api.get('/news', {
      params: { topic }
    });
    return response.data;
  }
};

// AI Explanation API
export const aiAPI = {
  explainMove: async (coinId, range, question = '') => {
    const response = await api.post('/explain-move', {
      coinId,
      range,
      question
    });
    return response.data;
  }
};

// Subscription API
export const subscribeAPI = {
  subscribe: async (email) => {
    const response = await api.post('/subscribe', { email });
    return response.data;
  },
  
  unsubscribe: async (email) => {
    const response = await api.delete('/unsubscribe', { data: { email } });
    return response.data;
  }
};

export default api;
