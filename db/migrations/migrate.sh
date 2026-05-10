#!/bin/bash
set -e

# Support DATABASE_URL (Railway) or individual vars (Docker Compose)
if [ -n "$DATABASE_URL" ]; then
  PSQL_CONN="$DATABASE_URL"
  PG_READY_CONN="-d $DATABASE_URL"
else
  DB_HOST="${PGHOST:-db}"
  export PGPASSWORD="$POSTGRES_PASSWORD"
  PSQL_CONN="-h $DB_HOST -U $POSTGRES_USER -d $POSTGRES_DB"
  PG_READY_CONN="-h $DB_HOST -U $POSTGRES_USER"
fi

MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"

echo "Waiting for PostgreSQL to be ready..."

until pg_isready $PG_READY_CONN; do
  sleep 1
done

echo "PostgreSQL is ready."

# Run init.sql if schema doesn't exist yet
if [ -f "$MIGRATIONS_DIR/../init.sql" ]; then
  INITIALIZED=$(psql $PSQL_CONN -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products');")
  if [ "$INITIALIZED" = "f" ]; then
    echo "Running init.sql..."
    psql $PSQL_CONN -f "$MIGRATIONS_DIR/../init.sql"
    echo "init.sql applied."
  else
    echo "Schema already initialized, skipping init.sql."
  fi
fi

echo "Ensuring migration_history table exists..."
psql $PSQL_CONN -c "
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    migration_name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

apply_migration() {
  local migration="$1"
  local migration_name=$(basename "$migration")

  already_applied=$(psql $PSQL_CONN -tAc \
    "SELECT COUNT(*) FROM migration_history WHERE migration_name = '$migration_name';")

  if [ "$already_applied" -eq 0 ]; then
    echo "Applying migration: $migration_name"
    psql $PSQL_CONN -f "$migration"
    psql $PSQL_CONN -c \
      "INSERT INTO migration_history (migration_name) VALUES ('$migration_name');"
    echo "Migration applied: $migration_name"
  else
    echo "Migration already applied: $migration_name"
  fi
}

revert_migration() {
  local migration="$1"
  local migration_name=$(basename "$migration" | sed 's/_down.sql/_up.sql/')

  already_applied=$(psql $PSQL_CONN -tAc \
    "SELECT COUNT(*) FROM migration_history WHERE migration_name = '$migration_name';")

  if [ "$already_applied" -eq 1 ]; then
    echo "Reverting migration: $migration_name"
    psql $PSQL_CONN -f "$migration"
    psql $PSQL_CONN -c \
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