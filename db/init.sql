CREATE TABLE products (
    barcode VARCHAR(255) PRIMARY KEY,
    product_name VARCHAR(255),
    product_brand VARCHAR(255),
    current_price DECIMAL(10, 2),
    product_size VARCHAR(50),
    url TEXT,
    image_url TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_name ON products (product_name);