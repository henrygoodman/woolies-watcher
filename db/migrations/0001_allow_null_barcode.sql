-- Start the transaction
BEGIN;

-- Add the new id column as a serial type
ALTER TABLE products ADD COLUMN IF NOT EXISTS id SERIAL;

-- Drop the existing primary key constraint on the barcode column
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pkey;

-- Allow the barcode column to be nullable
ALTER TABLE products ALTER COLUMN barcode DROP NOT NULL;

-- Add a unique index on barcode to maintain uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_barcode ON products (barcode);

-- Add the new primary key constraint on the id column
ALTER TABLE products ADD PRIMARY KEY (id);

-- Optionally clean up duplicates based on some criteria
-- This step ensures no duplicate rows based on the product fields
DELETE FROM products
WHERE ctid NOT IN (
  SELECT MIN(ctid)
  FROM products
  GROUP BY product_name, product_brand, current_price, product_size, url
);

-- Commit the transaction
COMMIT;
