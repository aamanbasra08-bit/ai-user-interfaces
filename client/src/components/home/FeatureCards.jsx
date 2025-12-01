import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { TrackerIcon, NewsIcon, AIIcon, AdvancedIcon } from '../icons/FeatureIcons';

const features = [
  {
    title: 'Live Crypto Tracker',
    description: 'Real-time price tracking with interactive charts and comprehensive market data',
    icon: TrackerIcon,
    href: '/tracker',
    color: 'from-crypto-lime/20 to-crypto-green/20',
    borderColor: 'hover:border-crypto-lime/50',
    iconBg: 'bg-crypto-lime/10',
    iconColor: 'text-crypto-lime',
    stats: '50+ Coins'
  },
  {
    title: 'News Feed',
    description: 'Latest breaking news and market updates from trusted cryptocurrency sources',
    icon: NewsIcon,
    href: '/news',
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'hover:border-blue-400/50',
    iconBg: 'bg-blue-400/10',
    iconColor: 'text-blue-400',
    stats: '24/7 Updates'
  },
  {
    title: 'AI Market Explainer',
    description: 'Understand complex price movements with GPT-powered analysis and insights',
    icon: AIIcon,
    href: '/ai-explainer',
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'hover:border-purple-400/50',
    iconBg: 'bg-purple-400/10',
    iconColor: 'text-purple-400',
    stats: 'AI Powered'
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep dive into metrics, supply data, volatility analysis, and market statistics',
    icon: AdvancedIcon,
    href: '/advanced',
    color: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'hover:border-orange-400/50',
    iconBg: 'bg-orange-400/10',
    iconColor: 'text-orange-400',
    stats: 'Pro Tools'
  },
];

const FeatureCard = ({ feature, index }) => {
  const navigate = useNavigate();
  const Icon = feature.icon;
  
  return (
    <div
      onClick={() => navigate(feature.href)}
      className={`
        feature-card group relative overflow-hidden cursor-pointer
        bg-crypto-bg-card/40 backdrop-blur-xl
        border border-white/5 ${feature.borderColor}
        rounded-2xl p-6
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:shadow-2xl
        animate-fade-in
      `}
      style={{ 
        animationDelay: `${index * 100}ms`,
        background: `linear-gradient(135deg, transparent, rgba(132, 204, 22, 0.02))`
      }}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${feature.iconColor}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">{feature.stats}</span>
            <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-crypto-lime transition-colors duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 transform" />
          </div>
        </div>
        
        {/* Text Content */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-crypto-lime transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          {feature.description}
        </p>
        
        {/* Hover Indicator */}
        <div className="mt-4 flex items-center gap-2 text-crypto-lime opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
          <span className="text-sm font-medium">Explore</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-crypto-lime/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
};

export const FeatureCards = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crypto-lime/5 border border-crypto-lime/20 mb-4">
            <Sparkles className="w-4 h-4 text-crypto-lime" />
            <span className="text-crypto-lime text-sm font-medium">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Track Crypto
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Professional tools and insights to help you make informed decisions in the cryptocurrency market
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
