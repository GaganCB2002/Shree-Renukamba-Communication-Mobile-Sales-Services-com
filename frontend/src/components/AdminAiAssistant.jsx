import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, TrendingUp, BarChart3, Lightbulb, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { chatWithAdminAI } from '../api/aiApi';

const insights = [
  { label: 'Revenue Analysis', icon: TrendingUp, text: 'Analyze my revenue trends this month' },
  { label: 'Repair Insights', icon: BarChart3, text: 'Give me repair queue insights' },
  { label: 'Suggestions', icon: Lightbulb, text: 'What can I improve in my shop?' },
  { label: 'Inventory Tips', icon: AlertCircle, text: 'Analyze my inventory health' },
];

const AdminAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Welcome Admin! I\'m your AI Business Analyst. I can analyze your shop data, provide insights on repairs, revenue, inventory, customers, and more. How can I help you optimize your business today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const message = text || input;
    if (!message.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatWithAdminAI(message, sessionId);
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error fetching analytics. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInsight = (text) => {
    handleSend(text);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
        aria-label="Open AI Analytics Assistant"
      >
        <Bot size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="absolute bottom-16 right-0 w-[300px] md:w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up mb-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div>
                <p className="font-bold text-xs">AI Business Analyst</p>
                <p className="text-[9px] text-indigo-200">Real-time analytics & insights</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[280px] overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50" style={{ overscrollBehavior: 'contain' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20'
                    : 'bg-purple-100 dark:bg-purple-500/20'
                }`}>
                  {msg.role === 'user' ? (
                    <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Bot size={14} className="text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-md'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-md border border-slate-100 dark:border-slate-600'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[88%]">
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 rounded-tl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Insights */}
        {messages.length < 3 && (
          <div className="px-4 pb-2 pt-1 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-medium flex items-center gap-1">
              <Zap size={10} /> Quick insights:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {insights.map((insight, i) => (
                <button
                  key={i}
                  onClick={() => handleInsight(insight.text)}
                  className="text-[11px] px-2.5 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1.5"
                >
                  <insight.icon size={12} className="text-indigo-500 shrink-0" />
                  <span>{insight.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your business data..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAiAssistant;
