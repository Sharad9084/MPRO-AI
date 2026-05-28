from __future__ import annotations

from pathlib import Path

from extractor.services.pdf_text import text_lines


def detect_source_type(file_name: str, text: str) -> str:
    haystack = f"{file_name}\n{text[:5000]}".lower()
    if "purchase order" in haystack or "po no" in haystack:
        return "po"
    if "annexure-1" in haystack or "estimate number" in haystack or "activity month" in haystack:
        return "agency_invoice"
    if "monitoring" in haystack or "spot id" in haystack or "advertise start" in haystack:
        return "monitoring_report"
    return "broadcaster_invoice"


def detect_template(source_type: str, file_name: str, text: str) -> str:
    haystack = f"{Path(file_name).name}\n{text[:8000]}".lower()
    lines = text_lines(text)
    first_lines = " ".join(lines[:8]).lower()

    if source_type == "po" and "purchase order" in haystack:
        if "xiaomi" in haystack:
            return "xiaomi_po"
        return "generic_po"

    if source_type == "agency_invoice":
        if "groupm" in haystack or "annexure-1" in haystack:
            return "groupm_agency_invoice"
        return "generic_agency_invoice"

    if source_type == "monitoring_report":
        return "generic_monitoring_report"

    if "schedule broadcast" in haystack or "star india" in haystack:
        return "star_india"
    if "telecast certificate" in haystack:
        return "telecast_certificate"
    if "station relation" in haystack or "stn" in first_lines:
        return "station_relation_invoice"
    if "network18" in haystack or "ibn" in haystack:
        return "network18"
    return "generic_broadcaster_invoice"

