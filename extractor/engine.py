from __future__ import annotations

import json
from pathlib import Path

from extractor.config import PARSED_JSON_DIR, RAW_TEXT_DIR, ensure_storage_dirs
from extractor.parsers.agency_invoice import parse_agency_invoice
from extractor.parsers.broadcaster.generic import parse_broadcaster_invoice
from extractor.parsers.monitoring import parse_monitoring_report
from extractor.parsers.po import parse_po
from extractor.schemas import ExtractionResult, SOURCE_TYPES, UploadMetadata
from extractor.services.fingerprint import detect_source_type, detect_template
from extractor.services.pdf_text import extract_pdf_text


def extract_pdf(
    pdf_path: Path,
    source_type: str = "auto",
    metadata: UploadMetadata | None = None,
    save_debug: bool = True,
) -> ExtractionResult:
    if source_type not in SOURCE_TYPES:
        raise ValueError(f"Unsupported source type: {source_type}")
    if not pdf_path.exists():
        raise FileNotFoundError(str(pdf_path))
    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError("Only PDF files are supported.")

    ensure_storage_dirs()
    metadata = metadata or UploadMetadata()
    pdf_text = extract_pdf_text(pdf_path)
    resolved_source_type = detect_source_type(pdf_path.name, pdf_text.text) if source_type == "auto" else source_type
    template = detect_template(resolved_source_type, pdf_path.name, pdf_text.text)

    rows, confidence, missing_fields = _parse_by_source(resolved_source_type, pdf_text.text, pdf_path.name, metadata)
    warnings = list(pdf_text.warnings)
    if not rows:
        warnings.append("No rows extracted.")

    raw_text_path = ""
    if save_debug:
        raw_text_path = _save_raw_text(pdf_path, pdf_text.text)

    result = ExtractionResult(
        source_type=resolved_source_type,
        file_name=pdf_path.name,
        template=template,
        confidence=confidence,
        rows=rows,
        missing_fields=missing_fields,
        warnings=warnings,
        raw_text_path=raw_text_path,
    )
    if save_debug:
        _save_result_json(result)
    return result


def result_to_dict(result: ExtractionResult) -> dict:
    return {
        "sourceType": result.source_type,
        "fileName": result.file_name,
        "template": result.template,
        "confidence": result.confidence,
        "rows": result.rows,
        "missingFields": result.missing_fields,
        "warnings": result.warnings,
        "rawTextPath": result.raw_text_path,
    }


def _parse_by_source(
    source_type: str,
    text: str,
    file_name: str,
    metadata: UploadMetadata,
) -> tuple[list[dict], str, list[str]]:
    if source_type == "po":
        return parse_po(text, file_name, metadata)
    if source_type == "agency_invoice":
        return parse_agency_invoice(text, file_name, metadata)
    if source_type == "monitoring_report":
        return parse_monitoring_report(text, file_name, metadata)
    return parse_broadcaster_invoice(text, file_name, metadata)


def _save_raw_text(pdf_path: Path, text: str) -> str:
    output_path = RAW_TEXT_DIR / f"{pdf_path.stem}.txt"
    output_path.write_text(text, encoding="utf-8")
    return str(output_path)


def _save_result_json(result: ExtractionResult) -> str:
    output_path = PARSED_JSON_DIR / f"{Path(result.file_name).stem}.json"
    output_path.write_text(json.dumps(result_to_dict(result), indent=2, ensure_ascii=False), encoding="utf-8")
    return str(output_path)

