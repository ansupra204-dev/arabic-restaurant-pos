import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, CartItem, OrderType, PaymentMethod } from '@/types';

const READY_ORDER_IDS_KEY = 'pos-kitchen-ready-order-ids';
const TABLE_ASSIGNMENTS_KEY = 'pos-table-assignments';
const LOCAL_CUSTOMER_ORDERS_KEY = 'pos-local-customer-orders';
export const CUSTOMER_ORDER_EVENT = 'pos:customer-order-submitted';
export const CUSTOMER_ORDER_STORAGE_KEY = 'pos:customer-order-event';

export function notifyCustomerOrder(order: Order) {
  saveLocalCustomerOrder(order);
  localStorage.setItem(CUSTOMER_ORDER_STORAGE_KEY, JSON.stringify(order));
  window.dispatchEvent(new CustomEvent<Order>(CUSTOMER_ORDER_EVENT, { detail: order }));
}

export function parseCustomerOrder(value: string | null): Order | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Order;
  } catch {
    return null;
  }
}

function isMissingColumn(error: { code?: string; message?: string } | null, columns: string[]) {
  return Boolean(
    error &&
      (error.code === '42703' ||
        columns.some((column) => error.message?.toLowerCase().includes(column.toLowerCase())))
  );
}

function getLocalReadyOrderIds() {
  try {
    const stored = localStorage.getItem(READY_ORDER_IDS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? new Set<string>(parsed) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveLocalReadyOrderId(orderId: string) {
  const readyIds = getLocalReadyOrderIds();
  readyIds.add(orderId);
  localStorage.setItem(READY_ORDER_IDS_KEY, JSON.stringify([...readyIds]));
}

function getLocalTableAssignments() {
  try {
    const stored = localStorage.getItem(TABLE_ASSIGNMENTS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === 'object' ? parsed as Record<string, number> : {};
  } catch {
    return {};
  }
}

function saveLocalTableAssignment(orderId: string, tableNumber: number | null) {
  if (tableNumber === null) return;
  const assignments = getLocalTableAssignments();
  assignments[orderId] = tableNumber;
  localStorage.setItem(TABLE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

function applyLocalTableAssignments(orders: Order[]) {
  const assignments = getLocalTableAssignments();
  return orders.map((order) => ({
    ...order,
    table_number: order.table_number ?? assignments[order.id] ?? null,
  }));
}

function getLocalCustomerOrders(): Order[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_CUSTOMER_ORDERS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed as Order[] : [];
  } catch {
    return [];
  }
}

function saveLocalCustomerOrder(order: Order) {
  const orders = getLocalCustomerOrders().filter((item) => item.id !== order.id);
  localStorage.setItem(LOCAL_CUSTOMER_ORDERS_KEY, JSON.stringify([...orders, order]));
}

function mergeLocalCustomerOrders(orders: Order[]) {
  const ids = new Set(orders.map((order) => order.id));
  return [...orders, ...getLocalCustomerOrders().filter((order) => !ids.has(order.id))];
}

export function createLocalCustomerOrder(items: CartItem[], tableNumber: number, total: number): Order {
  const order: Order = {
    id: `local-customer-${Date.now()}`,
    order_number: Date.now() % 100000,
    order_type: 'dine_in',
    table_number: tableNumber,
    payment_method: 'cash',
    items,
    subtotal: total,
    tax_rate: 0,
    discount: 0,
    total,
    status: 'open',
    kitchen_status: 'pending',
    created_at: new Date().toISOString(),
  };
  saveLocalCustomerOrder(order);
  saveLocalTableAssignment(order.id, tableNumber);
  return order;
}

export function useOrders() {
  const submitOrder = useCallback(
    async (
      items: CartItem[],
      orderType: OrderType,
      paymentMethod: PaymentMethod,
      subtotal: number,
      taxRate: number,
      discount: number,
      total: number,
      tableNumber: number | null
    ): Promise<{ order: Order | null; error: string | null }> => {
      const { data: seqData, error: seqError } = await supabase
        .rpc('get_next_order_number');

      if (seqError || !seqData) {
        return tableNumber !== null
          ? { order: createLocalCustomerOrder(items, tableNumber, total), error: null }
          : { order: null, error: seqError?.message ?? 'order_number_error' };
      }

      const orderNumber = seqData as number;

      let { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          order_type: orderType,
          table_number: tableNumber,
          payment_method: paymentMethod,
          items: items,
          subtotal: subtotal,
          tax_rate: taxRate,
          discount: discount,
          total: total,
          status: orderType === 'dine_in' ? 'open' : 'completed',
          kitchen_status: 'pending',
        })
        .select('*')
        .single();

      if (isMissingColumn(error, ['kitchen_status', 'table_number', 'table_id', 'order_items'])) {
        const fallbackPayload: Record<string, unknown> = {
          order_number: orderNumber,
          order_type: orderType,
          payment_method: paymentMethod,
          items: items,
          subtotal: subtotal,
          tax_rate: taxRate,
          discount: discount,
          total: total,
          status: orderType === 'dine_in' ? 'open' : 'completed',
        };
        if (!isMissingColumn(error, ['table_number', 'table_id'])) {
          fallbackPayload.table_number = tableNumber;
        }
        const fallback = await supabase
          .from('orders')
          .insert(fallbackPayload)
          .select('*')
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        if (tableNumber !== null && isMissingColumn(error, ['kitchen_status', 'table_number', 'table_id', 'order_items'])) {
          return { order: createLocalCustomerOrder(items, tableNumber, total), error: null };
        }
        return { order: null, error: error.message };
      }

      const order = { ...(data as Order), table_number: (data as Order).table_number ?? tableNumber };
      saveLocalTableAssignment(order.id, tableNumber);
      return { order, error: null };
    },
    []
  );

  const fetchTodayOrders = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) return { orders: mergeLocalCustomerOrders([]), error: error.message };
    return { orders: applyLocalTableAssignments(mergeLocalCustomerOrders(data as Order[])), error: null };
  }, []);

  const updateOrder = useCallback(async (
    orderId: string,
    items: CartItem[],
    paymentMethod: PaymentMethod,
    subtotal: number,
    taxRate: number,
    discount: number,
    total: number,
    tableNumber: number | null
  ): Promise<{ order: Order | null; error: string | null }> => {
    let { data, error } = await supabase
      .from('orders')
      .update({
        items,
        payment_method: paymentMethod,
        subtotal,
        tax_rate: taxRate,
        discount,
        total,
        table_number: tableNumber,
        kitchen_status: 'pending',
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (isMissingColumn(error, ['kitchen_status', 'table_number', 'table_id', 'order_items'])) {
      const fallback = await supabase
        .from('orders')
        .update({
          items,
          payment_method: paymentMethod,
          subtotal,
          tax_rate: taxRate,
          discount,
          total,
        })
        .eq('id', orderId)
        .select('*')
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      const localOrder = getLocalCustomerOrders().find((order) => order.id === orderId);
      if (localOrder) {
        const updated = {
          ...localOrder,
          items,
          payment_method: paymentMethod,
          subtotal,
          tax_rate: taxRate,
          discount,
          total,
          kitchen_status: 'pending' as const,
        };
        saveLocalCustomerOrder(updated);
        return { order: updated, error: null };
      }
      return { order: null, error: error.message };
    }
    const order = { ...(data as Order), table_number: (data as Order).table_number ?? tableNumber };
    saveLocalTableAssignment(orderId, tableNumber);
    return { order, error: null };
  }, []);

  const fetchAllOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return { orders: mergeLocalCustomerOrders([]), error: error.message };
    return { orders: mergeLocalCustomerOrders(data as Order[]), error: null };
  }, []);

  const fetchOpenDineInOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_type', 'dine_in')
      .eq('status', 'open')
      .order('table_number', { ascending: true });

    if (isMissingColumn(error, ['table_number', 'table_id'])) {
      const fallback = await supabase
        .from('orders')
        .select('*')
        .eq('order_type', 'dine_in')
        .eq('status', 'open')
        .order('created_at', { ascending: true });
      if (fallback.error) return { orders: [], error: fallback.error.message };
      return { orders: applyLocalTableAssignments(mergeLocalCustomerOrders(fallback.data as Order[])), error: null };
    }
    if (error) return { orders: [], error: error.message };
    return { orders: applyLocalTableAssignments(mergeLocalCustomerOrders(data as Order[])), error: null };
  }, []);

  const settleOrder = useCallback(async (orderId: string, paymentMethod: PaymentMethod) => {
    const localOrder = getLocalCustomerOrders().find((order) => order.id === orderId);
    if (localOrder) {
      const settled = { ...localOrder, status: 'completed', payment_method: paymentMethod };
      saveLocalCustomerOrder(settled);
      return { order: settled, error: null };
    }
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'completed', payment_method: paymentMethod })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) return { order: null, error: error.message };
    return { order: data as Order, error: null };
  }, []);

  const fetchKitchenOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('kitchen_status', 'pending')
      .order('created_at', { ascending: true });

    if (isMissingColumn(error, ['kitchen_status'])) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fallback = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: true })
        .limit(100);

      if (fallback.error) return { orders: [], error: fallback.error.message };
      const readyIds = getLocalReadyOrderIds();
      return {
        orders: mergeLocalCustomerOrders(fallback.data as Order[]).filter((order) => !readyIds.has(order.id)),
        error: null,
      };
    }

    if (error) return { orders: [], error: error.message };
    return { orders: mergeLocalCustomerOrders(data as Order[]), error: null };
  }, []);

  const markOrderReady = useCallback(async (orderId: string) => {
    if (getLocalCustomerOrders().some((order) => order.id === orderId)) {
      saveLocalReadyOrderId(orderId);
      return { order: null, error: null };
    }
    const { data, error } = await supabase
      .from('orders')
      .update({ kitchen_status: 'ready' })
      .eq('id', orderId)
      .select('*')
      .single();

    if (isMissingColumn(error, ['kitchen_status'])) {
      saveLocalReadyOrderId(orderId);
      return { order: null, error: null };
    }
    if (error) return { order: null, error: error.message };
    return { order: data as Order, error: null };
  }, []);

  return {
    submitOrder,
    updateOrder,
    fetchTodayOrders,
    fetchAllOrders,
    fetchOpenDineInOrders,
    settleOrder,
    fetchKitchenOrders,
    markOrderReady,
  };
}
