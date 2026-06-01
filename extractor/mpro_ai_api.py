import json
import uuid
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from extractor.schemas import UploadMetadata


MPRO_AI_EXTRACTOR_BASE = "https://mpro-ai.vercel.app/api"
MPRO_AI_SOURCE_TYPES = {"po", "monitoring_report", "media_schedule"}


def should_use_mpro_ai_api(source_type: str) -> bool:
    return source_type in MPRO_AI_SOURCE_TYPES


def extract_with_mpro_ai_api(
    file_content: bytes,
    filename: str,
    source_type: str,
    metadata: UploadMetadata,
) -> dict[str, Any]:
    result = _post_mpro_upload(file_content, filename, source_type, metadata)
    rows = _normalize_mpro_result(result, filename, source_type, metadata)
    return {
        "sourceType": source_type,
        "fileName": filename,
        "template": "mpro_ai_extractor",
        "confidence": "remote",
        "rows": rows,
        "missingFields": [],
        "warnings": _mpro_warnings(result),
    }


def _post_mpro_upload(file_content: bytes, filename: str, source_type: str, metadata: UploadMetadata) -> dict[str, Any]:
    boundary = f"----MproAiBoundary{uuid.uuid4().hex}"
    form_fields = {
        "source_type": source_type,
        "agency_name": metadata.agency_name,
        "medium": metadata.medium,
        "advertiser_name": metadata.advertiser_name,
        "campaign_period": metadata.campaign_period,
    }
    body = _multipart_body(boundary, form_fields, "files", filename, file_content)
    request = Request(
        f"{MPRO_AI_EXTRACTOR_BASE}/extract",
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    return _json_request(request, timeout=90)


def _multipart_body(boundary: str, fields: dict[str, str], file_field: str, filename: str, file_content: bytes) -> bytes:
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                str(value or "").encode("utf-8"),
                b"\r\n",
            ]
        )
    chunks.extend(
        [
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode(),
            b"Content-Type: application/pdf\r\n\r\n",
            file_content,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )
    return b"".join(chunks)


def _json_request(request: Request, timeout: int) -> dict[str, Any]:
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Mpro AI API returned {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Mpro AI API is not reachable: {exc.reason}") from exc
    return json.loads(raw or "{}")


def _normalize_mpro_result(result: dict[str, Any], filename: str, source_type: str, metadata: UploadMetadata) -> list[dict[str, Any]]:
    rows_data = result.get("rows") or result.get("data", [])
    if not isinstance(rows_data, list):
        rows_data = []

    rows = []
    if rows_data:
        for row in rows_data:
            if isinstance(row, dict):
                rows.append(_map_mpro_row(source_type, filename, metadata, row))

    if not rows:
        rows.append(
            {
                "Source Type": source_type,
                "File Name": filename,
                "Status": "No rows extracted by Mpro AI API",
            }
        )
    return rows


def _map_mpro_row(source_type: str, filename: str, metadata: UploadMetadata, row: dict[str, Any]) -> dict[str, Any]:
    mapped_row = {**row, "File Name": row.get("File Name") or filename, "Status": "Extracted via Mpro AI API - review"}
    return _drop_empty(mapped_row)


def _drop_empty(row: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in row.items() if value not in ("", None)}


def _mpro_warnings(result: dict[str, Any]) -> list[str]:
    warnings = result.get("warnings")
    if isinstance(warnings, list):
        return [str(item) for item in warnings]
    return []
