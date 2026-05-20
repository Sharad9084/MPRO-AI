from http.server import BaseHTTPRequestHandler

from api._common import core, ensure_db, options, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        if not core.configured_database_url():
            send_json(self, 503, {"ok": False, "database": "postgres", "configured": False, "error": "Set DATABASE_URL or POSTGRES_URL in Vercel environment variables."})
            return
        try:
            ensure_db()
            send_json(self, 200, {"ok": True, "database": "postgres", "configured": True})
        except Exception as exc:
            send_json(self, 503, {"ok": False, "database": "postgres", "configured": True, "error": str(exc)})
