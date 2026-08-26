import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Plus,
  CheckCircle2,
  Trash2,
  Sliders,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export const PricingRulesView: React.FC = () => {
  const {
    pricingRules,
    togglePricingRule,
    applyPricingRules,
    refreshData,
    addToast,
  } = useApp();

  const [testSupplierCost, setTestSupplierCost] = useState<number>(12.8);
  const [testShippingCost, setTestShippingCost] = useState<number>(3.5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // New rule form
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState<'multiplier' | 'fixed_markup' | 'tiered'>('multiplier');
  const [newRuleValue, setNewRuleValue] = useState<number>(2.8);
  const [newCentsEnding, setNewCentsEnding] = useState<'.99' | '.95' | '.00' | 'none'>('.99');

  // Simulation calculation
  const totalCost = testSupplierCost + testShippingCost;
  const activeRule = pricingRules.find((r) => r.isActive) || pricingRules[0];
  
  let simulatedPrice = totalCost * 2.8;
  if (activeRule) {
    if (activeRule.ruleType === 'multiplier' && activeRule.multiplierValue) {
      simulatedPrice = totalCost * activeRule.multiplierValue;
    } else if (activeRule.ruleType === 'fixed_markup' && activeRule.fixedMarkupValue) {
      simulatedPrice = totalCost + activeRule.fixedMarkupValue;
    } else if (activeRule.ruleType === 'tiered' && activeRule.tieredRules) {
      const tier = activeRule.tieredRules.find((t) => totalCost >= t.minCost && totalCost <= t.maxCost);
      simulatedPrice = tier ? totalCost * tier.multiplier + tier.fixedAdd : totalCost * 2.5;
    }
    if (activeRule.centsEnding === '.99') {
      simulatedPrice = Math.floor(simulatedPrice) + 0.99;
    } else if (activeRule.centsEnding === '.95') {
      simulatedPrice = Math.floor(simulatedPrice) + 0.95;
    } else if (activeRule.centsEnding === '.00') {
      simulatedPrice = Math.floor(simulatedPrice);
    }
  }

  const simulatedProfit = (simulatedPrice - totalCost).toFixed(2);
  const simulatedMargin = (((simulatedPrice - totalCost) / simulatedPrice) * 100).toFixed(1);

  const handleApplyAll = async () => {
    setIsApplying(true);
    try {
      await applyPricingRules();
    } finally {
      setIsApplying(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) return;

    try {
      await api.createPricingRule({
        name: newRuleName,
        targetCategory: 'All',
        ruleType: newRuleType,
        multiplierValue: newRuleType === 'multiplier' ? newRuleValue : 2.5,
        fixedMarkupValue: newRuleType === 'fixed_markup' ? newRuleValue : 15,
        includeShippingInCost: true,
        centsEnding: newCentsEnding,
        autoRepriceOnSupplierChange: true,
        isActive: false,
      });
      await refreshData();
      setShowAddModal(false);
      setNewRuleName('');
      addToast({ title: 'Rule Created', message: `Pricing rule "${newRuleName}" added.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to create pricing rule.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Reprice CTA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Dynamic Repricing Engine</span>
            <span className="text-xs text-slate-400">• Automated Profit Protection</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Smart Pricing & Markup Rules
          </h2>
          <p className="text-xs text-slate-500">
            Automatically calculate retail prices, strike-through discounts, and safeguard minimum net margins when supplier costs change.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="add-pricing-rule-btn"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Rule
          </button>

          <button
            id="apply-all-pricing-btn"
            onClick={handleApplyAll}
            disabled={isApplying}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
            {isApplying ? 'Repricing Catalog...' : 'Reprice All Products Now'}
          </button>
        </div>
      </div>

      {/* Real-time Pricing Simulator Sandbox */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Pricing Calculator Sandbox</h3>
          </div>
          <span className="text-xs text-indigo-300 font-medium">
            Simulating with: <strong className="text-white">{activeRule?.name || 'Default Tier'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Sourcing Cost input */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
            <label className="text-[10px] text-indigo-200 font-semibold block uppercase">Factory Item Cost ($)</label>
            <input
              id="simulator-supplier-cost-input"
              type="number"
              step="0.10"
              value={testSupplierCost}
              onChange={(e) => setTestSupplierCost(Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold text-white outline-hidden mt-1"
            />
          </div>

          {/* Air freight shipping input */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
            <label className="text-[10px] text-indigo-200 font-semibold block uppercase">Air Freight Shipping ($)</label>
            <input
              id="simulator-shipping-cost-input"
              type="number"
              step="0.10"
              value={testShippingCost}
              onChange={(e) => setTestShippingCost(Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold text-white outline-hidden mt-1"
            />
          </div>

          {/* Formula info */}
          <div className="hidden md:flex flex-col items-center justify-center text-indigo-300 text-xs font-semibold">
            <span>Markup Formula</span>
            <div className="flex items-center gap-1 font-mono text-white text-sm mt-0.5">
              (Cost + Ship) × {activeRule?.multiplierValue || 2.8} + {activeRule?.centsEnding || '.99'}
            </div>
          </div>

          {/* Generated Retail Price & Profit */}
          <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-3.5 border border-emerald-500/30 text-right">
            <label className="text-[10px] text-emerald-300 font-semibold block uppercase">Generated Store Retail</label>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">${simulatedPrice.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-200 font-medium">
              Net Profit: +${simulatedProfit} ({simulatedMargin}%)
            </div>
          </div>
        </div>
      </div>

      {/* Configured Rules Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configured Automation Rules ({pricingRules.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pricingRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                rule.isActive ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      rule?.ruleType === 'multiplier'
                        ? 'bg-purple-100 text-purple-700'
                        : rule?.ruleType === 'tiered'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {(rule?.ruleType || 'RULE').replace('_', ' ').toUpperCase()}
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs font-semibold text-slate-600">
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      id={`toggle-rule-${rule.id}`}
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={() => togglePricingRule(rule.id)}
                      className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>

                {rule.ruleType === 'multiplier' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Multiplies total landed supplier cost by <strong className="text-slate-800">{rule.multiplierValue}x</strong> and rounds cents to <strong className="text-slate-800">{rule.centsEnding}</strong>.
                  </p>
                )}

                {rule.ruleType === 'fixed_markup' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Adds a flat profit markup of <strong className="text-slate-800">+${rule.fixedMarkupValue}</strong> on top of factory cost.
                  </p>
                )}

                {rule.ruleType === 'tiered' && rule.tieredRules && (
                  <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Tiered Profit Multipliers:
                    </div>
                    {rule.tieredRules.map((t, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>${t.minCost} - ${t.maxCost === Infinity ? '999+' : t.maxCost} Cost:</span>
                        <strong className="text-indigo-600 font-bold">{t.multiplier}x Multiplier (+${t.fixedAdd})</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Category: {rule.targetCategory}</span>
                <span className="text-emerald-600 font-semibold">Cents Ending: {rule.centsEnding}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Create New Pricing Automation Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aggressive Viral 3.2x Markup"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Calculation Method</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden font-medium"
                >
                  <option value="multiplier">Multiplier (e.g. Cost × 2.8)</option>
                  <option value="fixed_markup">Fixed Dollar Markup (e.g. Cost + $20)</option>
                  <option value="tiered">Tiered Volume Margins</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {newRuleType === 'multiplier' ? 'Multiplier (e.g. 2.8)' : 'Fixed Markup ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRuleValue}
                    onChange={(e) => setNewRuleValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cents Ending</label>
                  <select
                    value={newCentsEnding}
                    onChange={(e) => setNewCentsEnding(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden"
                  >
                    <option value=".99">.99 Charm Pricing</option>
                    <option value=".95">.95 Charm Pricing</option>
                    <option value=".00">.00 Rounded</option>
                    <option value="none">No Ending Rounding</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md"
                >
                  Save & Apply Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
