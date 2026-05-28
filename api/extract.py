import json
import sys
import tempfile
from email.parser import BytesParser
from email.policy import default
from http.server import BaseHTTPRequestHandler
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from extractor.engine import extract_pdf, result_to_dict  # noqa: E402
from extractor.schemas import UploadMetadata  # noqa: E402


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


def options(handler):
    handler.send_response(204)
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.end_headers()


def parse_multipart(headers, body):
    content_type = headers.get("Content-Type", "")
    message = BytesParser(policy=default).parsebytes(
        b"Content-Type: "
        + content_type.encode("utf-8")
        + b"\r\nMIME-Version: 1.0\r\n\r\n"
        + body
    )
    fields = {}
    files = {}
    for part in message.iter_parts():
        name = part.get_param("name", header="content-disposition")
        if not name:
            continue
        filename = part.get_filename()
        payload = part.get_payload(decode=True) or b""
        if filename:
            files[name] = {"filename": Path(filename).name, "content": payload}
        else:
            fields[name] = payload.decode("utf-8", errors="replace").strip()
    return fields, files


def form_value(fields, key, default=""):
    return str(fields.get(key, default) or "").strip()


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        options(self)

    def do_GET(self):
        send_json(
            self,
            200,
            {
                "ok": True,
                "service": "MPro PDF extraction API",
                "method": "POST",
                "message": "Upload a PDF from the TAG-mPRO frontend or send multipart/form-data with file and source_type.",
                "sourceTypes": ["po", "agency_invoice", "broadcaster_invoice", "monitoring_report", "auto"],
            },
        )

    def do_POST(self):
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            send_json(self, 400, {"error": "Upload a PDF using multipart/form-data."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            fields, files = parse_multipart(self.headers, self.rfile.read(content_length))
            file_item = files.get("file")
            if file_item is None or not file_item.get("filename"):
                send_json(self, 400, {"error": "PDF file is required."})
                return

            filename = file_item["filename"]
            if not filename.lower().endswith(".pdf"):
                send_json(self, 400, {"error": "Only PDF files are supported."})
                return

            metadata = UploadMetadata(
                agency_name=form_value(fields, "agency_name"),
                medium=form_value(fields, "medium"),
                advertiser_name=form_value(fields, "advertiser_name"),
                campaign_period=form_value(fields, "campaign_period"),
            )

            with tempfile.TemporaryDirectory() as temp_dir:
                pdf_path = Path(temp_dir) / filename
                pdf_path.write_bytes(file_item["content"])
                result = extract_pdf(
                    pdf_path,
                    source_type=form_value(fields, "source_type", "auto") or "auto",
                    metadata=metadata,
                    save_debug=False,
                )

            send_json(self, 200, result_to_dict(result))
        except Exception as exc:
            send_json(self, 500, {"error": str(exc)})
