from http.server import BaseHTTPRequestHandler
from api._common import core, ensure_db, require_database, send_json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not require_database(self):
            return
        
        try:
            ensure_db()
            results = {}
            with core.connect() as conn:
                # 1. Check cases in DB
                cases = conn.execute(
                    "SELECT id, name, updated_at FROM reconciliation_cases"
                ).fetchall()
                results["cases"] = [
                    {"id": c["id"], "name": c["name"], "updated_at": str(c["updated_at"])} 
                    for c in cases
                ]
                
                # 2. Check counts for the specific case
                case_id = "e3ac65e8-3ab1-4bcf-80c2-c6603ab87716"
                
                po_row = conn.execute("SELECT COUNT(*) AS cnt FROM po_records WHERE case_id = %s", (case_id,)).fetchone()
                agency_row = conn.execute("SELECT COUNT(*) AS cnt FROM agency_invoice_records WHERE case_id = %s", (case_id,)).fetchone()
                invoice_row = conn.execute("SELECT COUNT(*) AS cnt FROM third_party_invoice_records WHERE case_id = %s", (case_id,)).fetchone()
                monitoring_row = conn.execute("SELECT COUNT(*) AS cnt FROM third_party_monitoring_records WHERE case_id = %s", (case_id,)).fetchone()
                
                results["case_details"] = {
                    "po": po_row["cnt"] if po_row else 0,
                    "agency": agency_row["cnt"] if agency_row else 0,
                    "third_party_invoice": invoice_row["cnt"] if invoice_row else 0,
                    "third_party_monitoring": monitoring_row["cnt"] if monitoring_row else 0,
                }
                
            send_json(self, 200, results)
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
