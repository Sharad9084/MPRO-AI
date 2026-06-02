from http.server import BaseHTTPRequestHandler
from api._common import core, options, read_json, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_POST(self):
        if not require_database(self):
            return
        user = core.require_user(self)
        if not user:
            send_json(self, 401, {"error": "Unauthorized"})
            return
        try:
            payload = read_json(self)
            case_id = payload.get("case_id")
            if not case_id:
                send_json(self, 400, {"error": "case_id is required"})
                return
            result = core.finalize_case(case_id, user)
            send_json(self, 200, result)
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
