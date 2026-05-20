# TAG-mPRO Reconciliation

Working local MVP for marketing performance reconciliation and optimisation.

## Open

Open `index.html` in a browser or deploy the folder as a static frontend.

Auditor login:

- Username: `auditor@mpro.com`
- Password: `Auditor@2026`

New accounts can be created from the sign-in screen when the backend API is running. Passwords are hashed by the backend and API case access requires a signed-in session.

If the frontend is deployed without a reachable backend API, the demo auditor account signs in locally and saved cases stay in browser storage. Users can also create browser-local accounts on static deployments.

On Vercel, this repository now includes Python Functions under `api/` for shared backend access. Vercel will not run `backend/server.py` as a persistent Python server; instead `/api/*` routes call the PostgreSQL backend logic per request.

For shared cloud cases, add a hosted PostgreSQL connection string as the Vercel `DATABASE_URL` environment variable, then redeploy.

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

The frontend will call same-domain API routes such as `/api/auth/signin` and `/api/cases`. If `DATABASE_URL` is not set, the app falls back to browser-local accounts and browser storage.

## Current Flow

- Launch screen
- Role selection with 4 roles
- Auditor Login active for now
- CRM-style Accounting workspace with:
  - Compact hover/focus global filters
  - Workspace actions for sample data, export and save
  - Search and active filter chips
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

PDF files can be selected and will be tracked as pending extractor integration. The next step is connecting the existing PDF extractor API so PDF rows load automatically.
