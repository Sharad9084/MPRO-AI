from __future__ import annotations

import re
from typing import Any

from extractor.schemas import UploadMetadata
from extractor.services.pdf_text import text_lines


def first_match(text: str, pattern: str, flags: int = re.IGNORECASE) -> str:
    match = re.search(pattern, text or "", flags)
    return trim_value(match.group(1)) if match else ""


def value_after_label(text: str, labels: list[str], max_chars: int = 180) -> str:
    for label in labels:
        pattern = rf"{re.escape(label)}\s*:?\s*(.+)"
        match = re.search(pattern, text or "", re.IGNORECASE)
        if match:
            return trim_value(match.group(1), max_chars=max_chars)
    return ""


def money_after_label(text: str, labels: list[str]) -> str:
    for label in labels:
        pattern = rf"{re.escape(label)}\s*:?\s*(-?\d[\d,]*(?:\.\d+)?)"
        match = re.search(pattern, text or "", re.IGNORECASE)
        if match:
            return normalize_money(match.group(1))
    return ""


def trim_value(value: Any, max_chars: int = 180) -> str:
    clean = re.sub(r"\s+", " ", str(value or "")).strip()
    clean = re.sub(r"^[:-]+|[:-]+$", "", clean).strip()
    return clean[:max_chars]


def normalize_money(value: Any) -> str:
    clean = str(value or "").strip().replace(",", "")
    return clean if re.fullmatch(r"-?\d+(?:\.\d+)?", clean) else ""


def attach_metadata(row: dict[str, Any], metadata: UploadMetadata) -> dict[str, Any]:
    next_row = dict(row)
    if metadata.agency_name:
        next_row["Agency Name"] = next_row.get("Agency Name") or metadata.agency_name
    if metadata.medium:
        next_row["Medium"] = next_row.get("Medium") or metadata.medium
    if metadata.advertiser_name:
        next_row["Advertiser Name"] = next_row.get("Advertiser Name") or metadata.advertiser_name
    if metadata.campaign_period:
        next_row["Campaign Period"] = next_row.get("Campaign Period") or metadata.campaign_period
    return next_row


def confidence_for_rows(rows: list[dict[str, Any]], required_fields: list[str]) -> tuple[str, list[str]]:
    if not rows:
        return "Low", required_fields
    missing = sorted({field for field in required_fields if not any(row.get(field) for row in rows)})
    total = len(required_fields)
    score = (total - len(missing)) / total if total else 1
    if score >= 0.85:
        return "High", missing
    if score >= 0.6:
        return "Medium", missing
    return "Low", missing


def lines_between(text: str, start_pattern: str, end_pattern: str) -> list[str]:
    lines = text_lines(text)
    start = 0
    end = len(lines)
    for index, line in enumerate(lines):
        if re.search(start_pattern, line, re.IGNORECASE):
            start = index + 1
            break
    for index in range(start, len(lines)):
        if re.search(end_pattern, lines[index], re.IGNORECASE):
            end = index
            break
    return lines[start:end]

