from http.server import BaseHTTPRequestHandler

from api._common import core, options, read_json, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        if not require_database(self):
            return
        if not core.require_user(self):
            send_json(self, 401, {"error": "Unauthorized"})
            return
        send_json(self, 200, {"cases": core.list_cases()})

    def do_POST(self):
        if not require_database(self):
            return
        if not core.require_user(self):
            send_json(self, 401, {"error": "Unauthorized"})
            return
        try:
            case = core.upsert_case(read_json(self))
            send_json(self, 200, {"case": case})
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
