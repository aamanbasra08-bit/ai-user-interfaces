import { useState } from 'react';
import { Mail, Bell, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { subscribeAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const SubscribeBanner = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await subscribeAPI.subscribe(email);
      toast.success(response.message || 'Successfully subscribed!');
      setEmail('');
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-crypto-lime/20 via-crypto-bg-card to-crypto-green/20" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-crypto-lime rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-crypto-green rounded-full blur-3xl" />
          </div>
          
          {/* Content */}
          <div className="relative glass-card border-crypto-lime/20 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crypto-lime/10 border border-crypto-lime/30 mb-6">
                  <Bell className="w-4 h-4 text-crypto-lime animate-pulse" />
                  <span className="text-crypto-lime text-sm font-medium">Newsletter</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Stay Ahead of the
                  <span className="block text-crypto-lime">Next Big Move</span>
                </h3>
                
                <p className="text-gray-400 mb-6">
                  Get exclusive market insights, AI-powered predictions, and breaking news delivered straight to your inbox. Join thousands of traders who never miss an opportunity.
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-crypto-green" />
                    <span>Weekly market analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-crypto-green" />
                    <span>Price alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-crypto-green" />
                    <span>AI insights</span>
                  </div>
                </div>
              </div>
              
              {/* Right Content - Form */}
              <div>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="Enter your best email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubscribing}
                      className="pl-12 pr-4 py-4 text-lg bg-crypto-bg/50 border-crypto-lime/20 focus:border-crypto-lime/50"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubscribing || subscribed}
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-crypto-lime to-crypto-green hover:from-crypto-green hover:to-crypto-lime text-black group"
                  >
                    {subscribed ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        You're Subscribed!
                      </>
                    ) : isSubscribing ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Get Instant Access
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500">
                    🔒 Your privacy is protected. Unsubscribe anytime.
                  </p>
                </form>
                
                {/* Social Proof */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-crypto-lime">10K+</p>
                      <p className="text-xs text-gray-500">Active Subscribers</p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-crypto-lime">95%</p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Sparkles key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">User Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

