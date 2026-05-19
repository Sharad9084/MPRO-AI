# TAG-mPRO SQL API

Local SQL backend for the TAG-mPRO reconciliation frontend.

## Run

From `C:\Users\hp\OneDrive\Desktop\fronted`:

```powershell
python backend\server.py
```

The API starts at:

```text
http://127.0.0.1:8787
```

The frontend will automatically use this API if it is running. If the API is not running, the app falls back to browser storage.

## Endpoints

- `GET /api/health`
- `GET /api/cases`
- `POST /api/cases`

## Database

The local development database is SQLite:

```text
backend/mpro_reconciliation.db
```

The schema is intentionally relational so it can be moved to PostgreSQL later:

- `users`
- `reconciliation_cases`
- `uploaded_files`
- `po_records`
- `agency_invoice_records`
- `broadcaster_invoice_records`
- `monitoring_records`
- `reconciliation_results`
- `audit_logs`

## PostgreSQL

Install driver:

```powershell
pip install -r backend\requirements-postgres.txt
```

Set connection string and run:

```powershell
$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mpro_reconciliation"
python backend\server_postgres.py
```

PostgreSQL schema:

```text
backend/schema.postgres.sql
```
