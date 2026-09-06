import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Send } from 'lucide-react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { createLocalCustomerOrder, notifyCustomerOrder, useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/i18n/useLanguage';
import { CATEGORY_KEYS } from '@/types';
import { CATEGORY_TRANSLATIONS, type CategoryKey } from '@/i18n/translations';
import type { CartItem, MenuItem } from '@/types';
import type { Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { useParams } from 'react-router-dom';

export function CustomerMenu() {
  const { tableNumber: routeTableNumber } = useParams<{ tableNumber?: string }>();
  const parsedRouteTableNumber = routeTableNumber === undefined ? null : Number(routeTableNumber);
  const urlTableNumber = parsedRouteTableNumber !== null &&
    Number.isInteger(parsedRouteTableNumber) &&
    parsedRouteTableNumber >= 1 &&
    parsedRouteTableNumber <= 12
    ? parsedRouteTableNumber
    : null;
  const { items, loading } = useMenuItems();
  const { submitOrder, updateOrder, fetchOpenDineInOrders } = useOrders();
  const { t, lang, formatPrice } = useLanguage();
  const [category, setCategory] = useState<CategoryKey>(CATEGORY_KEYS[0]);
  const [manualTableNumber, setManualTableNumber] = useState<number | null>(urlTableNumber);
  const tableNumber = urlTableNumber ?? manualTableNumber;
  const [tableInput, setTableInput] = useState(urlTableNumber?.toString() ?? '');
  const [showTablePrompt, setShowTablePrompt] = useState(urlTableNumber === null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    setManualTableNumber(urlTableNumber);
    setTableInput(urlTableNumber?.toString() ?? '');
    setShowTablePrompt(urlTableNumber === null);
  }, [routeTableNumber, urlTableNumber]);

  const visibleItems = useMemo(
    () => items.filter((item) => item.available && item.category === category),
    [items, category]
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (tableNumber === null) return;
    const refreshOrder = async () => {
      const result = await fetchOpenDineInOrders();
      const order = result.orders.find((entry) => entry.table_number === tableNumber) ?? null;
      if (order) {
        setActiveOrder(order);
        setSubmitted(true);
      }
    };
    void refreshOrder();
    const interval = window.setInterval(() => void refreshOrder(), 5000);
    const channel = supabase
      .channel(`customer-table-${tableNumber}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => void refreshOrder());
    channel.subscribe();
    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [fetchOpenDineInOrders, tableNumber]);

  const addItem = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      return [...current, { id: item.id, name: item.name, price: item.price, quantity: 1, notes: '', image_url: item.image_url }];
    });
  };

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  };

  const submit = async () => {
    if (!cart.length || tableNumber === null) {
      setShowTablePrompt(true);
      return;
    }
    setSubmitting(true);
    let result;
    try {
      result = activeOrder
        ? await updateOrder(
        activeOrder.id,
        [...activeOrder.items, ...cart].reduce<CartItem[]>((items, item) => {
          const existing = items.find((entry) => entry.id === item.id);
          return existing
            ? items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + item.quantity } : entry)
            : [...items, item];
        }, []),
        activeOrder.payment_method,
        activeOrder.subtotal + total,
        activeOrder.tax_rate,
        activeOrder.discount,
        activeOrder.total + total,
        tableNumber
      )
        : await submitOrder(cart, 'dine_in', 'cash', total, 0, 0, total, tableNumber);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/table_number|table_id|schema cache/i.test(message)) {
        setSubmitting(false);
        alert(t.errorPrefix + message);
        return;
      }
      result = { order: activeOrder ?? createLocalCustomerOrder(cart, tableNumber, total), error: null };
    }
    setSubmitting(false);
    if (result.error) {
      if (/table_number|table_id|schema cache/i.test(result.error) && !activeOrder) {
        result = { order: createLocalCustomerOrder(cart, tableNumber, total), error: null };
      } else {
      alert(t.errorPrefix + result.error);
      return;
      }
    }
    setCart([]);
    setSubmitted(true);
    if (result.order) {
      setActiveOrder(result.order);
      notifyCustomerOrder(result.order);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 p-4 pb-40 dark:bg-slate-950">
      <header className="mx-auto mb-5 max-w-2xl text-center">
        <p className="text-sm font-medium text-emerald-600">{t.restaurantName}</p>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.customerMenu}</h1>
          <button
            onClick={() => {
              setTableInput(tableNumber?.toString() ?? '');
              setShowTablePrompt(true);
            }}
            className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          >
            {tableNumber === null ? t.selectTable : `${t.table}: ${tableNumber}`}
          </button>
        </div>
        {tableNumber !== null && <p className="text-sm text-slate-500">{t.tableOrder(tableNumber)}</p>}
      </header>
      {showTablePrompt && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const value = Number(tableInput);
              if (Number.isInteger(value) && value >= 1 && value <= 12) {
                setManualTableNumber(value);
                setShowTablePrompt(false);
              }
            }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{t.selectTable}</h2>
            <p className="mb-4 text-sm text-slate-500">{t.tableNumber}</p>
            <input
              autoFocus
              type="number"
              min="1"
              max="12"
              required
              value={tableInput}
              onChange={(event) => setTableInput(event.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg dark:border-slate-700 dark:bg-slate-800"
            />
            <button type="submit" className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white">
              {t.save}
            </button>
          </form>
        </div>
      )}
      {submitted && (
        <div className="mx-auto mb-4 max-w-2xl rounded-xl bg-emerald-100 p-4 text-center font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
          {t.orderSubmitted}
        </div>
      )}
      {activeOrder && tableNumber !== null && (
        <button onClick={() => setShowStatus(true)} className="mx-auto mb-4 block rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          {t.activeOrder} - {t.table} {tableNumber}
        </button>
      )}
      <nav className="mx-auto mb-5 flex max-w-2xl gap-2 overflow-x-auto pb-1">
        {CATEGORY_KEYS.map((key) => (
          <button key={key} onClick={() => setCategory(key)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${category === key ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}>
            {CATEGORY_TRANSLATIONS[lang][key]}
          </button>
        ))}
      </nav>
      {loading ? <p className="py-12 text-center text-slate-500">{t.loadingMenu}</p> : (
        <main className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
          {visibleItems.map((item) => (
            <button key={item.id} onClick={() => addItem(item)} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-start shadow-sm dark:bg-slate-900">
              {item.image_url && <img src={item.image_url} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />}
              <span className="min-w-0 flex-1"><strong className="block text-slate-800 dark:text-white">{item.name}</strong><span className="text-sm font-bold text-emerald-600">{formatPrice(item.price)}</span></span>
              <Plus className="h-5 w-5 text-emerald-500" />
            </button>
          ))}
        </main>
      )}
      {cart.length > 0 && tableNumber !== null && (
        <section className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-2 font-bold text-slate-800 dark:text-white">{t.customerOrder}</h2>
            <div className="mb-3 space-y-2">
              {cart.map((item) => <div key={item.id} className="flex items-center justify-between text-sm"><span>{item.name}</span><span className="flex items-center gap-2"><button onClick={() => changeQuantity(item.id, -1)}><Minus className="h-4 w-4" /></button>{item.quantity}<button onClick={() => changeQuantity(item.id, 1)}><Plus className="h-4 w-4" /></button></span></div>)}
            </div>
            <button disabled={submitting} onClick={() => void submit()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white disabled:opacity-60">
              <Send className="h-4 w-4" /> {submitting ? t.processing : `${t.submitCustomerOrder} · ${formatPrice(total)}`}
            </button>
          </div>
        </section>
      )}
      {showStatus && activeOrder && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{t.orderStatus}</h2>
                <p className="text-sm text-slate-500">{t.tableOrder(tableNumber ?? activeOrder.table_number ?? 0)}</p>
              </div>
              <button onClick={() => setShowStatus(false)} className="text-sm font-bold text-slate-500">{t.close}</button>
            </div>
            <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              {activeOrder.kitchen_status === 'ready' ? t.orderReady : activeOrder.kitchen_status === 'pending' ? t.orderPreparing : t.orderPending}
            </div>
            <div className="mb-4 space-y-2">
              {activeOrder.items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.name}</span><span>× {item.quantity}</span></div>)}
            </div>
            <div className="mb-4 flex justify-between border-t border-slate-200 pt-3 font-bold dark:border-slate-700">
              <span>{t.total}</span><span className="text-emerald-600">{formatPrice(Number(activeOrder.total))}</span>
            </div>
            <button onClick={() => setShowStatus(false)} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white">{t.addMoreItems}</button>
          </div>
        </div>
      )}
    </div>
  );
}
