import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GitBranch,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import { api } from '../services/api';

export const AutomationRulesView: React.FC = () => {
  const { automationRules, toggleAutomationRule, refreshData, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [triggerType, setTriggerType] = useState('supplier_stock_low');
  const [actionType, setActionType] = useState('switch_backup_supplier');

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    try {
      await api.createAutomationRule({
        name: ruleName,
        trigger: triggerType,
        action: actionType,
        isEnabled: true,
      });
      await refreshData();
      setShowAddModal(false);
      setRuleName('');
      addToast({ title: 'Automation Active', message: `Workflow "${ruleName}" is now running.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to create automation rule.', type: 'error' });
    }
  };

  const getTriggerDescription = (trigger: string) => {
    switch (trigger) {
      case 'supplier_stock_low':
        return 'When Primary Supplier Stock Drops Below 5 Units';
      case 'price_increase_detected':
        return 'When Supplier Raises Wholesale Price by >10%';
      case 'new_order_placed':
        return 'When New Customer Order is Paid on Shopify/Woo';
      case 'tracking_number_generated':
        return 'When Carrier Generates Tracking Number';
      case 'supplier_out_of_stock':
        return 'When All Supplier Feeds Are Out of Stock';
      default:
        return trigger;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'switch_backup_supplier':
        return 'Auto-Route Next Orders to 1688 Backup Factory';
      case 'recalculate_retail_price':
        return 'Recalculate Store Price to Safeguard 65% Margin';
      case 'auto_dispatch_supplier':
        return 'Instantly Authorize 1-Click Supplier Dispatch';
      case 'notify_customer_and_store':
        return 'Push Tracking Code to Store & Trigger Email';
      case 'set_store_stock_zero':
        return 'Set Store Inventory to 0 to Prevent Overselling';
      default:
        return action;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Workflow Orchestrator</span>
            <span className="text-xs text-slate-400">• Zero-Touch Dropshipping</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Automation Workflows & Rules
          </h2>
          <p className="text-xs text-slate-500">
            Configure event triggers to automatically switch backup suppliers, reprice products, dispatch fulfillment, and update tracking numbers without manual intervention.
          </p>
        </div>

        <button
          id="add-automation-workflow-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Workflow
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automationRules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
              rule.isEnabled ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      rule.isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                </div>

                <button
                  id={`toggle-automation-btn-${rule.id}`}
                  onClick={() => toggleAutomationRule(rule.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    rule.isEnabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {rule.isEnabled ? <Play className="w-3 h-3 fill-emerald-800" /> : <Pause className="w-3 h-3" />}
                  {rule.isEnabled ? 'Running' : 'Paused'}
                </button>
              </div>

              {/* Trigger & Action visual flow */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Trigger Event
                  </span>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {getTriggerDescription(rule.trigger)}
                  </div>
                </div>

                <div className="flex items-center justify-center py-0.5 text-slate-300">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Automated Action
                  </span>
                  <div className="font-semibold text-indigo-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {getActionDescription(rule.action)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Runs continuously in cloud worker</span>
              <span className="text-slate-600 font-medium">Auto-retry on fail: Enabled</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Build New Automation Workflow</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Workflow Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Order Auto-Dispatch"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">When This Happens (Trigger)</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden font-medium"
                >
                  <option value="supplier_stock_low">Supplier Stock &lt; 5 Units</option>
                  <option value="price_increase_detected">Wholesale Cost Increases &gt; 10%</option>
                  <option value="new_order_placed">New Paid Storefront Order Received</option>
                  <option value="tracking_number_generated">Supplier Provides Carrier Tracking</option>
                  <option value="supplier_out_of_stock">Primary + Backup Sourcing 0 Stock</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Do This Automatically (Action)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden font-medium"
                >
                  <option value="switch_backup_supplier">Switch to 1688 Backup Supplier Route</option>
                  <option value="recalculate_retail_price">Auto-Reprice Store Listing to Protect Margin</option>
                  <option value="auto_dispatch_supplier">1-Click Auto Fulfill with Supplier API</option>
                  <option value="notify_customer_and_store">Sync Tracking Code & Email Customer</option>
                  <option value="set_store_stock_zero">Set Store Stock to 0 to Stop Orders</option>
                </select>
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
                  Enable Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
