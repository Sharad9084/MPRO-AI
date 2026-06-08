#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import json
import re
from pathlib import Path
import requests
from datetime import datetime

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuration
ZIP_FOLDER = r"C:\Users\hp\Downloads\Sustenance_Redmi_Note_13_May24\Sustenance_Redmi_Note_13_May24"
API_BASE = "https://mpro-ai.vercel.app"
API_EXTRACT = f"{API_BASE}/api/extract"

# Source type mapping based on folder
SOURCE_MAPPING = {
    "Agency Invoices": "agency_invoice",
    "Broadcaster_Invoice": "broadcaster_invoice",
}

extracted_data = {}

def get_source_type_from_path(file_path):
    """Determine source type from folder name"""
    for folder_name, source_type in SOURCE_MAPPING.items():
        if folder_name in file_path:
            return source_type
    return "agency"

def extract_metadata_from_filename(filename):
    """Extract metadata from filename"""
    metadata = {
        "advertiser_name": "Sustenance",
        "agency_name": "Unknown Agency",
        "campaign_period": "May 2024",
        "start_date": "2024-05-01",
        "end_date": "2024-05-31",
    }

    # Try to extract invoice/PO number from filename
    match = re.search(r'GB(\d+)', filename)
    if match:
        metadata["invoice_number"] = match.group(0)

    return metadata

def upload_pdf_to_api(file_path, source_type):
    """Upload PDF to API and get extracted data"""
    try:
        filename = Path(file_path).name
        metadata = extract_metadata_from_filename(filename)

        print(f"[PROCESS] {filename} ({source_type})...", end=" ", flush=True)

        with open(file_path, 'rb') as f:
            files = {
                'file': (filename, f, 'application/pdf')
            }
            data = {
                'source_type': source_type,
                'agency_name': metadata.get('agency_name', ''),
                'advertiser_name': metadata.get('advertiser_name', ''),
                'campaign_period': metadata.get('campaign_period', ''),
            }

            response = requests.post(API_EXTRACT, files=files, data=data, timeout=120)

            if response.status_code == 200:
                result = response.json()
                print("[OK] Extracted")

                # Store extracted data
                if source_type not in extracted_data:
                    extracted_data[source_type] = []

                rows = result.get('rows', [])
                extracted_data[source_type].extend(rows)

                return True
            else:
                print(f"[ERROR] Status: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False

    except Exception as e:
        print(f"[ERROR] Exception: {str(e)[:100]}")
        return False

def save_all_data_to_db():
    """Save all extracted data to database"""
    try:
        print("\n[INFO] Saving to database...")

        payload = {
            "datasets": extracted_data,
            "metadata": {
                "name": f"Sustenance_Batch_Upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "campaign": "Sustenance_Redmi_Note_13_May24",
                "total_files": sum(len(rows) for rows in extracted_data.values())
            }
        }

        response = requests.post(
            f"{API_BASE}/api/extracted-data/save",
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            print("[OK] Data saved to database!")
            return True
        else:
            print(f"[ERROR] Failed to save: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"[ERROR] Exception while saving: {str(e)}")
        return False

def process_all_pdfs():
    """Process all PDFs in the folder"""
    pdf_files = []

    # Find all PDF files
    for root, dirs, files in os.walk(ZIP_FOLDER):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))

    if not pdf_files:
        print("[ERROR] No PDF files found!")
        return False

    print(f"[INFO] Found {len(pdf_files)} PDF files to process\n")

    # Sort by folder then filename
    pdf_files.sort()

    success_count = 0
    failed_count = 0

    # Process each PDF
    for idx, pdf_path in enumerate(pdf_files, 1):
        source_type = get_source_type_from_path(pdf_path)

        if upload_pdf_to_api(pdf_path, source_type):
            success_count += 1
        else:
            failed_count += 1

        # Progress indicator
        if idx % 10 == 0:
            print(f"\n[{idx}/{len(pdf_files)}] Processed: {success_count} OK, {failed_count} FAILED")

    print(f"\n{'='*60}")
    print(f"[RESULT] Processing Complete!")
    print(f"[OK] Successful: {success_count}")
    print(f"[ERROR] Failed: {failed_count}")
    print(f"[INFO] Total: {len(pdf_files)}")
    print(f"{'='*60}\n")

    # Save to database
    if extracted_data:
        save_all_data_to_db()

    return success_count > 0

if __name__ == "__main__":
    print("[START] Batch PDF upload and extraction...")
    print(f"[FOLDER] {ZIP_FOLDER}")
    print(f"[API] {API_EXTRACT}\n")

    process_all_pdfs()

    print("[DONE] All complete! Check your website for extracted data.")
