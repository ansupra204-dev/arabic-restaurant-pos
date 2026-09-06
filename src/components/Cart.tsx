import { useState } from 'react';
import { Minus, Plus, Trash2, StickyNote, X } from 'lucide-react';
import type { CartItem, OrderType, PaymentMethod } from '@/types';
import { ORDER_TYPES, PAYMENT_METHODS } from '@/types';
import { useLanguage } from '@/i18n/useLanguage';

interface CartProps {
  items: CartItem[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  taxRate: number;
  discount: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onDelete: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
  onOrderTypeChange: (type: OrderType) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onTaxRateChange: (rate: number) => void;
  onDiscountChange: (discount: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  tableNumber: number | null;
  onManageTables: () => void;
  submitting: boolean;
}

export function Cart({
  items,
  orderType,
  paymentMethod,
  taxRate,
  discount,
  onAdd,
  onRemove,
  onDelete,
  onNoteChange,
  onOrderTypeChange,
  onPaymentMethodChange,
  onTaxRateChange,
  onDiscountChange,
  onCheckout,
  onClear,
  tableNumber,
  onManageTables,
  submitting,
}: CartProps) {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const { t, formatPrice } = useLanguage();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);

  const orderTypeLabelMap: Record<OrderType, string> = {
    dine_in: t.dineIn,
    takeaway: t.takeaway,
    delivery: t.delivery,
  };

  const paymentLabelMap: Record<PaymentMethod, string> = {
    cash: t.cash,
    card: t.card,
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.currentOrder}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.itemCount(items.length, items.reduce((s, i) => s + i.quantity, 0))}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            {t.clearAll}
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6">
              <StickyNote className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
              {t.emptyCartTitle}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              {t.emptyCartDesc}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-700/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-slate-800 dark:text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onAdd(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Notes */}
                <div className="flex items-center gap-2">
                  {activeNoteId === item.id ? (
                    <div className="flex flex-1 items-center gap-1">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => onNoteChange(item.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setActiveNoteId(null);
                        }}
                        placeholder={t.notePlaceholder}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        autoFocus
                      />
                      <button
                        onClick={() => setActiveNoteId(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveNoteId(item.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                      {item.notes ? item.notes : t.addNote}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order type + Payment */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
          {/* Order Type */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t.orderType}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ORDER_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => onOrderTypeChange(type)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    orderType === type
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {orderTypeLabelMap[type]}
                </button>
              ))}
            </div>
          </div>
          {orderType === 'dine_in' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                {t.tableNumber}
              </label>
              <button
                onClick={onManageTables}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-start text-sm text-slate-700 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {tableNumber === null ? t.selectTable : `${t.table} ${tableNumber}`}
              </button>
            </div>
          )}
          {/* Payment Method */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t.paymentMethod}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => onPaymentMethodChange(method)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    paymentMethod === method
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {paymentLabelMap[method]}
                </button>
              ))}
            </div>
          </div>
          {/* Tax + Discount */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">{t.taxLabel}</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={taxRate}
                onChange={(e) => onTaxRateChange(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">{t.discountLabel}</label>
              <input
                type="number"
                min={0}
                step={50}
                value={discount}
                onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Totals + Checkout */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t.subtotal}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {formatPrice(subtotal)}
            </span>
          </div>
          {taxRate > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{t.tax(taxRate)}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatPrice(taxAmount)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{t.discount}</span>
              <span className="font-medium text-red-500">
                - {formatPrice(discount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{t.total}</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={onCheckout}
            disabled={submitting}
            className="mt-1 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3.5 text-sm shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            {submitting ? t.processing : t.checkout}
          </button>
        </div>
      )}
    </div>
  );
}
