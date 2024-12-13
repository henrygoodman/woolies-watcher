-- Up migration: Update image_url to the new placeholder

UPDATE products
SET image_url = '/images/placeholder.jpeg'
WHERE image_url = 'https://placehold.co/200';
