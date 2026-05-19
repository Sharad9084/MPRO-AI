import json
import hashlib
import hmac
import os
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

try:
    import psycopg
    from psycopg.rows import dict_row
    from psycopg.types.json import Jsonb
except ImportError as exc:
    raise SystemExit(
        "psycopg is required. Install it with: pip install -r backend\\requirements-postgres.txt"
    ) from exc


ROOT = Path(__file__).resolve().parent
SCHEMA_PATH = ROOT / "schema.postgres.sql"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/mpro_reconciliation")
HOST = os.getenv("TAG_MPRO_API_HOST", os.getenv("MPRO_API_HOST", "127.0.0.1"))
PORT = int(os.getenv("TAG_MPRO_API_PORT", os.getenv("MPRO_API_PORT", "8787")))


SOURCE_TABLES = {
    "program": "program_records",
    "pr": "pr_records",
    "po": "po_records",
    "mediaSchedule": "media_schedule_records",
    "agency": "agency_invoice_records",
    "thirdPartyInvoice": "third_party_invoice_records",
    "thirdPartyMonitoring": "third_party_monitoring_records",
}


FIELD_ALIASES = {
    "advertiser_name": ["Advertiser Name", "Advertiser"],
    "campaign_id": ["Campaign ID", "Program ID"],
    "budget": ["Budget", "Campaign Budget", "Program Budget"],
    "program_manager": ["Program Manager", "Campaign Manager"],
    "pr_number": ["PR Number", "PR No", "PR"],
    "pr_date": ["PR Date"],
    "pr_description": ["PR Description", "Description"],
    "vendor_name": ["Vendor Name", "Agency Name", "Third Party Vendor Name"],
    "brand_name": ["Brand Name", "Brand"],
    "pr_amount": ["PR Amount", "Purchase Requisition Amount", "Estimate Amount"],
    "po_number": ["PO Number", "PO No", "PO"],
    "po_date": ["PO Date"],
    "agency_name": ["Agency Name", "Agency", "Vendor"],
    "brand": ["Brand", "Brand Name", "Project"],
    "campaign_name": ["Campaign Name", "Campaign", "Description"],
    "po_amount_incl_tax": ["PO Amount Incl Tax", "PO Amount", "PO Amount incl Tax"],
    "invoice_number": ["Invoice Number", "Invoice No"],
    "invoice_date": ["Invoice Date"],
    "campaign_period": ["Campaign Period", "Activity Month", "Billing Period"],
    "estimate_number": ["Estimate Number", "Estimate No"],
    "estimate_period": ["Estimate Period"],
    "total_value_including_taxes": ["Total Value Including Taxes", "Total Value", "Invoice Value"],
    "channel_name": ["Channel Name", "Channel", "Station Relation", "STN"],
    "program": ["Program"],
    "time_band": ["Time Band", "Time Range/Sales Unit"],
    "broadcaster_name": ["Broadcaster Name", "Broadcaster", "Producer"],
    "activity_date": ["Date", "Activity Date", "Telecast Date"],
    "date_wise_spots": ["Date Wise Spots", "Spots"],
    "spot_duration": ["Spot Duration", "Duration Sec", "LEN (Duration Sec)"],
    "spot_rate_per_10_sec": ["Spot Rate Per 10 Sec", "Spot Rate"],
    "net_cost": ["Net Cost"],
    "billing_period": ["Billing Period"],
    "media_type": ["Media Type", "Medium"],
    "third_party_vendor_name": ["Third Party Vendor Name", "Broadcaster Name", "Publisher Name", "Vendor Name", "Producer"],
    "tp": ["TP", "Telecast Program"],
    "day_name": ["Day", "Dy"],
    "air_time": ["Air Time", "Telecast Time"],
    "duration_sec": ["Duration Sec", "LEN (Duration Sec)", "Spot Duration"],
    "spot_copy_caption": ["Spot Copy Caption", "Spot Copy (Caption)", "Caption"],
    "rate_inr": ["Rate INR", "Rate (INR)", "Rate"],
    "spots": ["Spots", "Date Wise Spots", "Spot Count"],
    "planned_amount": ["Planned Amount", "Schedule Amount", "Media Schedule Amount"],
    "calculated_amount_inr": ["Calculated Amount INR", "Calculate final amount (INR)"],
    "monitoring_status": ["Monitoring Status", "Status"],
}


