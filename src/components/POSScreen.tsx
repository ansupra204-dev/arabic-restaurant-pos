import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Receipt as ReceiptIcon, Table2, ChefHat } from 'lucide-react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/i18n/useLanguage';
import { ItemCard } from '@/components/ItemCard';
import { Cart } from '@/components/Cart';
import { Receipt } from '@/components/Receipt';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { CartItem, MenuItem, OrderType, PaymentMethod, Order } from '@/types';
import { CUSTOMER_ORDER_EVENT, CUSTOMER_ORDER_STORAGE_KEY, parseCustomerOrder } from '@/hooks/useOrders';
import { CATEGORY_KEYS } from '@/types';
import { CATEGORY_TRANSLATIONS, type CategoryKey } from '@/i18n/translations';

interface POSScreenProps {
  onOpenAdmin: () => void;
  onOpenKitchen: () => void;
  onOpenTables: () => void;
  selectedTable: number | null;
  selectedOrderType: OrderType;
  activeOrder: Order | null;
}

export function POSScreen({
  onOpenAdmin,
  onOpenKitchen,
  onOpenTables,
  selectedTable,
  selectedOrderType,
  activeOrder,
}: POSScreenProps) {
  const { items, loading } = useMenuItems();
  const { submitOrder, updateOrder } = useOrders();
  const { t, lang, formatDateTime } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('برجر');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>(activeOrder?.items ?? []);
  const [orderType, setOrderType] = useState<OrderType>(selectedOrderType);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(activeOrder?.payment_method ?? 'cash');
  const [taxRate, setTaxRate] = useState(activeOrder?.tax_rate ?? 0);
  const [discount, setDiscount] = useState(activeOrder?.discount ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [tableNumber, setTableNumber] = useState<number | null>(activeOrder?.table_number ?? selectedTable);
  const [currentActiveOrder, setCurrentActiveOrder] = useState<Order | null>(activeOrder);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCustomerOrder = (event: Event) => {
      const order = (event as CustomEvent<Order>).detail;
      setCurrentActiveOrder(order);
      setCart(order.items);
      setTableNumber(order.table_number);
      setOrderType(order.order_type);
      setPaymentMethod(order.payment_method);
      setTaxRate(order.tax_rate);
      setDiscount(order.discount);
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
  }, [tableNumber]);

  const catTr = CATEGORY_TRANSLATIONS[lang];

  const filteredItems = items
    .filter((item) => item.available)
    .filter((item) => {
      if (searchQuery) {
        return item.name.includes(searchQuery) || item.description?.includes(searchQuery);
      }
      return item.category === activeCategory;
    });

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          notes: '',
          image_url: item.image_url,
        },
      ];
    });
  }, []);

  const incrementItem = (id: string) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity: c.quantity + 1 } : c))
    );
  };

  const decrementItem = (id: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const deleteItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const updateNote = (id: string, note: string) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, notes: note } : c)));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (orderType === 'dine_in' && tableNumber === null) {
      alert(t.tableRequired);
      return;
    }
    setSubmitting(true);
    const result = currentActiveOrder
      ? await updateOrder(currentActiveOrder.id, cart, paymentMethod, subtotal, taxRate, discount, total, tableNumber)
      : await submitOrder(cart, orderType, paymentMethod, subtotal, taxRate, discount, total, tableNumber);
    const { order, error } = result;
    setSubmitting(false);

    if (error) {
      alert(t.errorPrefix + error);
      return;
    }

    if (order) {
      if (orderType !== 'dine_in') {
        setLastOrder(order);
        setShowReceipt(true);
      } else {
        alert(`${t.tableOrderSaved} ${t.table} ${tableNumber}`);
      }
      clearCart();
      setTableNumber(null);
      setCurrentActiveOrder(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setLastOrder(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
            {t.logoLetter}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.restaurantName}</h1>
            <p className="text-xs text-slate-400">{t.posSystem}</p>
          </div>
          {selectedTable !== null && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {t.table} {selectedTable}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={onOpenTables}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            <Table2 className="h-4 w-4" />
            {t.manageTables}
          </button>
          <button
            onClick={onOpenKitchen}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
          >
            <ChefHat className="h-4 w-4" />
            {t.kitchenDisplay}
          </button>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 text-sm font-medium transition-colors"
          >
            <ReceiptIcon className="h-4 w-4" />
            {t.adminPanel}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 gap-3 p-3 overflow-hidden print:block">
        {/* Menu side (categories + items) */}
        <div className="flex flex-1 flex-col gap-3 min-w-0 print:hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ps-10 pe-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Category tabs */}
          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORY_KEYS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-500'
                  }`}
                >
                  {catTr[cat as CategoryKey]}
                </button>
              ))}
            </div>
          )}

          {/* Item grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <p className="text-sm">{t.loadingMenu}</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <p className="text-sm">{t.noItems}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-3">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart side */}
        <div className="w-full max-w-sm flex-shrink-0 print:hidden">
          <Cart
            items={cart}
            orderType={orderType}
            paymentMethod={paymentMethod}
            taxRate={taxRate}
            discount={discount}
            onAdd={incrementItem}
            onRemove={decrementItem}
            onDelete={deleteItem}
            onNoteChange={updateNote}
            onOrderTypeChange={setOrderType}
            onPaymentMethodChange={setPaymentMethod}
            onTaxRateChange={setTaxRate}
            onDiscountChange={setDiscount}
            onCheckout={handleCheckout}
            onClear={clearCart}
            tableNumber={tableNumber}
            onManageTables={onOpenTables}
            submitting={submitting}
          />
        </div>

        {/* Receipt for printing */}
        {showReceipt && lastOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:block print:static print:inset-auto">
            <div className="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-100 dark:bg-slate-900 p-6 print:p-0 print:bg-white">
              {/* Action buttons */}
              <div className="flex gap-2 mb-4 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 text-sm shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {t.printReceipt}
                </button>
                <button
                  onClick={handleCloseReceipt}
                  className="rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium px-6 py-3 text-sm transition-colors"
                >
                  {t.close}
                </button>
              </div>

              <Receipt
                ref={receiptRef}
                orderNumber={lastOrder.order_number}
                orderType={lastOrder.order_type}
                paymentMethod={lastOrder.payment_method}
                items={lastOrder.items}
                subtotal={Number(lastOrder.subtotal)}
                taxRate={Number(lastOrder.tax_rate)}
                taxAmount={(Number(lastOrder.subtotal) * Number(lastOrder.tax_rate)) / 100}
                discount={Number(lastOrder.discount)}
                total={Number(lastOrder.total)}
                date={formatDateTime(lastOrder.created_at)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
