# TAG-mPRO Reconciliation

Working local MVP for marketing performance reconciliation and optimisation.

## Open

Open `index.html` in a browser or deploy the folder as a static frontend.

Auditor login:

- Username: `auditor@mpro.com`
- Password: `Auditor@2026`

New accounts can be created from the sign-in screen when the backend API is running. Passwords are hashed by the backend and API case access requires a signed-in session.

For local development or direct-file testing without a reachable backend API, the demo auditor account can sign in locally and saved cases stay in browser storage. On a deployed Vercel domain, configure PostgreSQL so shared links use real database storage.

On Vercel, this repository now includes Python Functions under `api/` for shared backend access. Vercel will not run `backend/server.py` as a persistent Python server; instead `/api/*` routes call the PostgreSQL backend logic per request.

PDF uploads call the integrated `/api/extract` Python Function first. That route uses the bundled `extractor/` package from the MPro PDF extraction engine and returns structured JSON rows for the frontend tables. If the route is not reachable during local/direct-file testing, the browser PDF.js parser is used as a fallback.

For shared cloud cases, add a hosted PostgreSQL connection string in Vercel environment variables, then redeploy. Supported names are `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEON_DATABASE_URL`, or `SUPABASE_DB_URL`.

## SQL Mode

Run the local SQLite API first:

```powershell
python backend\server.py
```

Then open `index.html`. When the API is running, Save writes the reconciliation case into:

```text
backend/mpro_reconciliation.db
```

If the API is not running or not configured for a deployed frontend, the app still works with the demo auditor account and falls back to browser storage.

## PostgreSQL Mode

Install the PostgreSQL Python driver:

```powershell
pip install -r backend\requirements-postgres.txt
```

Create a PostgreSQL database named `mpro_reconciliation`, then set your connection string:

```powershell
$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mpro_reconciliation"
python backend\server_postgres.py
```

PostgreSQL uses the same frontend and same API URL:

```text
http://127.0.0.1:8787
```

So after `server_postgres.py` is running, open `index.html` exactly like before.

## Vercel Backend Mode

Deploy this repository to Vercel and set:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

The frontend calls same-domain API routes such as `/api/auth/signin` and `/api/cases`. If a deployed Vercel site does not have PostgreSQL configured, sign-in shows a cloud database error instead of silently behaving like shared storage.
The frontend also calls `/api/extract` for PDF extraction; this route does not require PostgreSQL.

Recommended Vercel setup:

1. Create a hosted PostgreSQL database with Vercel Postgres, Neon, or Supabase.
2. Add its connection string to the Vercel project as `DATABASE_URL` or `POSTGRES_URL`.
3. Redeploy the project.
4. Open `/api/health` on the deployed domain. It should return `{"ok": true, "database": "postgres", "configured": true}`.
5. Sign in, save a reconciliation, then open the same link in another browser and sign in again to confirm shared database storage.

## Current Flow

- Launch screen
- Role selection with 4 roles
- Auditor Login active for now
- CRM-style Accounting workspace with:
  - Compact hover/focus global filters
  - Workspace actions for sample data, export and save
  - Search and active filter chips
  - Basic filters for budget, invoice number, PR number, PO number, invoice date, proof of performance, expense monitoring, campaign type, campaign manager, and program name
  - Compact upload cards
  - Configurable columns and polished table states
- Accounting page with 5 upload boxes:
  - Media Schedule
  - Agency Invoice
  - 3rd Party Invoice
  - 3rd Party Monitoring Report
  - PO
- 8 workflow tabs plus Reconciliation and Combined views
- Filters are generated from all uploaded data
- Missing columns stay visible but disabled until data has values
- Basic reconciliation checks:
  - PO missing
  - Agency invoice missing
  - Broadcaster invoice missing
  - Monitoring missing
  - PO vs agency amount mismatch
  - Agency vs broadcaster amount review

## Sample Files

Use these files to test the upload boxes:

- `sample-po.csv`
- `sample-media-schedule.csv`
- `sample-agency-invoice.csv`
- `sample-third-party-invoice.csv`
- `sample-third-party-monitoring-report.csv`
- `sample-program.csv`
- `sample-pr.csv`

PDF files are sent to `/api/extract` when available and extracted rows load automatically into the selected table. Browser PDF.js extraction remains as a fallback for local/direct-file testing.