TABLE_COLUMNS = {
    "program_records": [
        "campaign_id",
        "campaign_name",
        "budget",
        "program_manager",
        "brand",
        "advertiser_name",
    ],
    "pr_records": [
        "pr_number",
        "pr_date",
        "pr_description",
        "vendor_name",
        "brand_name",
        "campaign_name",
        "campaign_id",
        "pr_amount",
    ],
    "po_records": [
        "campaign_id",
        "campaign_name",
        "pr_number",
        "advertiser_name",
        "po_number",
        "po_date",
        "agency_name",
        "brand",
        "campaign_name",
        "po_amount_incl_tax",
    ],
    "media_schedule_records": [
        "campaign_id",
        "campaign_name",
        "pr_number",
        "po_number",
        "advertiser_name",
        "agency_name",
        "brand",
        "channel_name",
        "program",
        "activity_date",
        "day_name",
        "air_time",
        "duration_sec",
        "spots",
        "rate_inr",
        "planned_amount",
    ],
    "agency_invoice_records": [
        "agency_name",
        "advertiser_name",
        "invoice_number",
        "invoice_date",
        "campaign_period",
        "estimate_number",
        "estimate_period",
        "pr_number",
        "po_number",
        "campaign_id",
        "brand",
        "campaign_name",
        "total_value_including_taxes",
        "channel_name",
        "program",
        "time_band",
        "broadcaster_name",
        "activity_date",
        "date_wise_spots",
        "spot_duration",
        "spot_rate_per_10_sec",
        "net_cost",
    ],
    "third_party_invoice_records": [
        "media_type",
        "advertiser_name",
        "third_party_vendor_name",
        "agency_name",
        "channel_name",
        "billing_period",
        "pr_number",
        "po_number",
        "invoice_number",
        "invoice_date",
        "campaign_id",
        "tp",
        "program",
        "activity_date",
        "day_name",
        "air_time",
        "duration_sec",
        "spot_copy_caption",
        "brand",
        "rate_inr",
        "calculated_amount_inr",
    ],
    "third_party_monitoring_records": [
        "media_type",
        "advertiser_name",
        "agency_name",
        "third_party_vendor_name",
        "channel_name",
        "brand",
        "campaign_id",
        "campaign_name",
        "program",
        "activity_date",
        "day_name",
        "air_time",
        "duration_sec",
        "spot_copy_caption",
        "monitoring_status",
    ],
}


NUMERIC_COLUMNS = {
    "budget",
    "pr_amount",
    "po_amount_incl_tax",
    "total_value_including_taxes",
    "date_wise_spots",
    "spot_duration",
    "spot_rate_per_10_sec",
    "net_cost",
    "duration_sec",
    "spots",
    "planned_amount",
    "rate_inr",
    "calculated_amount_inr",
}


POSTGRES_COLUMN_MIGRATIONS = {
    "users": {
        "password_hash": "TEXT",
        "password_salt": "TEXT",
        "failed_attempts": "INTEGER NOT NULL DEFAULT 0",
        "locked_until": "TIMESTAMPTZ",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT NOW()",
    },
    "po_records": {
        "campaign_id": "TEXT",
        "campaign_name": "TEXT",
        "pr_number": "TEXT",
    },
    "agency_invoice_records": {
        "pr_number": "TEXT",
        "campaign_id": "TEXT",
    },
}

