import { useCallback, useEffect, useState } from 'react';
import { ChefHat, Clock3, Home, RefreshCw } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { CUSTOMER_ORDER_EVENT, CUSTOMER_ORDER_STORAGE_KEY, parseCustomerOrder } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/useLanguage';
import type { Order, OrderType } from '@/types';

interface KitchenDisplayProps {
  open: boolean;
  onClose: () => void;
}

export function KitchenDisplay({ open, onClose }: KitchenDisplayProps) {
  const { t, formatTime } = useLanguage();
  const { fetchKitchenOrders, markOrderReady } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const loadOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const result = await fetchKitchenOrders();
    if (result.error) {
      alert(t.errorPrefix + result.error);
    } else {
      setOrders(result.orders);
    }
    if (showLoading) setLoading(false);
  }, [fetchKitchenOrders, t.errorPrefix]);

  useEffect(() => {
    if (!open) return;
    void loadOrders(true);
    const intervalId = window.setInterval(() => void loadOrders(), 5000);
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => void loadOrders());
    channel.subscribe();
    const handleCustomerOrder = () => void loadOrders();
    window.addEventListener(CUSTOMER_ORDER_EVENT, handleCustomerOrder);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CUSTOMER_ORDER_STORAGE_KEY && parseCustomerOrder(event.newValue)) handleCustomerOrder();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(intervalId);
      void supabase.removeChannel(channel);
      window.removeEventListener(CUSTOMER_ORDER_EVENT, handleCustomerOrder);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadOrders, open]);

  const handleReady = async (orderId: string) => {
    setMarkingId(orderId);
    const result = await markOrderReady(orderId);
    setMarkingId(null);
    if (result.error) {
      alert(t.errorPrefix + result.error);
      return;
    }
    setOrders((current) => current.filter((order) => order.id !== orderId));
  };

  if (!open) return null;

  const orderTypeLabel: Record<OrderType, string> = {
    dine_in: t.dineIn,
    takeaway: t.takeaway,
    delivery: t.delivery,
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-500 p-2.5 text-white">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.kitchenDisplay}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.kitchenOrders}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadOrders(true)}
            disabled={loading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            aria-label={t.loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            {t.backToPos}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400">{t.loading}</div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-400">
            <ChefHat className="h-12 w-12 opacity-30" />
            <p>{t.noKitchenOrders}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm dark:border-orange-500/30 dark:bg-slate-900">
                <div className="flex items-center justify-between bg-orange-50 px-5 py-4 dark:bg-orange-500/10">
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {t.orderNumber} {order.order_number}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {order.table_number === null ? orderTypeLabel[order.order_type] : `${t.table} ${order.table_number}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    {formatTime(order.created_at)}
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.id}`} className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                          {item.quantity}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                          {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400">{item.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => void handleReady(order.id)}
                    disabled={markingId === order.id}
                    className="mt-2 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingId === order.id ? t.markingReady : t.markAsReady}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
