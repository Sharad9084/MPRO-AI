from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from extractor.parsers.common import attach_metadata, confidence_for_rows, first_match, money_after_label, value_after_label
from extractor.schemas import UploadMetadata
from extractor.services.pdf_text import text_lines


REQUIRED_FIELDS = ["Advertiser Name", "Broadcaster Name", "Invoice Number", "Invoice Date"]


def parse_broadcaster_invoice(text: str, file_name: str, metadata: UploadMetadata) -> tuple[list[dict[str, Any]], str, list[str]]:
    row = {
        "Source Type": "broadcaster_invoice",
        "PDF File Name": Path(file_name).name,
        "Advertiser Name": metadata.advertiser_name or value_after_label(text, ["Client Name", "Advertiser"]),
        "Broadcaster Name": _extract_broadcaster_name(text),
        "Agency Name": metadata.agency_name or value_after_label(text, ["Agency Name", "Agency"]),
        "Channel Name": _extract_channel_name(text),
        "Billing Period": value_after_label(text, ["Billing Period", "Invoice Period"]),
        "PO Number": first_match(text, r"R\.O\.\s*Number\s*:?\s*([^\n]+)") or first_match(text, r"Client PO Number\s*:?\s*(\d{5,})"),
        "Invoice Number": value_after_label(text, ["Invoice No.", "Invoice No", "Invoice Number"]),
        "Invoice Date": first_match(text, r"Invoice Date\s*:?\s*(\d{1,2}-[A-Za-z]{3}-\d{4})") or value_after_label(text, ["Invoice Date"]),
        "TP": value_after_label(text, ["TP", "Telecast Program"]),
        "Program": value_after_label(text, ["Program"]),
        "Brand": first_match(text, r"Brand(?:\s+Name)?\s*:?\s*([^\n]+)") or value_after_label(text, ["Brand Name", "Brand"]),
        "Rate INR": money_after_label(text, ["Rate", "Rate INR"]),
        "Final Amount INR": money_after_label(text, ["Payable Amount", "Net Amount", "Total"]),
        "Extraction Status": "Header extracted - template parser pending",
    }
    row = attach_metadata(row, metadata)
    confidence, missing = confidence_for_rows([row], REQUIRED_FIELDS)
    row["Parser Confidence"] = confidence
    return [row], confidence, missing


def _extract_broadcaster_name(text: str) -> str:
    beneficiary = value_after_label(text, ["Beneficiary Name"])
    if beneficiary:
        return beneficiary
    for line in text_lines(text)[:12]:
        if re.search(r"\b(PVT|PRIVATE|LIMITED|LTD)\b", line, re.IGNORECASE) and not re.search(r"\b(GROUP M|M-SIX|XIAOMI)\b", line, re.IGNORECASE):
            return line
    return value_after_label(text, ["Broadcaster Name", "Publisher", "Vendor"])


def _extract_channel_name(text: str) -> str:
    lines = text_lines(text)
    for index, line in enumerate(lines):
        if re.search(r"Summary of Channel wise No\.? of Spots", line, re.IGNORECASE):
            for candidate in lines[index + 1:index + 5]:
                match = re.match(r"(.+?)\s+\d+\s+[\d,]+(?:\.\d+)?$", candidate)
                if match and not re.search(r"Channel\s+No", candidate, re.IGNORECASE):
                    return match.group(1).strip()
    return value_after_label(text, ["Channel Name"])
