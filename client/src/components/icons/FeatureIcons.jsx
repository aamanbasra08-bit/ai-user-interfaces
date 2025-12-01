import {
  Home,
  TrendingUp,
  Newspaper,
  Brain,
  Info,
  Activity,
  BarChart3,
  CandlestickChart,
  Settings,
  Gauge,
  Sparkles
} from 'lucide-react';

// Map of feature types to their icons
const iconMap = {
  home: Home,
  tracker: CandlestickChart,
  news: Newspaper,
  ai: Brain,
  advanced: Gauge,
  activity: Activity,
  chart: BarChart3,
  trending: TrendingUp,
  settings: Settings,
  sparkles: Sparkles
};

// Feature Icon Component
export const FeatureIcon = ({ type, className = '', ...props }) => {
  const Icon = iconMap[type] || Activity;
  return <Icon className={`w-6 h-6 ${className}`} {...props} />;
};

// Named exports for direct use
export const HomeIcon = (props) => <Home className="w-6 h-6" {...props} />;
export const TrackerIcon = (props) => <CandlestickChart className="w-6 h-6" {...props} />;
export const NewsIcon = (props) => <Newspaper className="w-6 h-6" {...props} />;
export const AIIcon = (props) => <Brain className="w-6 h-6" {...props} />;
export const AdvancedIcon = (props) => <Gauge className="w-6 h-6" {...props} />;

