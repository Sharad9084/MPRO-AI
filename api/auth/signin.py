from http.server import BaseHTTPRequestHandler

from api._common import core, options, read_json, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_POST(self):
        if not require_database(self):
            return
        try:
            session = core.authenticate_user(read_json(self))
            send_json(self, 200, session)
        except ValueError as exc:
            send_json(self, 401, {"error": str(exc)})
        except Exception:
            send_json(self, 500, {"error": "Signin failed."})
