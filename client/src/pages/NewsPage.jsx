import { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, 
  Clock, 
  Filter, 
  ExternalLink, 
  Brain,
  MessageSquare,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/Input';
import { newsAPI, aiAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import { SUPPORTED_COINS, getCoinOptions } from '../constants/coins';
import toast from 'react-hot-toast';

// Typewriter effect hook
const useTypewriter = (text, speed = 30) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    indexRef.current = 0;
    
    if (!text) {
      setIsTyping(false);
      return;
    }
    
    setIsTyping(true);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start typing
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(prev => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, speed);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed]);
  
  return { displayText, isTyping };
};

// AI Summary component with typewriter effect
const AISummary = ({ summary }) => {
  const { displayText, isTyping } = useTypewriter(summary, 20);
  
  if (!summary && !displayText) return null;
  
  return (
    <Card className="border-purple-400/30 bg-gradient-to-br from-purple-400/5 to-crypto-lime/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI News Summary
          {isTyping && (
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1 h-4 bg-crypto-lime animate-pulse" />
              <span className="text-xs text-gray-500">Analyzing...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {displayText}
            {isTyping && <span className="inline-block w-2 h-4 bg-crypto-lime ml-1 animate-pulse" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// News article card
const NewsCard = ({ article }) => {
  return (
    <Card className="hover:scale-[1.02] transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg group-hover:text-crypto-lime transition-colors">
            {article.title}
          </CardTitle>
          <ExternalLink className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-crypto-lime transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {article.urlToImage && (
          <img 
            src={article.urlToImage} 
            alt={article.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <p className="text-gray-400 text-sm line-clamp-3">
          {article.description || 'No description available.'}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-crypto-lime/10">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="font-medium text-crypto-lime/70">
              {article.source}
            </span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-crypto-lime hover:text-crypto-lime-dark transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Read more →
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showQuestionBox, setShowQuestionBox] = useState(false);
  const [newsQuestion, setNewsQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState('');
  
  // Topic options combining general topics and coins
  const topicOptions = [
    { value: 'general', label: 'Top Headlines' },
    { value: 'btc', label: 'Bitcoin' },
    { value: 'eth', label: 'Ethereum' },
    { value: 'altcoins', label: 'Altcoins' },
    ...SUPPORTED_COINS.slice(2).map(coin => ({
      value: coin.id,
      label: coin.name
    }))
  ];
  
  // Fetch news and generate AI summary
  useEffect(() => {
    const fetchNewsAndSummarize = async () => {
      setLoading(true);
      setLoadingAI(true);
      setAiSummary(''); // Clear previous summary
      
      try {
        // Fetch news
        const data = await newsAPI.getNews(selectedTopic);
        setArticles(data.articles || []);
        
        // Generate AI summary
        if (data.articles && data.articles.length > 0) {
          const headlines = data.articles
            .slice(0, 5)
            .map(a => a.title)
            .join('. ');
          
          const summaryPrompt = `Summarize these crypto news headlines: ${headlines}. Provide: 1) Key themes, 2) Market sentiment, 3) Important takeaways.`;
          
          try {
            const response = await aiAPI.explainMove('bitcoin', '24h', summaryPrompt);
            
            // Format the AI response as a summary
            const summary = `📊 Market Overview:\n${response.explanation.whatHappened || response.explanation.summary || 'The crypto market shows mixed signals today.'}\n\n🔑 Key Themes:\n• ${data.articles[0]?.title || 'Market volatility continues'}\n• ${data.articles[1]?.title || 'Institutional interest grows'}\n• ${data.articles[2]?.title || 'Regulatory developments unfold'}\n\n💡 Sentiment: ${selectedTopic === 'general' ? 'Mixed' : 'Focused on ' + selectedTopic.toUpperCase()}\n\n⚠️ Note: This is an AI-generated summary based on recent headlines.`;
            
            setAiSummary(summary);
          } catch (aiError) {
            console.error('AI summary error:', aiError);
            // Fallback summary
            setAiSummary(`📊 Latest ${selectedTopic === 'general' ? 'Crypto' : selectedTopic.toUpperCase()} News Summary:\n\nWe found ${data.articles.length} recent articles about ${selectedTopic === 'general' ? 'cryptocurrency markets' : selectedTopic}.\n\n🔑 Top Stories:\n${data.articles.slice(0, 3).map((a, i) => `${i + 1}. ${a.title}`).join('\n')}\n\n💡 Market Sentiment: Active\n\n⚠️ Stay informed with the latest developments below.`);
          }
        }
      } catch (error) {
        toast.error('Failed to fetch news');
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingAI(false);
      }
    };
    
    fetchNewsAndSummarize();
  }, [selectedTopic]);
  
  const handleAskQuestion = async () => {
    if (!newsQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    setAskingQuestion(true);
    try {
      // Create context from news articles
      const newsContext = articles
        .slice(0, 5)
        .map(a => `${a.title}: ${a.description}`)
        .join(' ');
      
      const prompt = `Based on these news articles: ${newsContext}\n\nQuestion: ${newsQuestion}`;
      
      const response = await aiAPI.explainMove('bitcoin', '24h', prompt);
      setQuestionAnswer(response.explanation.summary || response.explanation.whatHappened || 'Based on the recent news, the market shows dynamic activity.');
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error(error);
    } finally {
      setAskingQuestion(false);
    }
  };
  
  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-400/10">
            <Newspaper className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-crypto-lime mb-2">Crypto News & AI Insights</h1>
            <p className="text-gray-400">
              Latest cryptocurrency news with AI-powered summaries and analysis. 
              Stay informed with real-time market updates.
            </p>
          </div>
          <Select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setShowQuestionBox(false);
              setQuestionAnswer('');
            }}
            options={topicOptions}
            className="w-48"
          />
        </div>
      </div>
      
      {/* AI Summary with Typewriter Effect */}
      {loadingAI ? (
        <Card className="mb-8 border-purple-400/30">
          <CardContent className="py-12">
            <div className="flex flex-col items-center">
              <Brain className="w-12 h-12 text-purple-400 animate-pulse mb-4" />
              <p className="text-crypto-lime animate-pulse">Generating AI summary...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <AISummary summary={aiSummary} />
          
          {/* Ask Questions Button */}
          {aiSummary && (
            <div className="mt-4 mb-8">
              {!showQuestionBox ? (
                <Button
                  onClick={() => setShowQuestionBox(true)}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask questions about this news
                </Button>
              ) : (
                <Card className="border-crypto-lime/30">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <TextArea
                        placeholder="Ask any question about the news articles..."
                        value={newsQuestion}
                        onChange={(e) => setNewsQuestion(e.target.value)}
                        rows={3}
                        className="w-full"
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAskQuestion}
                          disabled={askingQuestion || !newsQuestion.trim()}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-crypto-lime"
                        >
                          {askingQuestion ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Get Answer
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowQuestionBox(false);
                            setNewsQuestion('');
                            setQuestionAnswer('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      {questionAnswer && (
                        <div className="p-4 bg-purple-400/10 rounded-lg">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {questionAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
      
      {/* News Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Articles</p>
                <p className="text-2xl font-bold text-gray-100">{articles.length}</p>
              </div>
              <Newspaper className="w-8 h-8 text-crypto-lime opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Topic</p>
                <p className="text-lg font-bold text-gray-100">
                  {topicOptions.find(t => t.value === selectedTopic)?.label}
                </p>
              </div>
              <Filter className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">AI Status</p>
                <p className="text-lg font-bold text-crypto-lime">Active</p>
              </div>
              <Brain className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sources</p>
                <p className="text-2xl font-bold text-gray-100">
                  {new Set(articles.map(a => a.source)).size}
                </p>
              </div>
              <ExternalLink className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* News Articles */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-crypto-bg-secondary rounded w-3/4 mb-3" />
                  <div className="h-32 bg-crypto-bg-secondary rounded mb-3" />
                  <div className="h-3 bg-crypto-bg-secondary rounded w-full mb-2" />
                  <div className="h-3 bg-crypto-bg-secondary rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No articles found for this topic</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};