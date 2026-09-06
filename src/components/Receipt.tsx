import { forwardRef } from 'react';
import type { CartItem, OrderType, PaymentMethod } from '@/types';
import { useLanguage } from '@/i18n/useLanguage';

interface ReceiptProps {
  orderNumber: number;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  date: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      orderNumber,
      orderType,
      paymentMethod,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      date,
    },
    ref
  ) => {
    const { t, formatPrice } = useLanguage();

    const orderTypeLabel: Record<OrderType, string> = {
      dine_in: t.dineIn,
      takeaway: t.takeaway,
      delivery: t.delivery,
    };

    const paymentLabel: Record<PaymentMethod, string> = {
      cash: t.cash,
      card: t.card,
    };

    return (
      <div
        ref={ref}
        id="receipt-print-area"
        className="receipt-print mx-auto bg-white text-black font-mono"
        style={{ width: '80mm', padding: '4mm 3mm' }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-lg font-bold">
              {t.logoLetter}
            </div>
            <h2 className="text-lg font-bold">{t.restaurantName}</h2>
          </div>
          <p className="text-[10px] text-gray-500">{t.restaurantAddress}</p>
          <p className="text-[10px] text-gray-500">{t.restaurantPhone}</p>
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Order info */}
        <div className="text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span>{t.orderNumber}</span>
            <span className="font-bold">#{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.date}</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.orderType}:</span>
            <span>{orderTypeLabel[orderType]}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.paymentMethod}:</span>
            <span>{paymentLabel[paymentMethod]}</span>
          </div>
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Items table */}
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-start pb-1 font-bold">{t.item}</th>
              <th className="text-center pb-1 font-bold">{t.qty}</th>
              <th className="text-end pb-1 font-bold">{t.price}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="py-0.5 text-start">
                  {item.name}
                  {item.notes && (
                    <div className="text-[9px] text-gray-500">  {item.notes}</div>
                  )}
                </td>
                <td className="py-0.5 text-center">{item.quantity}</td>
                <td className="py-0.5 text-end whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Totals */}
        <div className="text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span>{t.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between">
              <span>{t.tax(taxRate)}</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between">
              <span>{t.discount}</span>
              <span>- {formatPrice(discount)}</span>
            </div>
          )}
        </div>

        <div className="my-1.5 border-t border-dashed border-gray-400" />

        <div className="flex justify-between text-sm font-bold">
          <span>{t.total}</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Footer */}
        <div className="text-center text-[11px]">
          <p className="font-bold">{t.thankYou}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{t.enjoyMeal}</p>
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        <div className="text-center text-[9px] text-gray-400">
          <p>{t.electronicallyGenerated}</p>
          <p>{new Date().toISOString().split('T')[0]}</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
