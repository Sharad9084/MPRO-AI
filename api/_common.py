import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend import server_postgres as core  # noqa: E402


DB_READY = False


def ensure_db():
    global DB_READY
    if DB_READY:
        return
    core.DATABASE_URL = core.configured_database_url()
    if not core.DATABASE_URL:
        raise RuntimeError("PostgreSQL connection string is not configured.")
    core.init_db()
    DB_READY = True


def send_json(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.end_headers()
    handler.wfile.write(body)


def read_json(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    if not length:
        return {}
    return json.loads(handler.rfile.read(length).decode("utf-8"))


def options(handler):
    handler.send_response(204)
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.end_headers()


def require_database(handler):
    if core.configured_database_url():
        ensure_db()
        return True
    send_json(handler, 503, {"error": "PostgreSQL is not configured. Set DATABASE_URL or POSTGRES_URL in Vercel environment variables."})
    return False
