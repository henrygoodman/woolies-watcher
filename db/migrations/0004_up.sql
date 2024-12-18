ALTER TABLE user_config
ADD CONSTRAINT unique_user_config UNIQUE (user_id, config_key);
