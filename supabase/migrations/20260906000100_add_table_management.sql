ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS table_number integer;

CREATE INDEX IF NOT EXISTS idx_orders_open_dine_in
  ON orders (order_type, status, table_number)
  WHERE order_type = 'dine_in' AND status = 'open';
