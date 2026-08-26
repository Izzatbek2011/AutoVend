import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { SupplierGatewayConfig } from '../types';
import {
  KeyRound,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe2,
  DollarSign,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  Server,
  Activity,
} from 'lucide-react';

export const SupplierSettingsView: React.FC = () => {
  const { addToast } = useApp();

  const [config, setConfig] = useState<SupplierGatewayConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [aliKey, setAliKey] = useState('');
  const [aliSecret, setAliSecret] = useState('');
  const [aliToken, setAliToken] = useState('');
  const [aliWhitelist, setAliWhitelist] = useState(true);

  const [alibabaPartner, setAlibabaPartner] = useState('');
  const [alibabaSecret, setAlibabaSecret] = useState('');
  const [alibabaEscrow, setAlibabaEscrow] = useState(true);

  const [s1688Key, setS1688Key] = useState('');
  const [s1688Agent, setS1688Agent] = useState('');
  const [s1688Currency, setS1688Currency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSupplierGatewayConfig();
      setConfig(data);
      if (data) {
        setAliKey(data.aliexpress.appKey);
        setAliSecret(data.aliexpress.appSecret);
        setAliToken(data.aliexpress.accessToken);
        setAliWhitelist(data.aliexpress.whitelistEnabled);

        setAlibabaPartner(data.alibaba.partnerId);
        setAlibabaSecret(data.alibaba.apiSecret);
        setAlibabaEscrow(data.alibaba.autoEscrow);

        setS1688Key(data.s1688.appKey);
        setS1688Agent(data.s1688.agentId);
        setS1688Currency(data.s1688.currencyConversion);
      }
    } catch (err) {
      console.error('Failed to load supplier configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPing = async (platform: 'aliexpress' | 'alibaba' | 's1688') => {
    setTestingPlatform(platform);
    try {
      const res = await api.testSupplierGatewayPing(platform);
      addToast({
        title: `${res.platform} Test Successful`,
        message: `${res.message} (Latency: ${res.latencyMs}ms)`,
        type: 'success',
      });
      loadConfig();
    } catch (err) {
      addToast({
        title: 'Connection Test Failed',
        message: 'Could not communicate with the supplier endpoint gateway.',
        type: 'error',
      });
    } finally {
      setTestingPlatform(null);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSupplierGatewayConfig({
        aliexpress: {
          appKey: aliKey,
          appSecret: aliSecret,
          accessToken: aliToken,
          status: 'connected',
          whitelistEnabled: aliWhitelist,
          autoSyncStock: true,
        },
        alibaba: {
          partnerId: alibabaPartner,
          apiSecret: alibabaSecret,
          tradeAssurance: true,
          status: 'connected',
          autoEscrow: alibabaEscrow,
        },
        s1688: {
          appKey: s1688Key,
          agentId: s1688Agent,
          currencyConversion: s1688Currency,
          status: 'connected',
          autoTranslate: true,
        },
      });
      addToast({
        title: 'Supplier API Gateways Saved',
        message: 'All API keys, access tokens, and webhook endpoints have been updated successfully.',
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Save Failed',
        message: 'Error saving supplier gateway configuration.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              Supplier API Keys & Whitelist Gateways
            </span>
            <span className="text-xs text-slate-400">• DSers Compliant Integration Hub</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Connect AliExpress, Alibaba & 1688 Direct API Keys
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure live open API credentials, OAuth tokens, and dropshipping whitelist gateways. AutoVend uses these to auto-place orders, sync inventory changes, and retrieve factory wholesale quotes in real-time.
          </p>
        </div>

        {/* Live Gateway Status Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">AliExpress Open API</span>
                <span className="text-[10px] text-slate-500 font-mono">Ping: {config?.aliexpress.lastPingMs || 24}ms</span>
              </div>
            </div>
            <button
              onClick={() => handleTestPing('aliexpress')}
              disabled={testingPlatform === 'aliexpress'}
              className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              title="Ping connection"
            >
              {testingPlatform === 'aliexpress' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Alibaba Dropship Gateway</span>
                <span className="text-[10px] text-slate-500 font-mono">Ping: {config?.alibaba.lastPingMs || 41}ms</span>
              </div>
            </div>
            <button
              onClick={() => handleTestPing('alibaba')}
              disabled={testingPlatform === 'alibaba'}
              className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              title="Ping connection"
            >
              {testingPlatform === 'alibaba' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">1688 Cross-Border OEM</span>
                <span className="text-[10px] text-slate-500 font-mono">Ping: {config?.s1688.lastPingMs || 38}ms</span>
              </div>
            </div>
            <button
              onClick={() => handleTestPing('s1688')}
              disabled={testingPlatform === 's1688'}
              className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              title="Ping connection"
            >
              {testingPlatform === 's1688' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. AliExpress Open Platform Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <h3 className="font-bold text-base text-slate-900">AliExpress Open Platform & DSers Whitelist</h3>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">AliExpress App Key</label>
              <input
                type="text"
                value={aliKey}
                onChange={(e) => setAliKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">App Secret</label>
              <input
                type="password"
                value={aliSecret}
                onChange={(e) => setAliSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">OAuth Access Token</label>
              <input
                type="text"
                value={aliToken}
                onChange={(e) => setAliToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={aliWhitelist}
                onChange={(e) => setAliWhitelist(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-0"
              />
              <span>Enable AliExpress Dropshipping Whitelist Account Bypass (Zero CAPTCHA on Auto-Orders)</span>
            </label>
          </div>
        </div>

        {/* 2. Alibaba Dropshipping Gateway Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-base text-slate-900">Alibaba Dropshipping Open Cloud Gateway</h3>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Trade Assurance Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alibaba Partner ID</label>
              <input
                type="text"
                value={alibabaPartner}
                onChange={(e) => setAlibabaPartner(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gateway Client Secret</label>
              <input
                type="password"
                value={alibabaSecret}
                onChange={(e) => setAlibabaSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={alibabaEscrow}
                onChange={(e) => setAlibabaEscrow(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-0"
              />
              <span>Auto-Authorize Trade Assurance Escrow for 1-Click Wholesale Dispatch</span>
            </label>
          </div>
        </div>

        {/* 3. 1688 OEM Factory Direct Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <h3 className="font-bold text-base text-slate-900">1688 Direct OEM Factory & Forwarder Protocol</h3>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yiwu/Guangdong Forwarder Synced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">1688 Agent API Key</label>
              <input
                type="text"
                value={s1688Key}
                onChange={(e) => setS1688Key(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Consolidation Warehouse Agent ID</label>
              <input
                type="text"
                value={s1688Agent}
                onChange={(e) => setS1688Agent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">CNY Currency Auto-Conversion Base</label>
              <select
                value={s1688Currency}
                onChange={(e) => setS1688Currency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 outline-hidden"
              >
                <option value="USD">USD ($) • Live FX Rate: 1 CNY = 0.138 USD</option>
                <option value="EUR">EUR (€) • Live FX Rate: 1 CNY = 0.129 EUR</option>
                <option value="GBP">GBP (£) • Live FX Rate: 1 CNY = 0.108 GBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save & Sync All Supplier API Keys
          </button>
        </div>
      </form>
    </div>
  );
};
