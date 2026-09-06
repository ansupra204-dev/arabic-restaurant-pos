/*
# Create POS tables for Arabic Restaurant POS

## Overview
Creates the database schema for a single-tenant Arabic Restaurant Point of Sale system.
No authentication/sign-in is required, so policies allow anon + authenticated access.

## New Tables

### menu_items
- `id` (uuid, primary key)
- `name` (text, not null) — item name in Arabic
- `category` (text, not null) — one of: برجر, بيتزا, وجبات, مشروبات, تحلية
- `price` (numeric, not null) — price in Algerian Dinar
- `image_url` (text) — optional product image URL
- `description` (text) — optional item description
- `available` (boolean, default true) — whether the item is currently orderable
- `sort_order` (integer, default 0) — display ordering
- `created_at` (timestamptz, default now())

### orders
- `id` (uuid, primary key)
- `order_number` (integer, not null) — sequential order number for receipt printing
- `order_type` (text, not null) — one of: dine_in, takeaway, delivery
- `payment_method` (text, not null) — one of: cash, card
- `items` (jsonb, not null) — array of {name, price, quantity, notes}
- `subtotal` (numeric, not null)
- `tax_rate` (numeric, default 0) — tax percentage applied
- `discount` (numeric, default 0) — discount amount in Dinar
- `total` (numeric, not null)
- `status` (text, default 'completed')
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on both tables.
- Policies allow anon + authenticated full CRUD (single-tenant, no auth, intentionally shared data).

## Notes
1. The order_number sequence is managed via a separate sequence for sequential receipt numbers.
2. No user_id columns since this is a no-auth single-tenant POS app.
*/

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL,
  image_url text,
  description text,
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer NOT NULL,
  order_type text NOT NULL,
  payment_method text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  tax_rate numeric(5, 2) DEFAULT 0,
  discount numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for menu_items (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
CREATE POLICY "anon_insert_menu_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
CREATE POLICY "anon_update_menu_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
CREATE POLICY "anon_delete_menu_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for orders (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);
