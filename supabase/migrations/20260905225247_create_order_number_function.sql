/*
# Create get_next_order_number function

## Overview
Creates a SECURITY DEFINER function that atomically increments and returns the next order number
from the order_number_seq sequence. This ensures sequential order numbers for receipt printing.

## New Functions
- `get_next_order_number()` — returns the next integer from order_number_seq

## Security
- SECURITY DEFINER so the anon role can call it (anon cannot access sequences directly).
- Granted EXECUTE to anon and authenticated.
*/

CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val integer;
BEGIN
  next_val := nextval('order_number_seq');
  RETURN next_val;
END;
$$;

GRANT EXECUTE ON FUNCTION get_next_order_number() TO anon, authenticated;
