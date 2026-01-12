# QUANTA Database Migrations

This directory contains Alembic migrations for the QUANTA database.

## Setup

Ensure Alembic is installed:

```bash
pip install alembic
```

## Commands

### Check Current Revision

```bash
cd backend
alembic current
```

### Upgrade to Latest

```bash
alembic upgrade head
```

### Downgrade One Revision

```bash
alembic downgrade -1
```

### Create New Migration

Auto-generate from model changes:

```bash
alembic revision --autogenerate -m "Description of changes"
```

Manual migration:

```bash
alembic revision -m "Description of changes"
```

### View Migration History

```bash
alembic history
```

## Important Notes

1. **Always review auto-generated migrations** before applying them
2. **Test migrations on development** before running in production
3. **Backup database** before running migrations in production
4. The initial migration (`001_initial`) creates all tables from scratch

## Production Deployment

For production, set `QUANTA_DATABASE_URL` to your PostgreSQL connection string:

```bash
export QUANTA_DATABASE_URL=postgresql://user:password@host:5432/quanta
alembic upgrade head
```
