import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { chatWithLandingAI } from '../api/aiApi';

const quickReplies = [
  { text: 'What products do you sell?', icon: '🛒' },
  { text: 'How much does screen repair cost?', icon: '🔧' },
  { text: 'What are your store hours?', icon: '🕐' },
  { text: 'Where are you located?', icon: '📍' },
];

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! Welcome to SR Communication! I\'m your AI assistant. Ask me about our products, repair services, store hours, or anything else!' },
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
      const data = await chatWithLandingAI(message, sessionId);
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again or contact us at +91 98765 43210.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[300px] md:w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up mb-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <p className="font-bold text-xs">AI Assistant</p>
                  <p className="text-[9px] text-indigo-200">SR Communication</p>
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
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
                <div className="flex items-start gap-2 max-w-[85%]">
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

          {/* Quick Replies */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 pt-1 border-t border-slate-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-medium">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(qr.text)}
                    className="text-[11px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1"
                  >
                    <span>{qr.icon}</span>
                    <span className="truncate max-w-[120px]">{qr.text}</span>
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
                placeholder="Ask me anything..."
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
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 text-center">
              AI assistant may not be accurate. For urgent help, contact +91 98765 43210
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 dark:bg-slate-700 text-white rotate-90'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default AiChatWidget;
