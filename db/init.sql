CREATE TABLE products (
    id SERIAL PRIMARY KEY, -- Unique identifier for each product
    barcode VARCHAR(255) UNIQUE, -- Barcode is no longer the primary key, allowing NULL
    product_name VARCHAR(255) NOT NULL, -- Ensures every product has a name
    product_brand VARCHAR(255), -- Brand can be NULL if unknown
    current_price DECIMAL(10, 2) NOT NULL, -- Price cannot be NULL
    product_size VARCHAR(50), -- Optional size description
    url TEXT NOT NULL, -- URL must always be provided
    image_url TEXT, -- Can be NULL if image is not available
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically sets timestamp
);

-- Create an index for faster search on product names
CREATE INDEX idx_product_name ON products (product_name);