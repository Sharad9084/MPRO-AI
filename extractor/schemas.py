from dataclasses import dataclass, field
from typing import Any


@dataclass
class UploadMetadata:
    agency_name: str = ""
    medium: str = ""
    advertiser_name: str = ""
    campaign_period: str = ""


@dataclass
class ExtractionResult:
    source_type: str
    file_name: str
    template: str
    confidence: str
    rows: list[dict[str, Any]]
    missing_fields: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    raw_text_path: str = ""


SOURCE_TYPES = {
    "auto",
    "po",
    "agency_invoice",
    "broadcaster_invoice",
    "monitoring_report",
}

