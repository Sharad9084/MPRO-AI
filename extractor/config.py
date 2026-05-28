from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
STORAGE_DIR = ROOT_DIR / "storage"
RAW_TEXT_DIR = STORAGE_DIR / "raw_text"
PARSED_JSON_DIR = STORAGE_DIR / "parsed_json"
EXPORT_DIR = STORAGE_DIR / "exports"


def ensure_storage_dirs() -> None:
    for path in (RAW_TEXT_DIR, PARSED_JSON_DIR, EXPORT_DIR):
        path.mkdir(parents=True, exist_ok=True)

