# Database Setup Guide

## Prerequisites

1. Docker and Docker Compose installed
2. Python environment with dependencies installed

## Setup Steps

### 1. Environment Variables

Copy the `.env.example` file to `.env` in the project root and update the values:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL password and user if needed.

### 2. Start PostgreSQL Database

From the project root, start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Adminer (database admin UI) on port 8080

### 3. Install Python Dependencies

Install the updated dependencies including SQLAlchemy, psycopg2, and Alembic:

```bash
cd packages/api
pip install -e .
```

### 4. Seed the Database

Run the seed script to create initial data:

```bash
cd packages/api
python seed_db.py
```

### 5. Run the API

Start the FastAPI application:

```bash
cd packages/api
python -m care_cartography_api
```

## Database Migrations (Optional)

If you need to create database migrations using Alembic:

```bash
cd packages/api

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Database Administration

Access Adminer at http://localhost:8080 with these credentials:
- System: PostgreSQL
- Server: db
- Username: (value from POSTGRES_USER in .env)
- Password: (value from POSTGRES_PASSWORD in .env)
- Database: care_cartography

## Database Schema

### Tables

**institutions**
- `id` (String, Primary Key): Institution identifier
- `name` (String): Institution name
- `created_at` (DateTime): Creation timestamp

**ratings**
- `id` (Integer, Primary Key): Auto-incrementing ID
- `institution_id` (String, Foreign Key): References institutions.id
- `rating` (Integer): Rating value
- `created_at` (DateTime): Creation timestamp

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Check that Docker containers are running:
   ```bash
   docker compose ps
   ```

2. Check the database logs:
   ```bash
   docker compose logs db
   ```

3. Verify environment variables are set correctly in `.env`

### Reset Database

To completely reset the database:

```bash
docker compose down -v
docker compose up -d
cd packages/api
python seed_db.py
```
