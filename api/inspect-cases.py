from http.server import BaseHTTPRequestHandler
from api._common import core, ensure_db, require_database, send_json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not require_database(self):
            return
        
        try:
            ensure_db()
            results = []
            with core.connect() as conn:
                cases = conn.execute("SELECT id, name, updated_at FROM reconciliation_cases ORDER BY updated_at DESC").fetchall()
                for c in cases:
                    case_id = c["id"]
                    results.append({
                        "id": case_id,
                        "name": c["name"],
                        "updated_at": str(c["updated_at"]),
                        "counts": {
                            "po": conn.execute("SELECT COUNT(*) AS cnt FROM po_records WHERE case_id = %s", (case_id,)).fetchone()["cnt"],
                            "agency": conn.execute("SELECT COUNT(*) AS cnt FROM agency_invoice_records WHERE case_id = %s", (case_id,)).fetchone()["cnt"],
                            "third_party_invoice": conn.execute("SELECT COUNT(*) AS cnt FROM third_party_invoice_records WHERE case_id = %s", (case_id,)).fetchone()["cnt"],
                            "third_party_monitoring": conn.execute("SELECT COUNT(*) AS cnt FROM third_party_monitoring_records WHERE case_id = %s", (case_id,)).fetchone()["cnt"],
                        }
                    })
            send_json(self, 200, {"cases": results})
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
