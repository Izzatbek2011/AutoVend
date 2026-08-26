import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DownloadCloud,
  Sparkles,
  Link2,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProductImporterView: React.FC = () => {
  const { importFromUrl, setActiveTab, addToast } = useApp();

  const [inputUrl, setInputUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'aliexpress' | 'alibaba' | '1688'>('aliexpress');
  const [autoAiEnhance, setAutoAiEnhance] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const winningPresets = [
    {
      title: 'Nordic Ultrasonic Flame Mist Aroma Diffuser & Humidifier',
      category: 'Home & Decor',
      platform: 'aliexpress' as const,
      url: 'https://aliexpress.com/item/1005009182301.html',
      supplierCost: '$6.80',
      suggestedRetail: '$34.99',
      margin: '80.5%',
      viralScore: '96/100',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
      supplierName: 'Shenzhen Apex Aroma Tech',
    },
    {
      title: 'Ultra-Precision Smart Health Ring Sleep & Heart Monitor',
      category: 'Fitness & Wearables',
      platform: 'alibaba' as const,
      url: 'https://alibaba.com/product/smart-health-ring-v8.html',
      supplierCost: '$16.50',
      suggestedRetail: '$69.95',
      margin: '76.4%',
      viralScore: '94/100',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
      supplierName: 'Yiwu Huanuo Bio-Sensors',
    },
    {
      title: 'Aviation Alloy MagSafe Car Fast-Charge Qi2 Vent Mount',
      category: 'Auto & Mobile',
      platform: '1688' as const,
      url: 'https://1688.com/offer/692019482910.html',
      supplierCost: '$4.20',
      suggestedRetail: '$24.99',
      margin: '83.2%',
      viralScore: '92/100',
      image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=500&auto=format&fit=crop&q=80',
      supplierName: 'Dongguan Jumei Factory (Direct)',
    },
    {
      title: 'SonicClean Pro 45kHz High-Frequency Jewelry & Glasses Cleaner',
      category: 'Lifestyle Tools',
      platform: 'aliexpress' as const,
      url: 'https://aliexpress.com/item/100500829104.html',
      supplierCost: '$8.90',
      suggestedRetail: '$39.99',
      margin: '77.7%',
      viralScore: '89/100',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80',
      supplierName: 'Shenzhen Apex Smart Co.',
    },
  ];

  const handleImport = async (urlToUse?: string, platformToUse?: string) => {
    const url = urlToUse || inputUrl;
    if (!url) {
      addToast({
        title: 'URL Required',
        message: 'Please paste a valid AliExpress, Alibaba, or 1688 product URL.',
        type: 'warning',
      });
      return;
    }

    setIsImporting(true);
    try {
      await importFromUrl(url, platformToUse || selectedPlatform);
      setInputUrl('');
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err) {
      // handled in context
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Importer Hero Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Universal Multi-Supplier Importer
            </span>
            <span className="text-xs text-slate-500">• 1-Click Product & Variant Ingestion</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Import Products from AliExpress, Alibaba, or 1688
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            AutoVend extracts high-resolution image galleries, all variant SKU options, real-time factory wholesale pricing, package specs, and uses Gemini 3.7 AI to rewrite high-converting SEO copy.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            id="platform-tab-aliexpress"
            onClick={() => setSelectedPlatform('aliexpress')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedPlatform === 'aliexpress'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white"></span>
            AliExpress (Fast Dispatch & 0 MOQ)
          </button>
          <button
            id="platform-tab-alibaba"
            onClick={() => setSelectedPlatform('alibaba')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedPlatform === 'alibaba'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Alibaba (Gold Verified & Tiered Wholesale)
          </button>
          <button
            id="platform-tab-1688"
            onClick={() => setSelectedPlatform('1688')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedPlatform === '1688'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white"></span>
            1688 Direct Factory (Lowest Landed Cost)
          </button>
        </div>

        {/* Main URL Input Form */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="importer-url-input"
              type="url"
              placeholder={`Paste any ${selectedPlatform.toUpperCase()} product URL (e.g. https://${selectedPlatform}.com/item/100500...)`}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden"
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            />
          </div>

          <button
            id="importer-submit-btn"
            onClick={() => handleImport()}
            disabled={isImporting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            <DownloadCloud className={`w-4 h-4 ${isImporting ? 'animate-bounce' : ''}`} />
            {isImporting ? 'Extracting SKU Matrix...' : 'Import to Queue'}
          </button>
        </div>

        {/* AI & Auto Pricing Options */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id="toggle-ai-enhance"
              type="checkbox"
              checked={autoAiEnhance}
              onChange={(e) => setAutoAiEnhance(e.target.checked)}
              className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Enable Gemini 3.7 AI Optimization on Import (Title, Description, Ad Hooks)
            </span>
          </label>

          <button
            id="view-import-list-link"
            onClick={() => setActiveTab('import_list')}
            className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            Review Import List Queue →
          </button>
        </div>
      </div>

      {/* Chrome Extension Simulation Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">AutoVend Chrome Extension Simulation</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Connected & Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Browsing supplier sites directly? The AutoVend 1-Click button appears right on AliExpress, Alibaba, and 1688 product pages for instant store synchronization.
            </p>
          </div>
        </div>

        <button
          id="test-extension-sim-btn"
          onClick={() => handleImport('https://aliexpress.com/item/10050098410294.html', 'aliexpress')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white whitespace-nowrap transition-colors"
        >
          Simulate 1-Click Extension Grab
        </button>
      </div>

      {/* High-Converting Trending Winning Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Vetted High-Margin Winning Products</h3>
            <p className="text-xs text-slate-500">Curated factory items with verified suppliers, fast air freight, and high TikTok viral velocity</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Updated Hourly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {winningPresets.map((preset, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={preset.image}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded shadow-sm ${
                        preset.platform === 'aliexpress'
                          ? 'bg-rose-500 text-white'
                          : preset.platform === 'alibaba'
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {preset.platform.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Viral {preset.viralScore}
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{preset.category}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">{preset.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{preset.supplierName}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Supplier Cost</span>
                      <span className="font-bold text-slate-800">{preset.supplierCost}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Suggested Store</span>
                      <span className="font-bold text-emerald-600">{preset.suggestedRetail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  id={`import-winning-btn-${idx}`}
                  onClick={() => handleImport(preset.url, preset.platform)}
                  disabled={isImporting}
                  className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  1-Click Import ({preset.margin} Margin)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
