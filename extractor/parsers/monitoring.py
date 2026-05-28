from __future__ import annotations

from pathlib import Path
from typing import Any

from extractor.parsers.common import attach_metadata, confidence_for_rows, value_after_label
from extractor.schemas import UploadMetadata


REQUIRED_FIELDS = ["Brand", "Channel Name"]


def parse_monitoring_report(text: str, file_name: str, metadata: UploadMetadata) -> tuple[list[dict[str, Any]], str, list[str]]:
    row = {
        "Source Type": "monitoring_report",
        "PDF File Name": Path(file_name).name,
        "Advertiser Name": metadata.advertiser_name,
        "Agency Name": metadata.agency_name,
        "Medium": metadata.medium,
        "Campaign Period": metadata.campaign_period,
        "Brand": value_after_label(text, ["PRODUCT", "Brand"]),
        "Channel Name": value_after_label(text, ["CHANNEL", "Channel Name"]),
        "Campaign Name": value_after_label(text, ["CATEGORY", "Campaign Name"]),
        "Proof of Performance": "Monitoring PDF uploaded",
        "Extraction Status": "Header extracted - table parser pending",
    }
    row = attach_metadata(row, metadata)
    confidence, missing = confidence_for_rows([row], REQUIRED_FIELDS)
    row["Parser Confidence"] = confidence
    return [row], confidence, missing

