const express = require('express');
const router = express.Router();
const { explainMarketMove } = require('../services/aiService');
const { getMarketData } = require('../services/coinGeckoService');

// POST /api/explain-move
router.post('/explain-move', async (req, res) => {
  try {
    const { coinId = 'bitcoin', range = '24h', question = '' } = req.body;
    
    // Validate inputs
    if (!coinId) {
      return res.status(400).json({ 
        error: 'coinId is required' 
      });
    }
    
    const validRanges = ['24h', '7d', '30d', '90d'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({ 
        error: 'Invalid range. Valid options are: 24h, 7d, 30d, 90d' 
      });
    }
    
    // Get market data for context
    const marketData = await getMarketData(coinId, range);
    
    // Get AI explanation
    const explanation = await explainMarketMove(coinId, range, marketData, question);
    
    res.json({
      coinId,
      range,
      explanation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI explanation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      message: error.message 
    });
  }
});

module.exports = router;

