import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MarketplaceProduct } from '../types';
import {
  Globe2,
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  Zap,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  Filter,
  DownloadCloud,
  Eye,
  RefreshCw,
  X,
  MapPin,
  Clock,
  Box,
  Scale,
  DollarSign,
  Laptop,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FindSuppliersView: React.FC = () => {
  const { setActiveTab, addToast, importFromUrl } = useApp();

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedShipsFrom, setSelectedShipsFrom] = useState<string>('all');
  const [fastShippingOnly, setFastShippingOnly] = useState<boolean>(false);
  const [moq1Only, setMoq1Only] = useState<boolean>(true);
  const [highMarginOnly, setHighMarginOnly] = useState<boolean>(false);
  
  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState<number>(0);
  const [selectedDestCountry, setSelectedDestCountry] = useState<string>('United States');
  const [importingId, setImportingId] = useState<string | null>(null);

  // In-App Live Storefront Browser Simulator Tab
  const [viewMode, setViewMode] = useState<'grid' | 'browser'>('grid');
  const [browserUrl, setBrowserUrl] = useState<string>('https://aliexpress.com/featured/dropshipping-top-picks');
  const [activeBrowserPlatform, setActiveBrowserPlatform] = useState<'aliexpress' | 'alibaba' | '1688'>('aliexpress');
  const [browserSearchInput, setBrowserSearchInput] = useState<string>('Nordic Flame Aroma Diffuser');

  const categories = [
    'All',
    'Home & Decor',
    'Fitness & Wearables',
    'Auto & Mobile',
    'Lifestyle Tools',
  ];

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMarketplaceProducts({
        keyword: searchKeyword,
        platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        shipsFrom: selectedShipsFrom !== 'all' ? selectedShipsFrom : undefined,
        fastShipping: fastShippingOnly,
        moq1: moq1Only,
        highMargin: highMarginOnly,
      });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [
    selectedPlatform,
    selectedCategory,
    selectedShipsFrom,
    fastShippingOnly,
    moq1Only,
    highMarginOnly,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  const handle1ClickImport = async (prod: MarketplaceProduct) => {
    setImportingId(prod.id);
    try {
      const res = await api.importMarketplaceProduct({
        productId: prod.id,
        autoAiEnhance: true,
      });
      if (res.success) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
          });
        } catch (e) {}

        addToast({
          title: `1-Click Imported from ${(prod.platform || 'Supplier').toUpperCase()}`,
          message: `"${prod.title.slice(0, 40)}..." added to your Import List. Ready to push to Shopify/WooCommerce.`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Import Failed',
        message: 'Could not import product from supplier gateway.',
        type: 'error',
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                Live Supplier Marketplace & Whitelist
              </span>
              <span className="text-xs text-slate-400">• DSers Direct Sourcing Protocol</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Browse & 1-Click Source from AliExpress, Alibaba & 1688
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Access millions of verified factory wholesale items, direct air transit channels, 0-MOQ dropshipping inventory, and real-time landed cost calculation.
            </p>
          </div>

          {/* Mode Switcher: Live Catalog Grid vs In-App Supplier Store Browser */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start lg:self-center shrink-0">
            <button
              id="viewmode-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Sourcing Catalog
            </button>
            <button
              id="viewmode-browser-btn"
              onClick={() => setViewMode('browser')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'browser'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              In-App Store Browser & Extension
            </button>
          </div>
        </div>

        {/* Search and Filters (When in Grid Mode) */}
        {viewMode === 'grid' && (
          <div className="mt-6 space-y-4">
            {/* Search bar + Platform selector */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="marketplace-search-input"
                  type="text"
                  placeholder="Search products, keywords, or SKU (e.g. Flame Diffuser, Smart Ring, MagSafe...)"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                />
              </div>

              {/* Platform selector buttons */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  id="filter-platform-all"
                  onClick={() => setSelectedPlatform('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPlatform === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Gateways
                </button>
                <button
                  type="button"
                  id="filter-platform-aliexpress"
                  onClick={() => setSelectedPlatform('aliexpress')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedPlatform === 'aliexpress'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  AliExpress
                </button>
                <button
                  type="button"
                  id="filter-platform-alibaba"
                  onClick={() => setSelectedPlatform('alibaba')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedPlatform === 'alibaba'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Alibaba
                </button>
                <button
                  type="button"
                  id="filter-platform-1688"
                  onClick={() => setSelectedPlatform('1688')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedPlatform === '1688'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  1688 OEM
                </button>
                <button
                  type="submit"
                  id="marketplace-search-submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
              </div>
            </form>

            {/* Sub-Filters: Categories & Quick Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Warehouse & Attribute Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedShipsFrom}
                  onChange={(e) => setSelectedShipsFrom(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white outline-hidden"
                >
                  <option value="all">Ships From: Anywhere</option>
                  <option value="US">🇺🇸 US Domestic Warehouse</option>
                  <option value="EU">🇪🇺 EU Warehouse (Germany/Spain)</option>
                  <option value="China">🇨🇳 China Central Direct</option>
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={fastShippingOnly}
                    onChange={(e) => setFastShippingOnly(e.target.checked)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-0"
                  />
                  <span>Fast Air (&lt;10 Days)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={highMarginOnly}
                    onChange={(e) => setHighMarginOnly(e.target.checked)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-0"
                  />
                  <span>High Margin (&gt;75%)</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: LIVE SOURCING PRODUCT GRID */}
      {viewMode === 'grid' && (
        <div>
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs font-semibold flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mb-3" />
              <span>Querying live supplier catalogs from AliExpress, Alibaba, and 1688...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs font-semibold">
              No products found matching your current filter criteria. Try resetting the search or category filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const isAli = prod.platform === 'aliexpress';
                const isAlibaba = prod.platform === 'alibaba';
                const is1688 = prod.platform === '1688';
                const platformColor = isAli
                  ? 'bg-rose-500'
                  : isAlibaba
                  ? 'bg-amber-500'
                  : 'bg-indigo-600';

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Platform Tag */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded text-white shadow-xs ${platformColor}`}>
                            {(prod.platform || 'ALIEXPRESS').toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white">
                            {prod.supplierBadge}
                          </span>
                        </div>

                        {/* Profit Margin pill */}
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {prod.profitMargin}% Margin
                        </div>

                        {/* Ships from tag at bottom */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-slate-950/70 backdrop-blur-xs px-2 py-1 rounded-lg">
                          <span className="flex items-center gap-1 truncate">
                            <Truck className="w-3 h-3 text-indigo-300 shrink-0" />
                            {prod.shippingDays} ({prod.shippingCarrier})
                          </span>
                          <span className="font-bold text-emerald-300 shrink-0">+${prod.shippingCost.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>{prod.category}</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {prod.supplierRating} ({prod.supplierOrders.toLocaleString()} sold)
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2" title={prod.title}>
                            {prod.title}
                          </h3>
                        </div>

                        {/* Supplier Info Box */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="truncate max-w-[170px]">🏭 {prod.supplierName}</span>
                            <span className="text-slate-400">MOQ: {prod.moq}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[10px]">
                            <span>📍 {prod.location}</span>
                            <span>⚡ Dispatch: {prod.dispatchTime}</span>
                          </div>
                        </div>

                        {/* Pricing & Profit Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 bg-indigo-50/40 rounded-xl border border-indigo-100/60">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Factory Cost</span>
                            <strong className="text-xs font-bold text-slate-900">${prod.unitCost.toFixed(2)}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Suggested Store</span>
                            <strong className="text-xs font-bold text-slate-900">${prod.suggestedRetail.toFixed(2)}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-700 block font-semibold">Net Profit / Unit</span>
                            <strong className="text-xs font-black text-emerald-600">
                              +${(prod.suggestedRetail - prod.unitCost - prod.shippingCost).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        id={`view-specs-${prod.id}`}
                        onClick={() => {
                          setSelectedProduct(prod);
                          setSelectedImgIdx(0);
                        }}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Specs & Variants
                      </button>

                      <button
                        id={`import-btn-${prod.id}`}
                        disabled={importingId === prod.id}
                        onClick={() => handle1ClickImport(prod)}
                        className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs shadow-indigo-600/20 disabled:opacity-50"
                      >
                        {importingId === prod.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <DownloadCloud className="w-3.5 h-3.5" />
                        )}
                        1-Click Import
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: IN-APP LIVE SUPPLIER STORE BROWSER & EXTENSION SIMULATOR */}
      {viewMode === 'browser' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Chrome Extension Top Bar (DSers-style) */}
          <div className="bg-slate-900 text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">AutoVend Chrome Extension</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Active
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-slate-200">{activeBrowserPlatform.toUpperCase()} Storefront Portal</strong> • Scraper Ready
                </span>
              </div>
            </div>

            {/* Quick 1-Click Import from Browser Bar */}
            <div className="flex items-center gap-2">
              <button
                id="ext-1click-import-btn"
                onClick={() => {
                  const targetProd = products[0];
                  if (targetProd) handle1ClickImport(targetProd);
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                1-Click Import Current Storefront Page
              </button>
              <button
                onClick={() => setActiveTab('import_list')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                View Import Queue
              </button>
            </div>
          </div>

          {/* Browser Address Bar Simulation */}
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center gap-2">
            {/* Platform pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveBrowserPlatform('aliexpress');
                  setBrowserUrl('https://aliexpress.com/store/top-rated-dropship-choice');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeBrowserPlatform === 'aliexpress'
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                AliExpress.com
              </button>
              <button
                onClick={() => {
                  setActiveBrowserPlatform('alibaba');
                  setBrowserUrl('https://alibaba.com/dropshipping/verified-oem-suppliers');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeBrowserPlatform === 'alibaba'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Alibaba.com
              </button>
              <button
                onClick={() => {
                  setActiveBrowserPlatform('1688');
                  setBrowserUrl('https://1688.com/factory-direct/wholesale-crossborder');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeBrowserPlatform === '1688'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                1688.com (Direct)
              </button>
            </div>

            {/* URL Display */}
            <div className="flex-1 flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
              <span className="text-slate-400 mr-1">🔒</span>
              <span className="truncate">{browserUrl}</span>
            </div>

            <button
              onClick={() => fetchCatalog()}
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs"
              title="Refresh simulated page"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Simulated Store Page Content */}
          <div className="p-6 bg-slate-50 min-h-[500px]">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Top Banner on Supplier Page */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-white font-black text-xs rounded uppercase ${
                    activeBrowserPlatform === 'aliexpress' ? 'bg-rose-500' : activeBrowserPlatform === 'alibaba' ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}>
                    {activeBrowserPlatform.toUpperCase()} OFFICIAL
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {activeBrowserPlatform === 'aliexpress' ? 'Shenzhen Apex Smart Technologies Flagship Store' : activeBrowserPlatform === 'alibaba' ? 'Yiwu Huanuo Bio-Sensors & Microelectronics Co.' : 'Dongguan Jumei Electronics OEM Direct Hub'}
                    </h4>
                    <span className="text-xs text-slate-500">★ 4.93 Positive Feedback • 140,000+ Completed Orders • Verified Fast Dispatch</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Dropshipping Supported
                </span>
              </div>

              {/* Product preview on page */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                    <img
                      src={products[0]?.images[0] || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'}
                      alt="Featured product"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <button
                        onClick={() => {
                          if (products[0]) handle1ClickImport(products[0]);
                        }}
                        className="px-4 py-2.5 bg-white text-indigo-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                        AutoVend 1-Click Ingest
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {products[0]?.category || 'Home & Ambient Decor'}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 leading-snug">
                    {products[0]?.title || 'Nordic Ultrasonic Flame Mist Aroma Diffuser & Ambient LED Humidifier'}
                  </h3>

                  {/* Wholesale Pricing Tiers */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">Wholesale Direct Cost:</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl font-black text-rose-600">${products[0]?.unitCost.toFixed(2) || '6.80'}</strong>
                      <span className="text-xs text-slate-400 line-through">$42.00</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                        80.5% Est. Store Margin
                      </span>
                    </div>
                  </div>

                  {/* Shipping calculator */}
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Air Shipping to US/EU:</span>
                      <strong className="text-slate-900">${products[0]?.shippingCost.toFixed(2) || '2.80'} (7-10 Days)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Order Quantity:</span>
                      <strong className="text-emerald-700 font-bold">1 Piece (Zero MOQ Dropship)</strong>
                    </div>
                  </div>

                  {/* 1-Click Import CTA */}
                  <button
                    onClick={() => {
                      if (products[0]) handle1ClickImport(products[0]);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Extract & Add to My Store Import List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PRODUCT SPECS & SOURCING MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded text-white ${
                  selectedProduct.platform === 'aliexpress' ? 'bg-rose-500' : selectedProduct.platform === 'alibaba' ? 'bg-amber-500' : 'bg-indigo-600'
                }`}>
                  {(selectedProduct.platform || 'ALIEXPRESS').toUpperCase()} SOURCING DETAILS
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {selectedProduct.id}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 2 cols: Image carousel + details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carousel */}
              <div className="space-y-3">
                <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={selectedProduct.images[selectedImgIdx] || selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImgIdx === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs & Pricing */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{selectedProduct.category}</span>
                  <h3 className="font-bold text-base text-slate-900 leading-snug mt-0.5">{selectedProduct.title}</h3>
                  <div className="flex items-center gap-3 text-slate-500 mt-1">
                    <span>★ {selectedProduct.supplierRating}</span>
                    <span>• {selectedProduct.supplierOrders.toLocaleString()} Orders</span>
                    <span>• Verified {selectedProduct.supplierBadge}</span>
                  </div>
                </div>

                {/* Price Breakdown Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-600">Factory Wholesale Unit Cost:</span>
                    <strong className="text-sm font-black text-slate-900">${selectedProduct.unitCost.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-600">Air Freight Cost ({selectedProduct.shippingDays}):</span>
                    <strong className="text-sm font-black text-slate-900">${selectedProduct.shippingCost.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold">
                    <span className="text-slate-800">Total Landed Cost:</span>
                    <span className="text-base text-indigo-600 font-extrabold">${(selectedProduct.unitCost + selectedProduct.shippingCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <span>Suggested Retail Profit Margin:</span>
                    <span className="text-sm font-black">+{selectedProduct.profitMargin}% (+${(selectedProduct.suggestedRetail - selectedProduct.unitCost - selectedProduct.shippingCost).toFixed(2)}/unit)</span>
                  </div>
                </div>

                {/* Factory Specifications */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Technical Specifications:</h4>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
                    {Object.entries(selectedProduct.specs || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{k}:</span>
                        <span className="font-semibold text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destination Country Rates */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Check Live Transit Time:</h4>
                  <select
                    value={selectedDestCountry}
                    onChange={(e) => setSelectedDestCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="United States">🇺🇸 United States (YunExpress 6-9 Days • $2.80)</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom (Royal Mail Tracked 5-8 Days • $2.60)</option>
                    <option value="Germany">🇩🇪 Germany / EU Hub (DHL Packet 4-7 Days • $2.90)</option>
                    <option value="Canada">🇨🇦 Canada (Canada Post Dedicated 7-11 Days • $3.40)</option>
                    <option value="Australia">🇦🇺 Australia (Australia Post Express 6-10 Days • $3.20)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      handle1ClickImport(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    1-Click Add to Import List
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setActiveTab('suppliers_compare');
                    }}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    Compare Alternatives
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
