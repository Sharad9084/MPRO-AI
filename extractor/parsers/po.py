from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from extractor.parsers.common import (
    attach_metadata,
    confidence_for_rows,
    first_match,
    lines_between,
    money_after_label,
    trim_value,
    value_after_label,
)
from extractor.schemas import UploadMetadata
from extractor.services.pdf_text import text_lines


REQUIRED_FIELDS = [
    "Advertiser Name",
    "PO Number",
    "PO Date",
    "Agency Name",
    "Brand",
    "Description",
    "PO Amount Incl Tax",
]


def parse_po(text: str, file_name: str, metadata: UploadMetadata) -> tuple[list[dict[str, Any]], str, list[str]]:
    header = _extract_header(text, file_name)
    items = _extract_line_items(text)
    if not items:
        items = [{"Brand": header.get("Brand", ""), "Description": header.get("Description", "")}]

    rows = []
    for index, item in enumerate(items, start=1):
        row = {
            **header,
            "Row No": index,
            "Brand": item.get("Brand") or header.get("Brand", ""),
            "Description": item.get("Description") or header.get("Description", ""),
            "Line Amount Excl Tax": item.get("Line Amount Excl Tax", ""),
            "Delivery Date": item.get("Delivery Date", ""),
            "Source Type": "po",
            "PDF File Name": Path(file_name).name,
            "Extraction Status": "Extracted - review",
        }
        rows.append(attach_metadata(row, metadata))

    confidence, missing = confidence_for_rows(rows, REQUIRED_FIELDS)
    for row in rows:
        row["Parser Confidence"] = confidence
        if not missing:
            row["Extraction Status"] = "Review ready"
    return rows, confidence, missing


def _extract_header(text: str, file_name: str) -> dict[str, Any]:
    advertiser = _extract_advertiser(text)
    return {
        "Advertiser Name": advertiser,
        "PO Number": first_match(text, r"\bPO\s+No\s*:?\s*(\d{5,})")
        or first_match(file_name, r"PO[_ -]?(\d{5,})"),
        "PO Date": value_after_label(text, ["Order date", "PO Date", "Purchase Order Date"]),
        "Agency Name": value_after_label(text, ["Vendor", "Agency Name"]),
        "Brand": _extract_first_brand(text),
        "Description": _extract_first_description(text),
        "PO Amount Incl Tax": money_after_label(text, ["TOTAL AMOUNT INCL.TAX", "Total Amount Incl Tax", "Total Amount"]),
    }


def _extract_advertiser(text: str) -> str:
    for line in text_lines(text)[:20]:
        if re.search(r"\b(pvt|private|limited|ltd)\b", line, re.IGNORECASE) and not re.search(r"\bvendor\b", line, re.IGNORECASE):
            return trim_value(line)
    return value_after_label(text, ["Buyer", "Advertiser", "Client Name"])


def _extract_line_items(text: str) -> list[dict[str, str]]:
    block_lines = lines_between(text, r"ORDER\s+DETAILS", r"TOTAL\s+AMOUNT|Please check|Buyer:")
    rows: list[dict[str, str]] = []
    index = 0
    while index < len(block_lines):
        line = block_lines[index]
        combined = _parse_combined_item_line(line)
        if combined:
            rows.append(combined)
            index += 1
            continue

        brand_match = re.match(r"^\d{1,4}\s*([A-Z][A-Z0-9 &./()-]{2,})$", line)
        if not brand_match:
            index += 1
            continue

        brand = trim_value(brand_match.group(1))
        description_line = ""
        for look_ahead in range(index + 1, min(index + 5, len(block_lines))):
            candidate = block_lines[look_ahead]
            if _looks_like_sku_or_code(candidate):
                continue
            if re.search(r"[A-Za-z].*\d[\d,]*(?:\.\d+)?", candidate) and not re.search(r"^\d+$", candidate):
                description_line = candidate
                break
        description = _description_from_detail_line(description_line)
        amount = _last_money_before_date(description_line)
        delivery_date = first_match(description_line, r"(\d{4}-\d{2}-\d{2})")
        rows.append(
            {
                "Brand": brand,
                "Description": description,
                "Line Amount Excl Tax": amount,
                "Delivery Date": delivery_date,
            }
        )
        index += 1
    return rows


def _parse_combined_item_line(line: str) -> dict[str, str] | None:
    match = re.match(
        r"^\d{1,4}\s+(.+?)\s+\d+\s+(-?\d[\d,]*(?:\.\d+)?)\s+(?:\d+(?:\.\d+)?%\s+){0,3}(-?\d[\d,]*(?:\.\d+)?)\s+(\d{4}-\d{2}-\d{2})$",
        trim_value(line, max_chars=500),
    )
    if not match:
        return None
    detail = trim_value(match.group(1), max_chars=260)
    brand, description = _split_brand_description(detail)
    return {
        "Brand": brand,
        "Description": description,
        "Line Amount Excl Tax": match.group(3).replace(",", ""),
        "Delivery Date": match.group(4),
    }


def _split_brand_description(detail: str) -> tuple[str, str]:
    tokens = detail.split()
    split_at = 0
    for index, token in enumerate(tokens):
        if index and (any(char.islower() for char in token) or any(char.isdigit() for char in token)):
            split_at = index
            break
    if not split_at:
        split_at = min(2, len(tokens))
    brand = " ".join(tokens[:split_at]).strip()
    description = _normalize_description(" ".join(tokens[split_at:]).strip())
    return brand, description


def _extract_first_brand(text: str) -> str:
    items = _extract_line_items(text)
    if items:
        return items[0]["Brand"]
    return value_after_label(text, ["Brand", "Project"])


def _extract_first_description(text: str) -> str:
    items = _extract_line_items(text)
    if items:
        return items[0]["Description"]
    return value_after_label(text, ["Description", "Campaign Name"])


def _description_from_detail_line(line: str) -> str:
    clean = trim_value(line, max_chars=260)
    clean = re.sub(r"\s+\d[\d,]*(?:\.\d+)?(?:\s+|$).*$", "", clean).strip()
    return _normalize_description(clean)


def _normalize_description(value: str) -> str:
    return re.sub(r"\b(\d+)\s+PC\b", r"\1PC", trim_value(value), flags=re.IGNORECASE)


def _last_money_before_date(line: str) -> str:
    without_date = re.sub(r"\d{4}-\d{2}-\d{2}.*$", "", line or "")
    amounts = re.findall(r"\d[\d,]*(?:\.\d+)?", without_date)
    return amounts[-1].replace(",", "") if amounts else ""


def _looks_like_sku_or_code(line: str) -> bool:
    clean = trim_value(line)
    if re.fullmatch(r"\d{4,}", clean):
        return True
    if re.fullmatch(r"[A-Z]{2,}\d[A-Z0-9-]{4,}", clean):
        return True
    return False
