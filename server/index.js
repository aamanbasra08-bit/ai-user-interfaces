require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import PostgreSQL connection
require('./db/postgres');

// Import routes
const marketDataRoutes = require('./routes/marketData');
const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');
const subscribeRoutes = require('./routes/subscribe');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', marketDataRoutes);
app.use('/api', newsRoutes);
app.use('/api', aiRoutes);
app.use('/api', subscribeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

