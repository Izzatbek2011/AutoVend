import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';

import { DashboardView } from './components/DashboardView';
import { ProductImporterView } from './components/ProductImporterView';
import { ImportListView } from './components/ImportListView';
import { ProductsMappingView } from './components/ProductsMappingView';
import { PricingRulesView } from './components/PricingRulesView';
import { InventorySyncView } from './components/InventorySyncView';
import { OrdersFulfillmentView } from './components/OrdersFulfillmentView';
import { SuppliersComparisonView } from './components/SuppliersComparisonView';
import { AutomationRulesView } from './components/AutomationRulesView';
import { AiAnalystView } from './components/AiAnalystView';
import { StoresManagementView } from './components/StoresManagementView';
import { StorefrontSimulatorView } from './components/StorefrontSimulatorView';
import { FindSuppliersView } from './components/FindSuppliersView';
import { SupplierSettingsView } from './components/SupplierSettingsView';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500 mt-2">Loading AutoVend 2.0 Engine...</span>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'find_suppliers':
        return <FindSuppliersView />;
      case 'importer':
        return <ProductImporterView />;
      case 'import_list':
        return <ImportListView />;
      case 'products':
        return <ProductsMappingView />;
      case 'pricing_rules':
        return <PricingRulesView />;
      case 'inventory_sync':
        return <InventorySyncView />;
      case 'orders':
        return <OrdersFulfillmentView />;
      case 'suppliers_compare':
        return <SuppliersComparisonView />;
      case 'automation_rules':
        return <AutomationRulesView />;
      case 'ai_analyst':
        return <AiAnalystView />;
      case 'stores':
        return <StoresManagementView />;
      case 'supplier_settings':
        return <SupplierSettingsView />;
      case 'storefront_sandbox':
        return <StorefrontSimulatorView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      {renderActiveView()}
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header />
          <MainContent />
          <ToastContainer />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
