const express = require('express');
const router = express.Router();
const { getNews } = require('../services/newsService');

// GET /api/news
router.get('/news', async (req, res) => {
  try {
    const { topic = 'general' } = req.query;
    
    // Validate topic
    const validTopics = ['general', 'btc', 'eth', 'altcoins'];
    if (!validTopics.includes(topic)) {
      return res.status(400).json({ 
        error: 'Invalid topic. Valid options are: general, btc, eth, altcoins' 
      });
    }
    
    const articles = await getNews(topic);
    res.json({ articles, topic });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
});

module.exports = router;

