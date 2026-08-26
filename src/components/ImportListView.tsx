import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ListPlus,
  Trash2,
  Send,
  Sparkles,
  Layers,
  DollarSign,
  Image as ImageIcon,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Store as StoreIcon,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const ImportListView: React.FC = () => {
  const {
    importQueue,
    stores,
    deleteImportItem,
    batchPushImports,
    setActiveTab,
    addToast,
  } = useApp();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeTabPerItem, setActiveTabPerItem] = useState<{ [itemId: string]: 'general' | 'variants' | 'pricing' | 'ai_copy' | 'images' }>({});
  const [selectedStoresForPush, setSelectedStoresForPush] = useState<string[]>([stores[0]?.id || 'store_shopify_01']);
  const [isPushing, setIsPushing] = useState(false);
  const [optimizingItemId, setOptimizingItemId] = useState<string | null>(null);

  const getItemTab = (id: string) => activeTabPerItem[id] || 'general';
  const setItemTab = (id: string, tab: 'general' | 'variants' | 'pricing' | 'ai_copy' | 'images') => {
    setActiveTabPerItem((prev) => ({ ...prev, [id]: tab }));
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === importQueue.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(importQueue.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePushSelected = async () => {
    if (selectedItemIds.length === 0) {
      addToast({ title: 'Select Products', message: 'Please select at least 1 product to push.', type: 'warning' });
      return;
    }
    if (selectedStoresForPush.length === 0) {
      addToast({ title: 'Select Target Store', message: 'Please select at least 1 store destination.', type: 'warning' });
      return;
    }

    setIsPushing(true);
    try {
      await batchPushImports(selectedItemIds, selectedStoresForPush);
      setSelectedItemIds([]);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err) {
      // handled
    } finally {
      setIsPushing(false);
    }
  };

  const handleAiOptimizeItem = async (item: any) => {
    setOptimizingItemId(item.id);
    try {
      const result = await api.aiOptimizeProduct(item.rawTitle, item.description, 'Imported');
      if (result.optimizedTitle) {
        item.optimizedTitle = result.optimizedTitle;
        item.description = result.engagingDescription;
        item.aiEnhanced = true;
        addToast({
          title: 'AI Copy Generation Complete',
          message: 'SEO Title and bullet points enhanced with Gemini 3.7.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({ title: 'AI Error', message: 'Could not complete AI optimization.', type: 'error' });
    } finally {
      setOptimizingItemId(null);
    }
  };

  if (importQueue.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto mt-8 shadow-xs">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ListPlus className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Your Import List is Empty</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Use the Product Importer to extract trending items from AliExpress, Alibaba, or 1688 and edit them before publishing.
        </p>
        <button
          id="empty-importer-cta"
          onClick={() => setActiveTab('importer')}
          className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          Go to Product Importer →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Bulk Push Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">DSERS-Style Staging Area</span>
            <span className="text-xs text-slate-400">• {importQueue.length} Products Staged</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Import List & Batch Store Publisher
          </h2>
          <p className="text-xs text-slate-500">
            Review variant matrix, customize pricing markups, optimize AI copy, and push directly to your stores.
          </p>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Store Multi-Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium">
            <StoreIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-600 hidden sm:inline">Push to:</span>
            <select
              id="bulk-push-target-store-select"
              value={selectedStoresForPush[0]}
              onChange={(e) => setSelectedStoresForPush([e.target.value])}
              className="bg-transparent font-semibold text-slate-900 outline-hidden cursor-pointer"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.platform.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            id="bulk-push-btn"
            onClick={handlePushSelected}
            disabled={selectedItemIds.length === 0 || isPushing}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isPushing ? 'Pushing Products...' : `Push to Store (${selectedItemIds.length})`}
          </button>
        </div>
      </div>

      {/* Select All Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-600">
        <button
          id="select-all-imports-btn"
          onClick={toggleSelectAll}
          className="flex items-center gap-2 font-medium hover:text-slate-900 transition-colors"
        >
          {selectedItemIds.length === importQueue.length ? (
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>Select All Products ({importQueue.length})</span>
        </button>

        <span>{selectedItemIds.length} of {importQueue.length} selected</span>
      </div>

      {/* Product Cards List */}
      <div className="space-y-6">
        {importQueue.map((item) => {
          const isSelected = selectedItemIds.includes(item.id);
          const currentTab = getItemTab(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'
              }`}
            >
              {/* Card Header Summary */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleSelectItem(item.id)}
                    className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <img
                    src={item.images[0] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200'}
                    alt="Import item"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          item.sourcePlatform === 'aliexpress'
                            ? 'bg-rose-500 text-white'
                            : item.sourcePlatform === 'alibaba'
                            ? 'bg-amber-500 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {item.sourcePlatform.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">{item.supplierName}</span>
                      {item.aiEnhanced && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" /> AI Optimized
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-xl">{item.optimizedTitle}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                      <span>Variants: <strong className="text-slate-800">{item.variants.length}</strong></span>
                      <span>Cost: <strong className="text-slate-800">${item.priceRange.min} - ${item.priceRange.max}</strong></span>
                      <span>Landed Margin: <strong className="text-emerald-600 font-bold">~65%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Single Item Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    id={`ai-optimize-btn-${item.id}`}
                    onClick={() => handleAiOptimizeItem(item)}
                    disabled={optimizingItemId === item.id}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${optimizingItemId === item.id ? 'animate-spin' : ''}`} />
                    {optimizingItemId === item.id ? 'Optimizing...' : 'AI Enhance Copy'}
                  </button>

                  <button
                    id={`delete-import-${item.id}`}
                    onClick={() => deleteImportItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove from import list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="px-5 border-b border-slate-200 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setItemTab(item.id, 'general')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                    currentTab === 'general'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  General & Titles
                </button>
                <button
                  onClick={() => setItemTab(item.id, 'variants')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                    currentTab === 'variants'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Variants Matrix ({item.variants.length})
                </button>
                <button
                  onClick={() => setItemTab(item.id, 'pricing')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                    currentTab === 'pricing'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Smart Pricing & Margins
                </button>
                <button
                  onClick={() => setItemTab(item.id, 'ai_copy')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1 ${
                    currentTab === 'ai_copy'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  AI SEO & Ad Hooks
                </button>
                <button
                  onClick={() => setItemTab(item.id, 'images')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                    currentTab === 'images'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Images ({item.images.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5">
                {/* 1. General Tab */}
                {currentTab === 'general' && (
                  <div className="space-y-4 max-w-3xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Optimized Store Title (SEO Ready)</label>
                      <input
                        type="text"
                        value={item.optimizedTitle}
                        onChange={(e) => {
                          item.optimizedTitle = e.target.value;
                        }}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Original Supplier Title (Reference)</label>
                      <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-600 break-words font-mono">
                        {item.rawTitle}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
                      <textarea
                        rows={4}
                        value={item.description}
                        onChange={(e) => {
                          item.description = e.target.value;
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Variants Tab */}
                {currentTab === 'variants' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Variant SKU</th>
                          <th className="py-2.5 px-3">Option Name</th>
                          <th className="py-2.5 px-3">Supplier Cost</th>
                          <th className="py-2.5 px-3">Shipping Cost</th>
                          <th className="py-2.5 px-3">Your Store Price</th>
                          <th className="py-2.5 px-3">Estimated Profit</th>
                          <th className="py-2.5 px-3">Factory Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {item.variants.map((v) => {
                          const profit = (v.storePrice - v.supplierCost - v.shippingCost).toFixed(2);
                          const marginPct = (((v.storePrice - v.supplierCost - v.shippingCost) / v.storePrice) * 100).toFixed(1);

                          return (
                            <tr key={v.id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 font-mono text-slate-700">{v.sku}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">{v.name}</td>
                              <td className="py-2.5 px-3 text-slate-700">${v.supplierCost.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-slate-500">${v.shippingCost.toFixed(2)}</td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={v.storePrice}
                                  onChange={(e) => {
                                    v.storePrice = Number(e.target.value);
                                  }}
                                  className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-indigo-700 text-xs"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-bold text-emerald-600">
                                +${profit} ({marginPct}%)
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{v.supplierStock} units</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. Pricing Tab */}
                {currentTab === 'pricing' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">AutoVend Dynamic Profit Calculator</h4>
                        <p className="text-[11px] text-slate-500">Auto-applied markup: Cost x 2.8 with .99 charm pricing</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                        Average Margin: 65.4%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Avg Sourcing Unit</span>
                        <strong className="text-slate-900 font-bold">${item.priceRange.min}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Avg Air Freight</span>
                        <strong className="text-slate-900 font-bold">$3.20</strong>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Net Take-Home / Sale</span>
                        <strong className="text-emerald-600 font-bold">+$21.29</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AI SEO & Ad Copy Tab */}
                {currentTab === 'ai_copy' && (
                  <div className="space-y-4 max-w-2xl">
                    <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-purple-900">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Gemini 3.7 Flash Ad Copy & Conversion Angles
                      </div>
                      <p className="text-purple-950/80 text-[11px] leading-relaxed">
                        Viral TikTok Hooks generated for this product:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
                        <li>"POV: You found the aesthetic gadget that replaces 3 different cluttered cables."</li>
                        <li>"If your nightstand looks messy, this is the 10/10 fix you need to see."</li>
                        <li>"Stop overpaying for brand names when this factory edition has the exact same fast Qi2 chip."</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 5. Images Tab */}
                {currentTab === 'images' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {item.images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-square bg-slate-100">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {idx === 0 ? 'Hero Cover' : `#${idx + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
