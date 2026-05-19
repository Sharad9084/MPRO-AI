# TAG-mPRO Reconciliation

Working local MVP for marketing performance reconciliation and optimisation.

## Open

Open `index.html` in a browser.

Auditor login:

- Username: `auditor@mpro.com`
- Password: `Auditor@2026`

New accounts can be created from the sign-in screen when the backend API is running. Passwords are hashed by the backend and API case access requires a signed-in session.

## SQL Mode

Run the local SQLite API first:

```powershell
python backend\server.py
```

Then open `index.html`. When the API is running, Save writes the reconciliation case into:

```text
backend/mpro_reconciliation.db
```

If the API is not running, the frontend still works and falls back to browser storage.

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

## Current Flow

- Launch screen
- Role selection with 4 roles
- Auditor Login active for now
- Accounting page with 4 upload boxes:
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
