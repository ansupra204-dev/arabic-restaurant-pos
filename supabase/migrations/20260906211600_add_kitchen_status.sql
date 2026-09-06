ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS kitchen_status text NOT NULL DEFAULT 'pending';

UPDATE orders
SET kitchen_status = 'ready'
WHERE kitchen_status = 'pending'
  AND status = 'completed';

CREATE INDEX IF NOT EXISTS idx_orders_kitchen_status
  ON orders (kitchen_status, created_at);
