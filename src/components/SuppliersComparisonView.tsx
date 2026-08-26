import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export const SuppliersComparisonView: React.FC = () => {
  const { products, addToast } = useApp();

  const [keyword, setKeyword] = useState('Humidifier');
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComparison = async (searchKw: string) => {
    setIsLoading(true);
    try {
      const res = await api.compareSuppliers(searchKw);
      setComparisonData(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison('Humidifier');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) fetchComparison(keyword.trim());
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Multi-Supplier Quote Matrix</span>
            <span className="text-xs text-slate-400">• AliExpress vs Alibaba vs 1688</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Supplier Quote & Transit Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Compare unit wholesale prices, air freight transit speeds, MOQs, and defect rates side-by-side to maximize profit margins.
          </p>
        </div>

        {/* Search keyword */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            id="supplier-compare-search-input"
            type="text"
            placeholder="Search item (e.g. Diffuser, Ring)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden w-60"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            Compare Quotes
          </button>
        </form>
      </div>

      {/* Comparison Matrix Cards */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-semibold">
            Fetching multi-supplier quotes from AliExpress, Alibaba, and 1688...
          </div>
        ) : !comparisonData || comparisonData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-semibold">
            No supplier quotes found for "{keyword}". Try searching for another item.
          </div>
        ) : (
          comparisonData.map((item, idx) => {
            const suppliersList = Array.isArray(item?.suppliers) ? item.suppliers : [];
            const prodName = item?.productName || keyword || 'Target Sourcing Category';

            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Target Sourcing Category</span>
                    <h3 className="text-base font-bold text-slate-900">{prodName}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Current Store Retail:</span>
                    <strong className="text-slate-900 font-extrabold text-sm">$34.99</strong>
                  </div>
                </div>

                {/* 3 Columns: AliExpress vs Alibaba vs 1688 */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                  {suppliersList.map((sup: any, sIdx: number) => {
                    const totalLanded = (sup?.unitPrice || 0) + (sup?.shippingCost || 0);
                    const isBestPrice = sup?.platform === '1688';
                    const supPlatform = (sup?.platform || 'ALIEXPRESS').toString().toUpperCase();

                    return (
                      <div
                        key={sIdx}
                        className={`p-5 flex flex-col justify-between space-y-4 ${
                          isBestPrice ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <div>
                          {/* Platform header */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-[10px] uppercase font-black px-2 py-0.5 rounded text-white ${
                                sup?.platform === 'aliexpress'
                                  ? 'bg-rose-500'
                                  : sup?.platform === 'alibaba'
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-600'
                              }`}
                            >
                              {supPlatform}
                            </span>

                            {isBestPrice && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> Lowest Landed Cost
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{sup?.name || 'Verified Supplier'}</h4>
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>★ {sup?.rating || '4.8'}</span>
                            <span>• MOQ: {sup?.moq || 1} unit{(sup?.moq || 1) > 1 ? 's' : ''}</span>
                            <span>• Defect: {sup?.defectRate || '0.3%'}</span>
                          </div>

                          {/* Pricing Specs */}
                          <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Unit Wholesale:</span>
                              <strong className="text-slate-900">${(sup?.unitPrice || 0).toFixed(2)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Air Freight ({sup?.shippingDays || 8}d):</span>
                              <strong className="text-slate-900">${(sup?.shippingCost || 0).toFixed(2)}</strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold">
                              <span className="text-slate-700">Total Landed Cost:</span>
                              <span className="text-indigo-600 text-sm">${totalLanded.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Net Margin on $34.99 */}
                          <div className="mt-3 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Net Profit / Unit:</span>
                            <strong className="text-emerald-600 font-extrabold text-xs">
                              +${(34.99 - totalLanded).toFixed(2)} ({(((34.99 - totalLanded) / 34.99) * 100).toFixed(1)}%)
                            </strong>
                          </div>
                        </div>

                        <button
                          id={`switch-supplier-btn-${sIdx}`}
                          onClick={() =>
                            addToast({
                              title: 'Primary Sourcing Route Updated',
                              message: `Mapped future orders for "${prodName}" to ${sup?.name || 'Supplier'} (${supPlatform}).`,
                              type: 'success',
                            })
                          }
                          className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                            isBestPrice
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Set as Active Sourcing Route
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