PASSWORD_ITERATIONS = 120_000
MAX_FAILED_ATTEMPTS = 5
LOCK_MINUTES = 15
ALLOWED_ROLES = {"Auditor", "Agency", "Advertiser"}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def parse_iso(value):
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PASSWORD_ITERATIONS)
    return salt, digest.hex()


def verify_password(password, salt, expected_hash):
    if not salt or not expected_hash:
        return False
    _, actual_hash = hash_password(password, salt)
    return hmac.compare_digest(actual_hash, expected_hash)


def validate_password(password):
    if len(password) < 8:
        return "Password minimum 8 characters ka hona chahiye."
    if not re.search(r"[A-Z]", password):
        return "Password me ek uppercase letter hona chahiye."
    if not re.search(r"[a-z]", password):
        return "Password me ek lowercase letter hona chahiye."
    if not re.search(r"\d", password):
        return "Password me ek number hona chahiye."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password me ek special character hona chahiye."
    return None


def public_user(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "displayName": row["display_name"],
        "role": row["role"],
    }


def hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(conn, user_id):
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
    conn.execute(
        """
        INSERT INTO auth_sessions(id, user_id, token_hash, expires_at)
        VALUES (%s, %s, %s, %s)
        """,
        (str(uuid.uuid4()), user_id, hash_token(token), expires_at),
    )
    return token, expires_at


def auth_header_token(handler):
    header = handler.headers.get("Authorization", "")
    if header.lower().startswith("bearer "):
        return header.split(" ", 1)[1].strip()
    return ""


def require_user(handler):
    token = auth_header_token(handler)
    if not token:
        return None
    with connect() as conn:
        row = conn.execute(
            """
            SELECT users.*
            FROM auth_sessions
            JOIN users ON users.id = auth_sessions.user_id
            WHERE auth_sessions.token_hash = %s
              AND auth_sessions.revoked_at IS NULL
              AND auth_sessions.expires_at > %s
            """,
            (hash_token(token), datetime.now(timezone.utc)),
        ).fetchone()
    return row


def connect():
    return psycopg.connect(database_url_with_timeout(DATABASE_URL), row_factory=dict_row)


def database_url_with_timeout(url):
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    query.setdefault("connect_timeout", ["5"])
    return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))


def init_db():
    with connect() as conn:
        conn.execute(SCHEMA_PATH.read_text(encoding="utf-8"))
        ensure_postgres_columns(conn)
        salt, password_hash = hash_password("Auditor@2026")
        conn.execute(
            """
            INSERT INTO users(id, username, display_name, role, password_hash, password_salt)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT(username) DO NOTHING
            """,
            (str(uuid.uuid4()), "auditor@mpro.com", "TAG-mPRO Auditor", "Auditor", password_hash, salt),
        )
        conn.execute(
            """
            UPDATE users
            SET password_hash = COALESCE(password_hash, %s),
                password_salt = COALESCE(password_salt, %s)
            WHERE username = %s
            """,
            (password_hash, salt, "auditor@mpro.com"),
        )


