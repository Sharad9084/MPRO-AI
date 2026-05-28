from __future__ import annotations

import re
import os
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

try:
    import pdfplumber
except ImportError:  # pragma: no cover - depends on local setup
    pdfplumber = None


@dataclass
class PdfText:
    text: str
    method: str
    page_count: int
    warnings: list[str]


def extract_pdf_text(pdf_path: Path) -> PdfText:
    warnings: list[str] = []
    if os.environ.get("MPRO_PDF_TEXT_BACKEND", "").lower() == "pypdf":
        text, page_count = _extract_with_pypdf(pdf_path, warnings)
        cleaned = clean_text(text)
        if _is_weak_text(cleaned):
            warnings.append("Selectable text is weak or missing. OCR fallback will be needed for this PDF.")
        return PdfText(text=cleaned, method="pypdf", page_count=page_count, warnings=warnings)

    text, page_count = _extract_with_pdfplumber(pdf_path, warnings)
    method = "pdfplumber"

    if _is_weak_text(text):
        fallback_text, fallback_pages = _extract_with_pypdf(pdf_path, warnings)
        if len(clean_text(fallback_text)) > len(clean_text(text)):
            text = fallback_text
            page_count = fallback_pages or page_count
            method = "pypdf"

    cleaned = clean_text(text)
    if _is_weak_text(cleaned):
        warnings.append("Selectable text is weak or missing. OCR fallback will be needed for this PDF.")
    return PdfText(text=cleaned, method=method, page_count=page_count, warnings=warnings)


def clean_text(text: str) -> str:
    return (
        str(text or "")
        .replace("\x00", "")
        .replace("\u00a0", " ")
        .replace("\ufeff", "")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
    )


def normalize_line(line: str) -> str:
    return re.sub(r"\s+", " ", str(line or "").replace("\x00", "")).strip()


def text_lines(text: str) -> list[str]:
    return [normalize_line(line) for line in str(text or "").splitlines() if normalize_line(line)]


def compact_text(text: str) -> str:
    return "\n".join(text_lines(text))


def _extract_with_pdfplumber(pdf_path: Path, warnings: list[str]) -> tuple[str, int]:
    if pdfplumber is None:
        warnings.append("pdfplumber is not installed; using pypdf fallback.")
        return "", 0
    pages: list[str] = []
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
                pages.append(page_text)
            return "\n\n".join(pages), len(pdf.pages)
    except Exception as exc:  # pragma: no cover - depends on PDF internals
        warnings.append(f"pdfplumber failed: {exc}")
        return "", 0


def _extract_with_pypdf(pdf_path: Path, warnings: list[str]) -> tuple[str, int]:
    pages: list[str] = []
    try:
        reader = PdfReader(str(pdf_path))
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        return "\n\n".join(pages), len(reader.pages)
    except Exception as exc:  # pragma: no cover - depends on PDF internals
        warnings.append(f"pypdf failed: {exc}")
        return "", 0


def _is_weak_text(text: str) -> bool:
    clean = clean_text(text)
    letters = sum(1 for char in clean if char.isalpha())
    digits = sum(1 for char in clean if char.isdigit())
    return len(clean.strip()) < 80 or (letters + digits) < 40
