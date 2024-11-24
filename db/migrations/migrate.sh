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

echo "PostgreSQL is ready. Applying migrations..."

for migration in "$MIGRATIONS_DIR"/*.sql; do
  echo "Applying migration: $migration"
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration"
done

echo "All migrations applied successfully."
