// Central configuration for supported cryptocurrencies
// Used consistently across all dropdowns and selectors in the app

export const SUPPORTED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#14F195' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple', color: '#23292F' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', color: '#14B6E7' }
];

// Helper function to format coin options for dropdowns
export const getCoinOptions = () => {
  return SUPPORTED_COINS.map(coin => ({
    value: coin.id,
    label: `${coin.name} (${coin.symbol})`
  }));
};

// Get coin by ID
export const getCoinById = (coinId) => {
  return SUPPORTED_COINS.find(coin => coin.id === coinId);
};

// Get coin display name
export const getCoinDisplayName = (coinId) => {
  const coin = getCoinById(coinId);
  return coin ? `${coin.name} (${coin.symbol})` : coinId;
};

// Default coin for initial state
export const DEFAULT_COIN = 'bitcoin';

