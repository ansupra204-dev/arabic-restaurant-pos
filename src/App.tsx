import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { POSScreen } from '@/components/POSScreen';
import { AdminDashboard } from '@/components/AdminDashboard';
import { KitchenDisplay } from '@/components/KitchenDisplay';
import { TableManagement } from '@/components/TableManagement';
import { OrderDetails } from '@/components/OrderDetails';
import { CustomerMenu } from '@/components/CustomerMenu';
import type { Order, OrderType } from '@/types';
import { useMenuItems } from '@/hooks/useMenuItems';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { useLanguage } from '@/i18n/useLanguage';
import { CUSTOMER_ORDER_EVENT, CUSTOMER_ORDER_STORAGE_KEY, parseCustomerOrder, useOrders } from '@/hooks/useOrders';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function AppContent() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [currentView, setCurrentView] = useState<'pos' | 'kitchen' | 'tables' | 'order-details'>('pos');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>('dine_in');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const { items, refetch } = useMenuItems();
  const { fetchOpenDineInOrders } = useOrders();
  const { t, dir } = useLanguage();

  useEffect(() => {
    const handleCustomerOrder = (event: Event) => {
      const order = (event as CustomEvent<Order>).detail;
      setSelectedTable(order.table_number);
      setSelectedOrderType('dine_in');
      setActiveOrder(order);
      void fetchOpenDineInOrders();
    };
    window.addEventListener(CUSTOMER_ORDER_EVENT, handleCustomerOrder);
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CUSTOMER_ORDER_STORAGE_KEY) return;
      const order = parseCustomerOrder(event.newValue);
      if (order) handleCustomerOrder(new CustomEvent<Order>(CUSTOMER_ORDER_EVENT, { detail: order }));
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(CUSTOMER_ORDER_EVENT, handleCustomerOrder);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchOpenDineInOrders]);

  return (
    <div className={dark ? 'dark' : ''} dir={dir}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-cairo">
        {/* Theme toggle floating button */}
        <button
          onClick={() => setDark(!dark)}
          className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform print:hidden"
          aria-label={t.toggleTheme}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {currentView === 'pos' && (
          <>
            <POSScreen
              onOpenAdmin={() => setAdminOpen(true)}
              onOpenKitchen={() => setCurrentView('kitchen')}
              onOpenTables={() => setCurrentView('tables')}
              selectedTable={selectedTable}
              selectedOrderType={selectedOrderType}
              activeOrder={activeOrder}
            />
            <AdminDashboard
              open={adminOpen}
              onClose={() => setAdminOpen(false)}
              menuItems={items}
              onMenuChanged={refetch}
            />
          </>
        )}
        {currentView === 'kitchen' && (
          <KitchenDisplay open onClose={() => setCurrentView('pos')} />
        )}
        {currentView === 'tables' && (
          <TableManagement
            open
            onClose={() => setCurrentView('pos')}
            onSelectTable={(tableNumber, order) => {
              setSelectedTable(tableNumber);
              setSelectedOrderType('dine_in');
              setActiveOrder(order);
            }}
            onViewChange={setCurrentView}
            onSettled={() => setCurrentView('pos')}
          />
        )}
        {currentView === 'order-details' && activeOrder && (
          <OrderDetails
            order={activeOrder}
            onBack={() => setCurrentView('tables')}
            onEdit={() => setCurrentView('pos')}
            onSettled={() => setCurrentView('order-details')}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/table" element={<CustomerMenuRoute />} />
          <Route path="/table/:tableNumber" element={<CustomerMenuRoute />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

function CustomerMenuRoute() {
  return <CustomerMenu />;
}

export default App;
