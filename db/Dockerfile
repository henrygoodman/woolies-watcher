FROM postgres:14

WORKDIR /app

COPY init.sql ./init.sql
COPY migrations/ ./migrations/

RUN chmod +x ./migrations/migrate.sh

ENV MIGRATIONS_DIR=/app/migrations

CMD ["./migrations/migrate.sh"]
