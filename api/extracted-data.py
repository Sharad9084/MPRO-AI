from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from api._common import core, options, read_json, require_database, send_json


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        if not require_database(self):
            return

        # Parse source type and case_id from URL: /api/extracted-data?source=agency
        # OR called as /api/extracted-data/agency via Vercel rewrite
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        source_type = qs.get("source", [None])[0]
        if not source_type:
            # Try to extract from path segment e.g. /api/extracted-data/agency
            parts = parsed.path.rstrip("/").split("/")
            if len(parts) >= 3:
                source_type = parts[-1]

        if not source_type or source_type not in core.SOURCE_TABLES:
            send_json(self, 400, {
                "error": f"Invalid source type '{source_type}'. Valid: {list(core.SOURCE_TABLES.keys())}"
            })
            return

        case_id = qs.get("case_id", [None])[0]

        try:
            limit = int(qs.get("limit", ["200"])[0])
            offset = int(qs.get("offset", ["0"])[0])
        except ValueError:
            limit, offset = 200, 0

        limit = max(1, min(limit, 2000))

        try:
            user = core.require_user(self)
            if not user:
                send_json(self, 401, {"error": "Unauthorized"})
                return
            data, total = core.get_extracted_data_by_source(source_type, user, case_id, limit, offset)
            send_json(self, 200, {
                "data": data,
                "sourceType": source_type,
                "total": total,
                "limit": limit,
                "offset": offset,
            })
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})

    def do_POST(self):
        if not require_database(self):
            return
        user = core.require_user(self)
        if not user:
            send_json(self, 401, {"error": "Unauthorized"})
            return
        action = urlparse(self.path).path.rstrip("/").rsplit("/", 1)[-1]
        try:
            if action == "save":
                payload = read_json(self)
                case = core.save_extracted_data(payload.get("datasets", {}), payload.get("metadata", {}), user)
                send_json(self, 200, {"case": case})
            elif action == "clear":
                core.clear_extracted_data(user)
                send_json(self, 200, {"ok": True})
            else:
                send_json(self, 404, {"error": "Not found"})
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
