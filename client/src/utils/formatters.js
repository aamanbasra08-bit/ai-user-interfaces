// Format large numbers with K, M, B suffixes
export const formatNumber = (num) => {
  if (!num) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (absNum >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (absNum >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  
  return num.toFixed(2);
};

// Format currency with proper decimals
export const formatCurrency = (value, decimals = 2) => {
  if (!value) return '$0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
};

// Format percentage with color
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0.00%';
  
  const formatted = `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  const color = value > 0 ? 'text-crypto-green' : value < 0 ? 'text-crypto-red' : 'text-gray-400';
  
  return { formatted, color };
};

// Format date/time
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Format chart date based on range
export const formatChartDate = (timestamp, range) => {
  const date = new Date(timestamp);
  
  if (range === '24h') {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  }
  
  if (range === '7d') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: 'numeric',
      hour12: true
    });
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric'
  });
};

