import { useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Printer } from 'lucide-react';
import { Receipt } from '@/components/Receipt';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/i18n/useLanguage';
import type { Order, PaymentMethod } from '@/types';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onEdit: () => void;
  onSettled: (order: Order) => void;
}

export function OrderDetails({ order, onBack, onEdit, onSettled }: OrderDetailsProps) {
  const { t, formatPrice, formatDateTime } = useLanguage();
  const { settleOrder } = useOrders();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(order.payment_method);
  const [settling, setSettling] = useState(false);
  const [settledOrder, setSettledOrder] = useState<Order | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleSettle = async () => {
    setSettling(true);
    const result = await settleOrder(order.id, paymentMethod);
    setSettling(false);
    if (result.error || !result.order) {
      alert(t.errorPrefix + (result.error ?? t.errorPrefix));
      return;
    }
    setSettledOrder(result.order);
    onSettled(result.order);
  };

  if (settledOrder) {
    return (
      <div className="h-full min-h-screen w-full bg-slate-100 p-4 dark:bg-slate-950">
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex justify-end print:hidden">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
              <Printer className="h-4 w-4" /> {t.printReceipt}
            </button>
          </div>
          <Receipt
            ref={receiptRef}
            orderNumber={settledOrder.order_number}
            orderType={settledOrder.order_type}
            paymentMethod={settledOrder.payment_method}
            items={settledOrder.items}
            subtotal={Number(settledOrder.subtotal)}
            taxRate={Number(settledOrder.tax_rate)}
            taxAmount={(Number(settledOrder.subtotal) * Number(settledOrder.tax_rate)) / 100}
            discount={Number(settledOrder.discount)}
            total={Number(settledOrder.total)}
            date={formatDateTime(settledOrder.created_at)}
          />
          <button onClick={onBack} className="mt-4 w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white print:hidden">
            {t.backToPos}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.orderDetails}</h1>
          <p className="text-sm text-slate-500">{t.table} {order.table_number} · {t.orderNumber} {order.order_number}</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" /> {t.manageTables}
        </button>
      </header>
      <main className="w-full space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
            <p className="text-xs text-slate-500">{t.date}</p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{formatDateTime(order.created_at)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
            <p className="text-xs text-slate-500">{t.orderStatus}</p>
            <p className="font-semibold text-amber-600">{t.activeOrder}</p>
          </div>
          <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
            <p className="text-xs text-slate-500">{t.itemsLabel}</p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{order.items.length}</p>
          </div>
        </div>
        <section className="rounded-2xl bg-white p-5 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-100">{t.itemsLabel}</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={`${order.id}-${item.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <span className="text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">× {item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-200">{t.total}</span>
            <span className="text-2xl font-bold text-emerald-600">{formatPrice(Number(order.total))}</span>
          </div>
        </section>
        <div className="rounded-2xl bg-white p-5 dark:bg-slate-900">
          <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{t.paymentMethod}</p>
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'card'] as PaymentMethod[]).map((method) => (
              <button key={method} onClick={() => setPaymentMethod(method)} className={`rounded-xl py-3 text-sm font-bold ${paymentMethod === method ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                {method === 'cash' ? t.cash : t.card}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={onEdit} className="rounded-xl bg-slate-700 py-4 text-sm font-bold text-white hover:bg-slate-800">
            {t.editOrderInPos}
          </button>
          <button onClick={() => void handleSettle()} disabled={settling} className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60">
            <CreditCard className="h-5 w-5" /> {settling ? t.settling : t.settleBill}
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> {t.activeOrder}
        </div>
      </main>
    </div>
  );
}
