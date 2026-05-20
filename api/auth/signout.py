from http.server import BaseHTTPRequestHandler

from api._common import core, options, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_POST(self):
        if not require_database(self):
            return
        core.revoke_session(core.auth_header_token(self))
        send_json(self, 200, {"ok": True})
