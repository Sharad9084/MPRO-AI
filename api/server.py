import importlib.util
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from api._common import core, send_json


ROOT = Path(__file__).resolve().parent
HOST = os.getenv("TAG_MPRO_API_HOST", os.getenv("MPRO_API_HOST", "127.0.0.1"))
PORT = int(os.getenv("TAG_MPRO_API_PORT", os.getenv("MPRO_API_PORT", "8787")))


def load_handler(name, relative_path):
    spec = importlib.util.spec_from_file_location(f"api.runtime.{name}", ROOT / relative_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.handler


HANDLERS = {
    "/api/health": load_handler("health", "health.py"),
    "/api/extract": load_handler("extract", "extract.py"),
    "/api/auth/signup": load_handler("auth_signup", "auth/signup.py"),
    "/api/auth/signin": load_handler("auth_signin", "auth/signin.py"),
    "/api/auth/signout": load_handler("auth_signout", "auth/signout.py"),
    "/api/cases": load_handler("cases", "cases.py"),
    "/api/cases/init": load_handler("cases_init", "cases/init.py"),
    "/api/cases/chunk": load_handler("cases_chunk", "cases/chunk.py"),
    "/api/cases/finalize": load_handler("cases_finalize", "cases/finalize.py"),
}
EXTRACTED_DATA_HANDLER = load_handler("extracted_data", "extracted-data.py")


def route_handler(path):
    if path == "/api/extracted-data" or path.startswith("/api/extracted-data/"):
        return EXTRACTED_DATA_HANDLER
    return HANDLERS.get(path)


class ApiHandler(BaseHTTPRequestHandler):
    def dispatch(self):
        path = urlparse(self.path).path.rstrip("/") or "/"
        target = route_handler(path)
        if target is None:
            send_json(self, 404, {"error": "Not found"})
            return
        method = getattr(target, f"do_{self.command}", None)
        if method is None:
            send_json(self, 405, {"error": "Method not allowed"})
            return
        method(self)

    def do_OPTIONS(self):
        self.dispatch()

    def do_GET(self):
        self.dispatch()

    def do_POST(self):
        self.dispatch()


def main():
    core.init_db()
    print(f"TAG-mPRO API running at http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), ApiHandler).serve_forever()


if __name__ == "__main__":
    main()
