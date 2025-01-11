ALTER TABLE products
ADD COLUMN creation_date TIMESTAMP;

UPDATE products
SET creation_date = '2025-01-07'
WHERE creation_date IS NULL;

ALTER TABLE products
ALTER COLUMN creation_date SET DEFAULT NOW();
