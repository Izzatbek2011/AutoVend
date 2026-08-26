import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  Store,
  Product,
  ImportQueueItem,
  PricingRule,
  Order,
  InventorySyncLog,
  AutomationRule,
  AnalyticsSummary,
  SystemNotification,
} from '../types';
import { api } from '../services/api';

export type NavigationTab =
  | 'dashboard'
  | 'importer'
  | 'import_list'
  | 'products'
  | 'pricing_rules'
  | 'inventory_sync'
  | 'orders'
  | 'suppliers_compare'
  | 'automation_rules'
  | 'ai_analyst'
  | 'stores'
  | 'storefront_sandbox';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  user: UserProfile | null;
  stores: Store[];
  selectedStoreId: string; // 'all' or specific store ID
  setSelectedStoreId: (id: string) => void;
  activeStore: Store | null;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  products: Product[];
  importQueue: ImportQueueItem[];
  pricingRules: PricingRule[];
  orders: Order[];
  inventoryLogs: InventorySyncLog[];
  automationRules: AutomationRule[];
  analytics: AnalyticsSummary | null;
  notifications: SystemNotification[];
  unreadNotifsCount: number;
  
  isLoading: boolean;
  isSyncing: boolean;
  toasts: ToastMessage[];
  
  // Actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  syncInventory: () => Promise<void>;
  
  // Product actions
  pushProductToStores: (productId: string, storeIds: string[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Import actions
  importFromUrl: (url: string, platform?: string) => Promise<ImportQueueItem>;
  deleteImportItem: (id: string) => Promise<void>;
  batchPushImports: (itemIds: string[], targetStoreIds: string[]) => Promise<void>;
  
  // Order actions
  fulfillOrder: (orderId: string, carrier?: string) => Promise<void>;
  fulfillBulkOrders: (orderIds: string[]) => Promise<void>;
  syncTracking: (orderId: string) => Promise<void>;
  
  // Pricing actions
  applyPricingRules: () => Promise<void>;
  togglePricingRule: (id: string) => Promise<void>;
  
  // Rule actions
  toggleAutomationRule: (id: string) => Promise<void>;
  
  // Notifications
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Store management
  connectNewStore: (store: Partial<Store>) => Promise<void>;
  removeStore: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [importQueue, setImportQueue] = useState<ImportQueueItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventorySyncLog[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [
        userData,
        storesData,
        productsData,
        queueData,
        pricingData,
        ordersData,
        logsData,
        rulesData,
        analyticsData,
        notifsData,
      ] = await Promise.all([
        api.getUser(),
        api.getStores(),
        api.getProducts(),
        api.getImportQueue(),
        api.getPricingRules(),
        api.getOrders(),
        api.getInventoryLogs(),
        api.getAutomationRules(),
        api.getAnalyticsSummary(),
        api.getNotifications(),
      ]);

      setUser(userData);
      setStores(storesData);
      setProducts(productsData);
      setImportQueue(queueData);
      setPricingRules(pricingData);
      setOrders(ordersData);
      setInventoryLogs(logsData);
      setAutomationRules(rulesData);
      setAnalytics(analyticsData);
      setNotifications(notifsData);
    } catch (err) {
      console.error('Error fetching AutoVend data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const activeStore = selectedStoreId === 'all' ? null : stores.find((s) => s.id === selectedStoreId) || null;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const syncInventory = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncInventoryNow();
      await refreshData();
      addToast({
        title: 'Inventory Sync Complete',
        message: `Verified ${res.verifiedProducts} products against AliExpress, Alibaba, and 1688 stock feeds.`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Sync Failed',
        message: 'Could not connect to supplier inventory gateway.',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const pushProductToStores = async (productId: string, storeIds: string[]) => {
    try {
      await api.pushProduct(productId, storeIds);
      await refreshData();
      addToast({
        title: 'Product Pushed',
        message: 'Product listings and mapped variant matrix updated on selected stores.',
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Push Failed', message: 'Error pushing to store channel.', type: 'error' });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast({ title: 'Product Removed', message: 'Product removed from AutoVend catalog.', type: 'info' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete product.', type: 'error' });
    }
  };

  const importFromUrl = async (url: string, platform?: string): Promise<ImportQueueItem> => {
    try {
      const item = await api.importFromUrl(url, platform);
      setImportQueue((prev) => [item, ...prev]);
      addToast({
        title: 'Import Successful',
        message: `Fetched "${item.optimizedTitle.substring(0, 35)}..." into your Import List.`,
        type: 'success',
      });
      return item;
    } catch (err) {
      addToast({ title: 'Import Failed', message: 'Could not extract product data from URL.', type: 'error' });
      throw err;
    }
  };

  const deleteImportItem = async (id: string) => {
    try {
      await api.deleteImportItem(id);
      setImportQueue((prev) => prev.filter((i) => i.id !== id));
      addToast({ title: 'Item Removed', message: 'Item removed from import queue.', type: 'info' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to remove import item.', type: 'error' });
    }
  };

  const batchPushImports = async (itemIds: string[], targetStoreIds: string[]) => {
    try {
      const res = await api.batchPushImports(itemIds, targetStoreIds);
      await refreshData();
      addToast({
        title: 'Batch Push Complete',
        message: `Successfully published ${res.count} products to your stores.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Batch Push Failed', message: 'Could not complete batch push.', type: 'error' });
    }
  };

  const fulfillOrder = async (orderId: string, carrier?: string) => {
    try {
      const res = await api.fulfillSingleOrder(orderId, carrier);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      addToast({
        title: 'Order Dispatched',
        message: `Auto-order created with supplier (${res.order.supplierOrderId}). Payment token authorized.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Fulfillment Error', message: 'Failed to place order with supplier.', type: 'error' });
    }
  };

  const fulfillBulkOrders = async (orderIds: string[]) => {
    try {
      const res = await api.fulfillBulkOrders(orderIds);
      await refreshData();
      addToast({
        title: 'Bulk Fulfillment Successful',
        message: `Processed ${res.processedCount} orders across AliExpress, Alibaba, and 1688 pipelines.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Bulk Error', message: 'Could not fulfill bulk orders.', type: 'error' });
    }
  };

  const syncTracking = async (orderId: string) => {
    try {
      const res = await api.syncOrderTracking(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      addToast({
        title: 'Tracking Synchronized',
        message: `Carrier number ${res.trackingNumber} pushed to customer and store.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Tracking Error', message: 'Failed to sync tracking number.', type: 'error' });
    }
  };

  const applyPricingRules = async () => {
    try {
      const res = await api.applyAllPricingRules();
      await refreshData();
      addToast({
        title: 'Repricing Engine Applied',
        message: `Recalculated prices for ${res.updatedVariantsCount} variants using rule "${res.activeRule}".`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Pricing Error', message: 'Failed to reprice catalog.', type: 'error' });
    }
  };

  const togglePricingRule = async (id: string) => {
    try {
      const rule = pricingRules.find((r) => r.id === id);
      if (!rule) return;
      const updated = await api.updatePricingRule(id, { isActive: !rule.isActive });
      setPricingRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
      addToast({
        title: 'Pricing Rule Updated',
        message: `Rule "${updated.name}" is now ${updated.isActive ? 'Active' : 'Disabled'}.`,
        type: 'info',
      });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to toggle pricing rule.', type: 'error' });
    }
  };

  const toggleAutomationRule = async (id: string) => {
    try {
      const updated = await api.toggleAutomationRule(id);
      setAutomationRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
      addToast({
        title: 'Automation Workflow',
        message: `Rule "${updated.name}" ${updated.isEnabled ? 'Enabled' : 'Paused'}.`,
        type: 'info',
      });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to toggle rule.', type: 'error' });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const connectNewStore = async (store: Partial<Store>) => {
    try {
      const created = await api.createStore(store);
      setStores((prev) => [...prev, created]);
      addToast({
        title: 'Store Linked',
        message: `Successfully connected ${created.name} (${created.platform.toUpperCase()}).`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Connection Error', message: 'Failed to connect sales channel.', type: 'error' });
    }
  };

  const removeStore = async (id: string) => {
    try {
      await api.deleteStore(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
      if (selectedStoreId === id) setSelectedStoreId('all');
      addToast({ title: 'Store Disconnected', message: 'Store channel removed.', type: 'info' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to remove store.', type: 'error' });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        stores,
        selectedStoreId,
        setSelectedStoreId,
        activeStore,
        activeTab,
        setActiveTab,
        products,
        importQueue,
        pricingRules,
        orders,
        inventoryLogs,
        automationRules,
        analytics,
        notifications,
        unreadNotifsCount,
        isLoading,
        isSyncing,
        toasts,
        addToast,
        removeToast,
        refreshData,
        syncInventory,
        pushProductToStores,
        deleteProduct,
        importFromUrl,
        deleteImportItem,
        batchPushImports,
        fulfillOrder,
        fulfillBulkOrders,
        syncTracking,
        applyPricingRules,
        togglePricingRule,
        toggleAutomationRule,
        markNotificationAsRead,
        clearNotifications,
        connectNewStore,
        removeStore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
