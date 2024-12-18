CREATE TABLE IF NOT EXISTS user_config (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  config_key TEXT NOT NULL,
  config_value TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
