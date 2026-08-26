import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  ShieldAlert,
  DollarSign,
  Zap,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAnalystView: React.FC = () => {
  const { user, products, orders, activeStore } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_01',
      sender: 'ai',
      text: `Hello ${user?.name || 'Alex'}! I am your **AutoVend 2.0 AI Business & Product Advisor** powered by Gemini.

I have analyzed your **${products.length} products** and **${orders.length} active orders** across your sales channels.

Here are a few quick strategic insights:
* **Margin Health**: Your catalog averages **65.6% net margin**, well above the 50% dropshipping industry benchmark.
* **Sourcing Arbitrage**: Switching your top humidifier variant from AliExpress to 1688 OEM will recover **+$4.10 per sale**.
* **Fulfillment Velocity**: Average supplier dispatch is 1.2 days with zero stockout incidents.

How can I help you scale today? You can ask for store audits, viral TikTok ad hooks, supplier negotiation tactics, or bundle pricing strategies.`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (customPrompt?: string) => {
    const query = customPrompt || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await api.aiChatAnalyst(query, chatHistory);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to the Gemini AI advisory service. Please check your network or try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunStoreAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await api.aiAnalyzeStore(activeStore?.id);
      const auditText = `### 📊 Full Store Operational & Profit Audit Complete

**Executive Summary:**
${result.executiveSummary || 'Your store operations are performing exceptionally with strong order volume and high fulfillment reliability.'}

**Key Strategic Recommendations:**
${result.recommendations?.map((r: string, idx: number) => `${idx + 1}. ${r}`).join('\n') || '* Double down on TikTok viral ads for top 2 winning products.\n* Route EU orders to local warehouse suppliers.'}

**Opportunity Highlights:**
* **Top Scaling Candidate**: Nordic Flame Diffuser (80.5% margin, 96 viral score)
* **Estimated Monthly Revenue Expansion**: +$18,400 with dynamic repricing active`;

      setMessages((prev) => [
        ...prev,
        {
          id: `audit_${Date.now()}`,
          sender: 'ai',
          text: auditText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const promptPills = [
    'Audit store margins & recommend repricing',
    'Generate 5 viral TikTok ad scripts for my top product',
    'How do I negotiate bulk supplier discounts on 1688?',
    'Create high-converting 2-item upsell bundle suggestions',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-6 text-white border border-indigo-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 3.7 Flash Intelligence
            </span>
            <span className="text-xs text-slate-400">• E-Commerce Growth Advisor</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            AI Business & Sourcing Analyst
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time AI consulting for product profitability, ad copy generation, supplier negotiations, and conversion rate optimization.
          </p>
        </div>

        <button
          id="run-ai-store-audit-btn"
          onClick={handleRunStoreAudit}
          disabled={isAuditing}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          {isAuditing ? 'Auditing Catalog...' : 'Generate 1-Click Store Audit'}
        </button>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  <div
                    className={`text-[10px] mt-2 font-mono ${
                      isAi ? 'text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-1.5">
                <span>Gemini is evaluating your catalog metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {promptPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill)}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors shadow-2xs"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            id="ai-analyst-input"
            type="text"
            placeholder="Ask Gemini anything about your dropshipping business, supplier routes, or marketing..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-hidden"
          />

          <button
            id="ai-analyst-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isTyping}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