def ensure_postgres_columns(conn):
    for table, columns in POSTGRES_COLUMN_MIGRATIONS.items():
        for column, column_type in columns.items():
            conn.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {column_type}")


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_body(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    if not length:
        return {}
    return json.loads(handler.rfile.read(length).decode("utf-8"))


def create_user(payload):
    username = (payload.get("username") or "").strip().lower()
    display_name = (payload.get("displayName") or payload.get("display_name") or "").strip()
    role = (payload.get("role") or "Auditor").strip()
    password = payload.get("password") or ""
    confirm_password = payload.get("confirmPassword") or payload.get("confirm_password") or ""
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", username):
        raise ValueError("Valid email username required.")
    if not display_name:
        raise ValueError("Full name required.")
    if role not in ALLOWED_ROLES:
        raise ValueError("Invalid role selected.")
    if password != confirm_password:
        raise ValueError("Password aur confirm password match nahi kar rahe.")
    password_error = validate_password(password)
    if password_error:
        raise ValueError(password_error)
    salt, password_hash = hash_password(password)
    with connect() as conn:
        try:
            conn.execute(
                """
                INSERT INTO users(id, username, display_name, role, password_hash, password_salt)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), username, display_name, role, password_hash, salt),
            )
        except Exception as exc:
            raise ValueError("Is email se account already exist karta hai.") from exc
        row = conn.execute("SELECT * FROM users WHERE username = %s", (username,)).fetchone()
    return public_user(row)


def authenticate_user(payload):
    username = (payload.get("username") or "").strip().lower()
    password = payload.get("password") or ""
    with connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = %s", (username,)).fetchone()
        if not row:
            raise ValueError("Username ya password galat hai.")
        locked_until = parse_iso(row["locked_until"])
        if locked_until and locked_until > datetime.now(timezone.utc):
            raise ValueError(f"Account temporarily locked hai. {LOCK_MINUTES} minutes baad try karein.")
        if not verify_password(password, row["password_salt"], row["password_hash"]):
            failed_attempts = int(row["failed_attempts"] or 0) + 1
            locked = None
            if failed_attempts >= MAX_FAILED_ATTEMPTS:
                locked = datetime.now(timezone.utc) + timedelta(minutes=LOCK_MINUTES)
            conn.execute(
                "UPDATE users SET failed_attempts = %s, locked_until = %s, updated_at = %s WHERE id = %s",
                (failed_attempts, locked, now_iso(), row["id"]),
            )
            raise ValueError("Username ya password galat hai.")
        conn.execute(
            "UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = %s WHERE id = %s",
            (now_iso(), row["id"]),
        )
        row = conn.execute("SELECT * FROM users WHERE id = %s", (row["id"],)).fetchone()
        token, expires_at = create_session(conn, row["id"])
    return {"user": public_user(row), "token": token, "expiresAt": expires_at.isoformat(), "expiresInSeconds": 8 * 60 * 60}


def revoke_session(token):
    if not token:
        return
    with connect() as conn:
        conn.execute(
            "UPDATE auth_sessions SET revoked_at = %s WHERE token_hash = %s AND revoked_at IS NULL",
            (datetime.now(timezone.utc), hash_token(token)),
        )


def pick(row, canonical):
    for alias in FIELD_ALIASES.get(canonical, []):
        if alias in row and row[alias] not in (None, ""):
            return row[alias]
    return None


def number_or_none(value):
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", "").replace("Rs", "").strip())
    except ValueError:
        return None


def insert_source_rows(conn, case_id, source, rows):
    table = SOURCE_TABLES[source]
    columns = TABLE_COLUMNS[table]
    for row in rows:
        values = []
        for column in columns:
            value = pick(row, column)
            if column in NUMERIC_COLUMNS:
                value = number_or_none(value)
            values.append(value)
        sql_columns = ["id", "case_id", *columns, "raw_json"]
        placeholders = ", ".join(["%s"] * len(sql_columns))
        conn.execute(
            f"INSERT INTO {table}({', '.join(sql_columns)}) VALUES ({placeholders})",
            [str(uuid.uuid4()), case_id, *values, Jsonb(row)],
        )


def insert_uploaded_files(conn, case_id, datasets):
    for source, rows in datasets.items():
        file_names = sorted({row.get("File Name") for row in rows if row.get("File Name")})
        if not file_names and rows:
            file_names = [f"{source}-manual-data"]
        for file_name in file_names:
            conn.execute(
                """
                INSERT INTO uploaded_files(id, case_id, source_type, file_name, row_count, status)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), case_id, source, file_name, len(rows), "imported"),
            )


