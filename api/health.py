from http.server import BaseHTTPRequestHandler
import os

from api._common import core, options, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        if not require_database(self):
            return
        send_json(self, 200, {"ok": True, "database": "postgres", "configured": bool(os.getenv("DATABASE_URL"))})
