-- Create `users` table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                            -- Unique ID for each user
    email VARCHAR(255) UNIQUE NOT NULL,              -- Email must be unique
    name VARCHAR(255),                               -- Optional name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Automatically set creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Automatically set updated timestamp
);

-- Create `products` table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,                            -- Unique identifier for each product
    barcode VARCHAR(255) UNIQUE,                     -- Optional unique barcode
    product_name VARCHAR(255) NOT NULL,              -- Name is required
    product_brand VARCHAR(255),                      -- Optional brand
    current_price DECIMAL(10, 2) NOT NULL,           -- Price cannot be NULL
    product_size VARCHAR(50),                        -- Optional size description
    url TEXT NOT NULL,                               -- URL must always be provided
    image_url TEXT DEFAULT '/images/placeholder.jpeg', -- Default placeholder for missing images
    watch_count INT DEFAULT 0,                       -- Count of users watching the product
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically set updated timestamp
);

-- Create an index for faster searches on product names
CREATE INDEX idx_product_name ON products (product_name);

-- Create `watchlist` table
CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,           -- Unique ID for the record
    user_id INTEGER NOT NULL,        -- Reference to the user (INTEGER type now)
    product_id INTEGER NOT NULL,     -- Reference to the product (INTEGER type now)
    added_at TIMESTAMP DEFAULT NOW(),-- Automatically set timestamp
    UNIQUE (user_id, product_id),    -- Prevent duplicate user-product pairs
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);