CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT,
  password_salt TEXT,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active_view TEXT NOT NULL DEFAULT 'reconciliation',
  column_orders_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  column_widths_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'imported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS program_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  campaign_id TEXT,
  campaign_name TEXT,
  budget NUMERIC,
  program_manager TEXT,
  brand TEXT,
  advertiser_name TEXT,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pr_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  pr_number TEXT,
  pr_date TEXT,
  pr_description TEXT,
  vendor_name TEXT,
  brand_name TEXT,
  campaign_name TEXT,
  campaign_id TEXT,
  pr_amount NUMERIC,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS po_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  campaign_id TEXT,
  campaign_name TEXT,
  pr_number TEXT,
  advertiser_name TEXT,
  po_number TEXT,
  po_date TEXT,
  agency_name TEXT,
  brand TEXT,
  po_amount_incl_tax NUMERIC,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_schedule_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  campaign_id TEXT,
  campaign_name TEXT,
  pr_number TEXT,
  po_number TEXT,
  advertiser_name TEXT,
  agency_name TEXT,
  brand TEXT,
  channel_name TEXT,
  program TEXT,
  activity_date TEXT,
  day_name TEXT,
  air_time TEXT,
  duration_sec NUMERIC,
  spots NUMERIC,
  rate_inr NUMERIC,
  planned_amount NUMERIC,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agency_invoice_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  agency_name TEXT,
  advertiser_name TEXT,
  invoice_number TEXT,
  invoice_date TEXT,
  campaign_period TEXT,
  estimate_number TEXT,
  estimate_period TEXT,
  pr_number TEXT,
  po_number TEXT,
  campaign_id TEXT,
  brand TEXT,
  campaign_name TEXT,
  total_value_including_taxes NUMERIC,
  channel_name TEXT,
  program TEXT,
  time_band TEXT,
  broadcaster_name TEXT,
  activity_date TEXT,
  date_wise_spots NUMERIC,
  spot_duration NUMERIC,
  spot_rate_per_10_sec NUMERIC,
  net_cost NUMERIC,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS third_party_invoice_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  media_type TEXT,
  advertiser_name TEXT,
  third_party_vendor_name TEXT,
  agency_name TEXT,
  channel_name TEXT,
  billing_period TEXT,
  pr_number TEXT,
  po_number TEXT,
  invoice_number TEXT,
  invoice_date TEXT,
  campaign_id TEXT,
  tp TEXT,
  program TEXT,
  activity_date TEXT,
  day_name TEXT,
  air_time TEXT,
  duration_sec NUMERIC,
  spot_copy_caption TEXT,
  brand TEXT,
  rate_inr NUMERIC,
  calculated_amount_inr NUMERIC,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcaster_invoice_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  advertiser_name TEXT,
  broadcaster_name TEXT,
  agency_name TEXT,
  channel_name TEXT,
  billing_period TEXT,
  po_number TEXT,
  invoice_number TEXT,
  invoice_date TEXT,
  tp TEXT,
  program TEXT,
  activity_date TEXT,
  day_name TEXT,
  air_time TEXT,
  duration_sec NUMERIC,
  spot_copy_caption TEXT,
  brand TEXT,
  rate_inr NUMERIC,
  calculated_amount_inr NUMERIC,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS third_party_monitoring_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  media_type TEXT,
  advertiser_name TEXT,
  agency_name TEXT,
  third_party_vendor_name TEXT,
  channel_name TEXT,
  brand TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  program TEXT,
  activity_date TEXT,
  day_name TEXT,
  air_time TEXT,
  duration_sec NUMERIC,
  spot_copy_caption TEXT,
  monitoring_status TEXT,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  advertiser_name TEXT,
  agency_name TEXT,
  broadcaster_name TEXT,
  channel_name TEXT,
  brand TEXT,
  campaign_name TEXT,
  program TEXT,
  activity_date TEXT,
  day_name TEXT,
  air_time TEXT,
  duration_sec NUMERIC,
  spot_copy_caption TEXT,
  monitoring_status TEXT,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_results (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  po_number TEXT,
  status TEXT NOT NULL,
  issues TEXT,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES reconciliation_cases(id) ON DELETE SET NULL,
  actor TEXT,
  action TEXT NOT NULL,
  details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_case_po ON po_records(case_id, po_number);
CREATE INDEX IF NOT EXISTS idx_program_case_campaign ON program_records(case_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_pr_case_pr ON pr_records(case_id, pr_number);
CREATE INDEX IF NOT EXISTS idx_media_schedule_case_po ON media_schedule_records(case_id, po_number);
CREATE INDEX IF NOT EXISTS idx_agency_case_po_invoice ON agency_invoice_records(case_id, po_number, invoice_number);
CREATE INDEX IF NOT EXISTS idx_third_party_invoice_case_po_invoice ON third_party_invoice_records(case_id, po_number, invoice_number);
CREATE INDEX IF NOT EXISTS idx_broadcaster_case_po_invoice ON broadcaster_invoice_records(case_id, po_number, invoice_number);
CREATE INDEX IF NOT EXISTS idx_third_party_monitoring_case_channel_date ON third_party_monitoring_records(case_id, channel_name, activity_date);
CREATE INDEX IF NOT EXISTS idx_monitoring_case_channel_date ON monitoring_records(case_id, channel_name, activity_date);
CREATE INDEX IF NOT EXISTS idx_recon_case_status ON reconciliation_results(case_id, status);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_case_raw_json ON reconciliation_cases USING GIN (raw_json);
