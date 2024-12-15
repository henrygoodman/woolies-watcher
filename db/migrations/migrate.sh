#!/bin/bash
set -e

# Database connection parameters
DB_USER="postgres"
DB_NAME="woolies-watcher"
DB_HOST="db"
MIGRATIONS_DIR="/migrations"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "Waiting for PostgreSQL to be ready..."

until pg_isready -h "$DB_HOST" -U "$DB_USER"; do
  sleep 1
done

echo "PostgreSQL is ready."

echo "Ensuring migration_history table exists..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    migration_name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

apply_migration() {
  local migration="$1"
  local migration_name=$(basename "$migration")

  already_applied=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT COUNT(*) FROM migration_history WHERE migration_name = '$migration_name';")

  if [ "$already_applied" -eq 0 ]; then
    echo "Applying migration: $migration_name"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c \
      "INSERT INTO migration_history (migration_name) VALUES ('$migration_name');"
    echo "Migration applied: $migration_name"
  else
    echo "Migration already applied: $migration_name"
  fi
}

revert_migration() {
  local migration="$1"
  local migration_name=$(basename "$migration" | sed 's/_down.sql/_up.sql/')

  already_applied=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT COUNT(*) FROM migration_history WHERE migration_name = '$migration_name';")

  if [ "$already_applied" -eq 1 ]; then
    echo "Reverting migration: $migration_name"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c \
      "DELETE FROM migration_history WHERE migration_name = '$migration_name';"
    echo "Migration reverted: $migration_name"
  else
    echo "Migration not applied, skipping: $migration_name"
  fi
}

apply_migrations() {
  echo "Applying all 'up' migrations..."
  for migration in "$MIGRATIONS_DIR"/*_up.sql; do
    apply_migration "$migration"
  done
  echo "All 'up' migrations applied successfully."
}

revert_migrations() {
  echo "Reverting all 'down' migrations..."
  for migration in "$MIGRATIONS_DIR"/*_down.sql; do
    revert_migration "$migration"
  done
  echo "All 'down' migrations reverted successfully."
}

# Main logic
if [ -z "$1" ]; then
  # Default to applying all 'up' migrations
  echo "No arguments provided. Applying all 'up' migrations."
  apply_migrations
elif [ "$1" == "up" ]; then
  if [ -n "$2" ]; then
    # Apply a specific migration
    apply_migration "$MIGRATIONS_DIR/$2"
  else
    # Apply all migrations
    apply_migrations
  fi
elif [ "$1" == "down" ]; then
  if [ -n "$2" ]; then
    # Revert a specific migration
    revert_migration "$MIGRATIONS_DIR/$2"
  else
    # Revert all migrations
    revert_migrations
  fi
else
  echo "Usage: $0 [up|down] [migration_name.sql]"
  exit 1
fi
