from __future__ import annotations

from pathlib import Path
from typing import Any

from extractor.parsers.common import attach_metadata, confidence_for_rows, first_match, money_after_label, value_after_label
from extractor.schemas import UploadMetadata


REQUIRED_FIELDS = ["Agency Name", "Advertiser Name", "Invoice Number", "Invoice Date", "PO Number"]


def parse_agency_invoice(text: str, file_name: str, metadata: UploadMetadata) -> tuple[list[dict[str, Any]], str, list[str]]:
    row = {
        "Source Type": "agency_invoice",
        "PDF File Name": Path(file_name).name,
        "Agency Name": metadata.agency_name or value_after_label(text, ["Agency Name", "Agency"]),
        "Advertiser Name": metadata.advertiser_name or value_after_label(text, ["Advertiser", "Client Name"]),
        "Campaign Period": metadata.campaign_period or value_after_label(text, ["Activity Month", "Campaign Period"]),
        "Invoice Number": value_after_label(text, ["Invoice Number", "Invoice No"]),
        "Invoice Date": first_match(text, r"Invoice Date\s*:?\s*(\d{1,2}-[A-Za-z]{3}-\d{4})") or value_after_label(text, ["Invoice Date"]),
        "Estimate Number": value_after_label(text, ["Estimate Number", "Estimate No"]),
        "Estimate Period": value_after_label(text, ["Estimate Period"]),
        "PO Number": value_after_label(text, ["Client PO Number", "PO Number", "PO No"]),
        "Brand Name": value_after_label(text, ["Brand Name", "Brand"]),
        "Campaign Name": value_after_label(text, ["Campaign Name"]),
        "Total Value Including Taxes": money_after_label(text, ["Total amount payable", "Total amount", "Total Value Including Taxes", "Total Value Incl Taxes", "Invoice Value"]),
        "Extraction Status": "Header extracted - parser expansion pending",
    }
    row = attach_metadata(row, metadata)
    confidence, missing = confidence_for_rows([row], REQUIRED_FIELDS)
    row["Parser Confidence"] = confidence
    return [row], confidence, missing
