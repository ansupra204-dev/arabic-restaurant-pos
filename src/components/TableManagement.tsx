import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, CreditCard, Home, QrCode } from 'lucide-react';
import { CUSTOMER_ORDER_EVENT, CUSTOMER_ORDER_STORAGE_KEY, parseCustomerOrder, useOrders } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/useLanguage';
import type { Order, PaymentMethod } from '@/types';
import { TableQrModal } from '@/components/TableQrModal';

const TABLE_COUNT = 12;

interface TableManagementProps {
  open: boolean;
  onClose: () => void;
  onSelectTable: (tableNumber: number, order: Order | null) => void;
  onViewChange: (view: 'pos' | 'order-details') => void;
  onSettled: (order: Order) => void;
}

export function TableManagement({ open, onClose, onSelectTable, onViewChange, onSettled }: TableManagementProps) {
  const { t, formatPrice, formatTime } = useLanguage();
  const { fetchOpenDineInOrders, settleOrder } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>({});
  const [showQrCodes, setShowQrCodes] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const result = await fetchOpenDineInOrders();
    if (result.error) {
      alert(t.errorPrefix + result.error);
    } else {
      setOrders(result.orders);
    }
    setLoading(false);
  }, [fetchOpenDineInOrders, t.errorPrefix]);

  useEffect(() => {
    if (open) void loadOrders();
    if (!open) return;
    const channel = supabase
      .channel('table-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => void loadOrders());
    channel.subscribe();
    const refreshFromStorage = () => void loadOrders();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CUSTOMER_ORDER_STORAGE_KEY && parseCustomerOrder(event.newValue)) refreshFromStorage();
    };
    window.addEventListener(CUSTOMER_ORDER_EVENT, refreshFromStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      void supabase.removeChannel(channel);
      window.removeEventListener(CUSTOMER_ORDER_EVENT, refreshFromStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadOrders, open]);

  const handleSettle = async (order: Order) => {
    setSettlingId(order.id);
    const result = await settleOrder(order.id, paymentMethods[order.id] ?? order.payment_method);
    setSettlingId(null);
    if (result.error || !result.order) {
      alert(t.errorPrefix + (result.error ?? t.errorPrefix));
      return;
    }
    setOrders((current) => current.filter((item) => item.id !== order.id));
    onSettled(result.order);
  };

  if (!open) return null;

  const occupiedByTable = new Map(
    orders
      .map((order) => ({ order, tableNumber: order.table_number ?? null }))
      .filter(({ tableNumber }) => tableNumber !== null)
      .map(({ order, tableNumber }) => [tableNumber as number, order])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.manageTables}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.occupiedTables}: {orders.length} · {t.availableTables}: {TABLE_COUNT - occupiedByTable.size}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQrCodes(true)} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <QrCode className="h-4 w-4" /> {t.generateTableQr}
            </button>
            <button onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
              <Home className="h-4 w-4" /> {t.backToPos}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">{t.loading}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: TABLE_COUNT }, (_, index) => index + 1).map((tableNumber) => {
                const order = occupiedByTable.get(tableNumber);
                const paymentMethod = paymentMethods[order?.id ?? ''] ?? order?.payment_method ?? 'cash';

                return (
                  <div
                    key={tableNumber}
                    className={`rounded-2xl border p-4 ${
                      order
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                        : 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (order) {
                          onSelectTable(tableNumber, order);
                          onViewChange('order-details');
                        } else {
                          onSelectTable(tableNumber, null);
                          onViewChange('pos');
                        }
                      }}
                      className="mb-3 flex w-full items-start justify-between text-start"
                    >
                      <div>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                          {t.table} {tableNumber}
                        </p>
                        <p className={`text-xs font-medium ${order ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {order ? t.occupiedTable : t.availableTable}
                        </p>
                      </div>
                      {order ? (
                        <Clock3 className="h-5 w-5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </button>
                    {order ? (
                      <>
                        <div className="mb-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <p>{t.orderNumber} {order.order_number}</p>
                          <p>{formatTime(order.created_at)}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatPrice(Number(order.total))}</p>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-1">
                          {(['cash', 'card'] as PaymentMethod[]).map((method) => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethods((current) => ({ ...current, [order.id]: method }))}
                              className={`rounded-lg px-2 py-1.5 text-xs font-medium ${
                                paymentMethod === method
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {method === 'cash' ? t.cash : t.card}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => void handleSettle(order)}
                          disabled={settlingId === order.id}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-2 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {settlingId === order.id ? t.settling : t.settleBill}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectTable(tableNumber, null);
                          onViewChange('pos');
                        }}
                        className="w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
                      >
                        {t.selectTable}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {showQrCodes && <TableQrModal onClose={() => setShowQrCodes(false)} />}
      </div>
    </div>
  );
}
