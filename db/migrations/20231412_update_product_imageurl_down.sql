-- 20231213_update_placeholder_image_down.sql
-- Down migration: Revert image_url to the old placeholder

UPDATE products
SET image_url = 'https://placehold.co/200'
WHERE image_url = '/images/placeholder.jpeg';
