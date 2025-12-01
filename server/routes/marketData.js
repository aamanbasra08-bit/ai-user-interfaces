const express = require('express');
const router = express.Router();
const { getMarketData, getCoinsList } = require('../services/coinGeckoService');

// GET /api/market-data
router.get('/market-data', async (req, res) => {
  try {
    const { coinId = 'bitcoin', range = '7d' } = req.query;
    
    // Validate range
    const validRanges = ['24h', '7d', '30d', '90d'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({ 
        error: 'Invalid range. Valid options are: 24h, 7d, 30d, 90d' 
      });
    }
    
    const data = await getMarketData(coinId, range);
    res.json(data);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market data',
      message: error.message 
    });
  }
});

// GET /api/coins-list
router.get('/coins-list', async (req, res) => {
  try {
    const coins = await getCoinsList();
    res.json(coins);
  } catch (error) {
    console.error('Coins list error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch coins list',
      message: error.message 
    });
  }
});

// GET /api/market-data-batch - Fetch multiple coins at once
router.get('/market-data-batch', async (req, res) => {
  try {
    const { coinIds, range = '24h' } = req.query;
    
    if (!coinIds) {
      return res.status(400).json({ 
        error: 'coinIds parameter is required' 
      });
    }
    
    // Parse coin IDs (comma-separated string)
    const ids = coinIds.split(',').map(id => id.trim());
    
    // Fetch data for all coins in parallel
    const promises = ids.map(coinId => getMarketData(coinId, range));
    const results = await Promise.all(promises);
    
    res.json(results);
  } catch (error) {
    console.error('Batch market data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch batch market data',
      message: error.message 
    });
  }
});

module.exports = router;
