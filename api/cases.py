from http.server import BaseHTTPRequestHandler

from api._common import core, options, read_json, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        if not require_database(self):
            return
        user = core.require_user(self)
        if not user:
            send_json(self, 401, {"error": "Unauthorized"})
            return
        send_json(self, 200, {"cases": core.list_cases_for_user(user)})

    def do_POST(self):
        if not require_database(self):
            return
        user = core.require_user(self)
        if not user:
            send_json(self, 401, {"error": "Unauthorized"})
            return
        try:
            case = core.upsert_case(read_json(self), user)
            send_json(self, 200, {"case": case})
        except ValueError as exc:
            send_json(self, 403, {"error": str(exc)})
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
