from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from api._common import core, ensure_db, options, require_database, send_json

SOURCE_TABLES = {
    "agency": "agency_invoice_records",
    "thirdPartyInvoice": "third_party_invoice_records",
    "thirdPartyMonitoring": "third_party_monitoring_records",
    "po": "po_records",
    "mediaSchedule": "media_schedule_records",
    "program": "program_records",
    "pr": "pr_records",
}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        if not require_database(self):
            return

        # Parse source type and case_id from URL: /api/extracted-data?source=agency
        # OR called as /api/extracted-data/agency via Vercel rewrite
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        source_type = qs.get("source", [None])[0]
        if not source_type:
            # Try to extract from path segment e.g. /api/extracted-data/agency
            parts = parsed.path.rstrip("/").split("/")
            if len(parts) >= 3:
                source_type = parts[-1]

        if not source_type or source_type not in SOURCE_TABLES:
            send_json(self, 400, {
                "error": f"Invalid source type '{source_type}'. Valid: {list(SOURCE_TABLES.keys())}"
            })
            return

        case_id = qs.get("case_id", [None])[0]

        try:
            limit = int(qs.get("limit", ["200"])[0])
            offset = int(qs.get("offset", ["0"])[0])
        except ValueError:
            limit, offset = 200, 0

        limit = max(1, min(limit, 2000))

        table = SOURCE_TABLES[source_type]

        if case_id:
            where_clause = "WHERE case_id = %s"
            count_params = (case_id,)
            select_params = (case_id, limit, offset)
        else:
            where_clause = "WHERE case_id = (SELECT id FROM reconciliation_cases ORDER BY updated_at DESC LIMIT 1)"
            count_params = ()
            select_params = (limit, offset)

        try:
            ensure_db()
            with core.connect() as conn:
                total_row = conn.execute(
                    f"SELECT COUNT(*) AS cnt FROM {table} {where_clause}",
                    count_params
                ).fetchone()
                total = total_row["cnt"] if total_row else 0

                rows = conn.execute(
                    f"SELECT raw_json FROM {table} {where_clause} ORDER BY id LIMIT %s OFFSET %s",
                    select_params,
                ).fetchall()

            data = [r["raw_json"] for r in rows]
            send_json(self, 200, {
                "data": data,
                "sourceType": source_type,
                "total": total,
                "limit": limit,
                "offset": offset,
            })
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