def upsert_case(payload):
    case = payload.get("case", payload)
    case_id = case.get("id") or str(uuid.uuid4())
    datasets = case.get("datasets") or {}
    updated_at = now_iso()
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO reconciliation_cases(
              id, name, active_view, column_orders_json, column_widths_json, sort_json, raw_json, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT(id) DO UPDATE SET
              name = EXCLUDED.name,
              active_view = EXCLUDED.active_view,
              column_orders_json = EXCLUDED.column_orders_json,
              column_widths_json = EXCLUDED.column_widths_json,
              sort_json = EXCLUDED.sort_json,
              raw_json = EXCLUDED.raw_json,
              updated_at = EXCLUDED.updated_at
            """,
            (
                case_id,
                case.get("name") or "Untitled reconciliation",
                case.get("activeView") or "reconciliation",
                Jsonb(case.get("columnOrders") or {}),
                Jsonb(case.get("columnWidths") or {}),
                Jsonb(case.get("sort") or {}),
                Jsonb(case),
                updated_at,
            ),
        )
        for table in SOURCE_TABLES.values():
            conn.execute(f"DELETE FROM {table} WHERE case_id = %s", (case_id,))
        conn.execute("DELETE FROM uploaded_files WHERE case_id = %s", (case_id,))
        for source, rows in datasets.items():
            if source in SOURCE_TABLES:
                insert_source_rows(conn, case_id, source, rows or [])
        insert_uploaded_files(conn, case_id, datasets)
        conn.execute(
            """
            INSERT INTO audit_logs(id, case_id, actor, action, details_json)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                case_id,
                payload.get("actor") or "auditor@mpro.com",
                "case_saved",
                Jsonb({"rowCount": sum(len(rows or []) for rows in datasets.values())}),
            ),
        )
    case["id"] = case_id
    case["updatedAt"] = updated_at
    return case


def list_cases():
    with connect() as conn:
        rows = conn.execute(
            "SELECT raw_json, updated_at FROM reconciliation_cases ORDER BY updated_at DESC"
        ).fetchall()
    cases = []
    for row in rows:
        case = row["raw_json"]
        case["updatedAt"] = row["updated_at"].isoformat() if hasattr(row["updated_at"], "isoformat") else row["updated_at"]
        cases.append(case)
    return cases


class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            json_response(self, 200, {"ok": True, "database": "postgresql"})
        elif path == "/api/cases":
            if not require_user(self):
                json_response(self, 401, {"error": "Unauthorized"})
                return
            json_response(self, 200, {"cases": list_cases()})
        else:
            json_response(self, 404, {"error": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/auth/signup":
            try:
                user = create_user(read_body(self))
                json_response(self, 201, {"user": user})
            except ValueError as exc:
                json_response(self, 400, {"error": str(exc)})
            except Exception:
                json_response(self, 500, {"error": "Signup failed"})
        elif path == "/api/auth/signin":
            try:
                session = authenticate_user(read_body(self))
                json_response(self, 200, session)
            except ValueError as exc:
                json_response(self, 401, {"error": str(exc)})
            except Exception:
                json_response(self, 500, {"error": "Signin failed"})
        elif path == "/api/auth/signout":
            revoke_session(auth_header_token(self))
            json_response(self, 200, {"ok": True})
        elif path == "/api/cases":
            if not require_user(self):
                json_response(self, 401, {"error": "Unauthorized"})
                return
            try:
                case = upsert_case(read_body(self))
                json_response(self, 200, {"case": case})
            except Exception as exc:
                json_response(self, 500, {"error": str(exc)})
        else:
            json_response(self, 404, {"error": "Not found"})


if __name__ == "__main__":
    try:
        init_db()
    except Exception as exc:
        print("PostgreSQL API could not start.")
        print("Check that PostgreSQL is running, the database exists, and DATABASE_URL has the correct password.")
        print(f"Current DATABASE_URL: {DATABASE_URL}")
        print(f"Error: {exc}")
        raise SystemExit(1)
    print(f"TAG-mPRO PostgreSQL API running at http://{HOST}:{PORT}")
    print(f"Database URL: {DATABASE_URL}")
    HTTPServer((HOST, PORT), Handler).serve_forever()
