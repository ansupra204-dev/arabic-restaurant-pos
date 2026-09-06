export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  image_url: string | null;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card';
export type KitchenStatus = 'pending' | 'ready';

export interface Order {
  id: string;
  order_number: number;
  order_type: OrderType;
  table_number: number | null;
  payment_method: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  tax_rate: number;
  discount: number;
  total: number;
  status: string;
  kitchen_status: KitchenStatus;
  created_at: string;
}

// Category keys stored in the database (Arabic), translated at display time
export const CATEGORY_KEYS = ['برجر', 'بيتزا', 'وجبات', 'مشروبات', 'تحلية'] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const ORDER_TYPES: OrderType[] = ['dine_in', 'takeaway', 'delivery'];
export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card'];
