import json
import time
import uuid
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from extractor.schemas import UploadMetadata


REMOTE_INVOICE_EXTRACTOR_BASE = "https://invoice-extractor-api-ikyu.onrender.com"
REMOTE_INVOICE_SOURCE_TYPES = {"agency_invoice", "broadcaster_invoice"}


def should_use_remote_invoice_api(source_type: str) -> bool:
    return source_type in REMOTE_INVOICE_SOURCE_TYPES


def extract_with_remote_invoice_api(
    file_content: bytes,
    filename: str,
    source_type: str,
    metadata: UploadMetadata,
) -> dict[str, Any]:
    upload_payload = _post_remote_upload(file_content, filename, source_type, metadata)
    if upload_payload.get("task_id"):
        result = _poll_remote_status(str(upload_payload["task_id"]))
    else:
        result = upload_payload

    rows = _normalize_remote_result(result, filename, source_type, metadata)
    return {
        "sourceType": source_type,
        "fileName": filename,
        "template": "render_invoice_extractor",
        "confidence": "remote",
        "rows": rows,
        "missingFields": [],
        "warnings": _remote_warnings(result),
    }


def _post_remote_upload(file_content: bytes, filename: str, source_type: str, metadata: UploadMetadata) -> dict[str, Any]:
    boundary = f"----TagMproBoundary{uuid.uuid4().hex}"
    form_fields = {
        "source_type": source_type,
        "agency_name": metadata.agency_name,
        "medium": metadata.medium,
        "advertiser_name": metadata.advertiser_name,
        "campaign_period": metadata.campaign_period,
    }
    body = _multipart_body(boundary, form_fields, "files", filename, file_content)
    request = Request(
        f"{REMOTE_INVOICE_EXTRACTOR_BASE}/upload",
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    return _json_request(request, timeout=90)


def _poll_remote_status(task_id: str) -> dict[str, Any]:
    started = time.monotonic()
    while time.monotonic() - started < 240:
        query = urlencode({"task_id": task_id})
        request = Request(f"{REMOTE_INVOICE_EXTRACTOR_BASE}/process-status?{query}", method="GET")
        payload = _json_request(request, timeout=30)
        status = str(payload.get("status", "")).lower()
        if status == "complete":
            return payload.get("result") or payload
        if status == "error":
            raise RuntimeError(payload.get("message") or "Remote invoice extraction failed.")
        time.sleep(2)
    raise TimeoutError("Remote invoice extraction timed out.")


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
        raise RuntimeError(f"Remote invoice API returned {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Remote invoice API is not reachable: {exc.reason}") from exc
    return json.loads(raw or "{}")


def _normalize_remote_result(result: dict[str, Any], filename: str, source_type: str, metadata: UploadMetadata) -> list[dict[str, Any]]:
    invoices = _as_list(result.get("invoices"))
    spots = _as_list(result.get("spot_details"))
    rows = []
    if spots:
        for spot in spots:
            header = _matching_invoice(invoices, spot) or (invoices[0] if invoices else {})
            rows.append(_map_remote_row(source_type, filename, metadata, header, spot))
    else:
        for invoice in invoices:
            rows.append(_map_remote_row(source_type, filename, metadata, invoice, {}))

    if not rows:
        label = "broadcaster_invoice" if source_type == "broadcaster_invoice" else "agency_invoice"
        rows.append(
            {
                "Source Type": label,
                "File Name": filename,
                "Status": "No rows extracted by remote invoice API",
            }
        )
    return rows


def _map_remote_row(
    source_type: str,
    filename: str,
    metadata: UploadMetadata,
    invoice: dict[str, Any],
    spot: dict[str, Any],
) -> dict[str, Any]:
    if source_type == "broadcaster_invoice":
        return _map_broadcaster_row(filename, metadata, invoice, spot)
    return _map_agency_row(filename, metadata, invoice, spot)


def _map_agency_row(filename: str, metadata: UploadMetadata, invoice: dict[str, Any], spot: dict[str, Any]) -> dict[str, Any]:
    return _drop_empty(
        {
            "Source Type": "agency_invoice",
            "File Name": filename,
            "Status": "Extracted via invoice extractor API - review",
            "Quality Issues": _field(invoice, "errors", "error", "warnings"),
            "Agency Name": _field(invoice, "agency_name", "agency") or metadata.agency_name,
            "Advertiser Name": _field(invoice, "advertiser_name", "advertiser", "client_name", "client") or metadata.advertiser_name,
            "Medium": metadata.medium,
            "Invoice Number": _field(invoice, "invoice_number", "invoice_no", "invoice"),
            "Invoice Date": _field(invoice, "invoice_date", "date"),
            "Campaign Period": _field(invoice, "campaign_period", "activity_month", "billing_period", "period") or metadata.campaign_period,
            "Estimate Number": _field(invoice, "estimate_number", "estimate_no"),
            "Estimate Period": _field(invoice, "estimate_period"),
            "PR Number": _field(invoice, "pr_number", "pr_no"),
            "PO Number": _field(invoice, "po_number", "po_no", "client_po_number", "ro_number"),
            "Brand": _field(invoice, "brand", "brand_name", "product"),
            "Campaign Name": _field(invoice, "campaign_name", "campaign", "description", "activity"),
            "Total Value Including Taxes": _field(invoice, "total_value_including_taxes", "total_amount_payable", "grand_total", "invoice_value", "total"),
            "Channel Name": _field(spot, "channel_name", "channel", "station_relation", "stn"),
            "Program": _field(spot, "program", "programme", "show", "telecast_program"),
            "Time Band": _field(spot, "time_band", "time_range", "sales_unit"),
            "Broadcaster Name": _field(spot, "broadcaster_name", "producer", "producer_name", "publisher_name", "vendor_name"),
            "Date": _field(spot, "date", "telecast_date", "air_date", "dates"),
            "Date Wise Spots": _field(spot, "date_wise_spots", "spots", "no_of_spots", "spot_count"),
            "Spot Duration": _field(spot, "spot_duration", "duration", "duration_sec", "len"),
            "Spot Rate Per 10 Sec": _field(spot, "spot_rate_per_10_sec", "net_spot_rate", "rate", "rate_inr"),
            "Net Cost": _field(spot, "net_cost", "amount", "calculated_amount", "final_amount", "total"),
        }
    )


def _map_broadcaster_row(filename: str, metadata: UploadMetadata, invoice: dict[str, Any], spot: dict[str, Any]) -> dict[str, Any]:
    vendor = _field(invoice, "broadcaster_name", "publisher_name", "vendor_name", "producer_name") or _field(
        spot, "broadcaster_name", "producer", "producer_name", "publisher_name", "vendor_name"
    )
    return _drop_empty(
        {
            "Source Type": "broadcaster_invoice",
            "File Name": filename,
            "Status": "Extracted via invoice extractor API - review",
            "Quality Issues": _field(invoice, "errors", "error", "warnings"),
            "Media Type": metadata.medium,
            "Advertiser Name": _field(invoice, "advertiser_name", "advertiser", "client_name", "client") or metadata.advertiser_name,
            "Third Party Vendor Name": vendor,
            "Agency Name": _field(invoice, "agency_name", "agency") or metadata.agency_name,
            "Medium": metadata.medium,
            "Channel Name": _field(spot, "channel_name", "channel", "station_relation", "stn") or _field(invoice, "channel_name", "channel"),
            "Billing Period": _field(invoice, "billing_period", "campaign_period", "activity_month", "period") or metadata.campaign_period,
            "PR Number": _field(invoice, "pr_number", "pr_no"),
            "PO Number": _field(invoice, "po_number", "po_no", "client_po_number", "ro_number"),
            "Invoice Number": _field(invoice, "invoice_number", "invoice_no", "invoice"),
            "Invoice Date": _field(invoice, "invoice_date", "date"),
            "Brand": _field(invoice, "brand", "brand_name", "product"),
            "TP": _field(spot, "tp", "telecast_program"),
            "Program": _field(spot, "program", "programme", "show", "telecast_program"),
            "Date": _field(spot, "date", "telecast_date", "air_date", "dates"),
            "Day": _field(spot, "day"),
            "Air Time": _field(spot, "air_time", "telecast_time", "time"),
            "Duration Sec": _field(spot, "duration_sec", "duration", "spot_duration", "len"),
            "Spot Copy Caption": _field(spot, "spot_copy_caption", "caption", "spot_copy"),
            "Rate INR": _field(spot, "rate_inr", "rate", "spot_rate_per_10_sec", "net_spot_rate"),
            "Calculated Amount INR": _field(spot, "calculated_amount_inr", "final_amount_inr", "net_cost", "amount", "total"),
        }
    )


def _matching_invoice(invoices: list[dict[str, Any]], spot: dict[str, Any]) -> Optional[dict[str, Any]]:
    spot_invoice = _normalize_key(_field(spot, "invoice_number", "invoice_no", "invoice"))
    if not spot_invoice:
        return None
    for invoice in invoices:
        invoice_number = _normalize_key(_field(invoice, "invoice_number", "invoice_no", "invoice"))
        if invoice_number and invoice_number == spot_invoice:
            return invoice
    return None


def _field(row: dict[str, Any], *aliases: str) -> str:
    if not row:
        return ""
    normalized = {_normalize_key(key): value for key, value in row.items()}
    for alias in aliases:
        value = normalized.get(_normalize_key(alias))
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return ""


def _normalize_key(value: Any) -> str:
    return "".join(ch for ch in str(value or "").lower() if ch.isalnum())


def _drop_empty(row: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in row.items() if value not in ("", None)}


def _as_list(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _remote_warnings(result: dict[str, Any]) -> list[str]:
    warnings = result.get("warnings")
    if isinstance(warnings, list):
        return [str(item) for item in warnings]
    return []
