const STORAGE_KEYS = {
  session: "mpro.session.v3",
  cases: "mpro.reconciliation.cases.v2",
  activeCase: "mpro.activeCase.v2",
  accountingFilters: "mpro.accountingFilters.v3",
  globalFilters: "mpro.globalFilters.v3",
  localUsers: "mpro.localUsers.v1",
  masterOptions: "mpro.masterOptions.v1",
};

const LOCAL_API_BASE = "http://127.0.0.1:8787";
const configuredApiBase = window.TAG_MPRO_API_BASE || localStorage.getItem("mpro.apiBase") || "";
const IS_LOCAL_APP = ["", "localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = configuredApiBase || (IS_LOCAL_APP ? LOCAL_API_BASE : "");
let apiOnline = false;

const USERS = [
  {
    username: "auditor@mpro.com",
    password: "Auditor@2026",
    role: "Auditor",
    subtitle: "Invoice Reconciliation",
  },
];

const SOURCE_CONFIG = {
  program: {
    label: "Campaign",
    columns: [
      "Source",
      "Campaign ID",
      "Campaign Name",
      "Program Name",
      "Campaign Type",
      "Budget",
      "Program Manager",
      "Campaign Manager",
      "Brand",
      "Advertiser Name",
      "Status",
    ],
  },
  pr: {
    label: "PR - Purchase Requisition",
    columns: [
      "Source",
      "PR Number",
      "PR Date",
      "PR Description",
      "Vendor Name",
      "Brand Name",
      "Campaign Name",
      "Campaign ID",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "PR Amount",
      "Status",
    ],
  },
  po: {
    label: "Purchase Order",
    columns: [
      "Source",
      "Import ID",
      "Document Type",
      "Campaign ID",
      "Campaign Name",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "PR Number",
      "Advertiser Name",
      "PO Number",
      "PO Date",
      "Agency Name",
      "Medium",
      "Brand",
      "Campaign Start Date",
      "Campaign End Date",
      "PO Amount Incl Tax",
      "File Name",
      "Status",
    ],
  },
  mediaSchedule: {
    label: "Media Estimate/Schedule",
    columns: [
      "Source",
      "Import ID",
      "Document Type",
      "Campaign ID",
      "Campaign Name",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "PR Number",
      "PO Number",
      "Advertiser Name",
      "Agency Name",
      "Medium",
      "Brand",
      "Campaign Start Date",
      "Campaign End Date",
      "Channel Name",
      "Program",
      "Date",
      "Day",
      "Air Time",
      "Duration Sec",
      "Spots",
      "Rate INR",
      "Planned Amount",
      "File Name",
      "Status",
    ],
  },
  agency: {
    label: "Agency Invoice",
    columns: [
      "Source",
      "Import ID",
      "Document Type",
      "Agency Name",
      "Advertiser Name",
      "Medium",
      "Invoice Number",
      "Invoice Date",
      "Campaign Period",
      "Estimate Number",
      "Estimate Period",
      "PR Number",
      "PO Number",
      "Campaign ID",
      "Brand",
      "Campaign Name",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "Campaign Start Date",
      "Campaign End Date",
      "Total Value Including Taxes",
      "Channel Name",
      "Program",
      "Time Band",
      "Broadcaster Name",
      "Date",
      "Date Wise Spots",
      "Spot Duration",
      "Spot Rate Per 10 Sec",
      "Net Cost",
      "File Name",
      "Status",
    ],
  },
  thirdPartyInvoice: {
    label: "Publisher Invoice",
    columns: [
      "Source",
      "Import ID",
      "Document Type",
      "Media Type",
      "Advertiser Name",
      "Third Party Vendor Name",
      "Agency Name",
      "Medium",
      "Channel Name",
      "Billing Period",
      "PR Number",
      "PO Number",
      "Invoice Number",
      "Invoice Date",
      "Campaign ID",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "Campaign Start Date",
      "Campaign End Date",
      "TP",
      "Program",
      "Date",
      "Day",
      "Air Time",
      "Duration Sec",
      "Spot Copy Caption",
      "Brand",
      "Rate INR",
      "Calculated Amount INR",
      "File Name",
      "Status",
    ],
  },
  thirdPartyMonitoring: {
    label: "3rd Party Monitoring Report",
    columns: [
      "Source",
      "Import ID",
      "Document Type",
      "Media Type",
      "Advertiser Name",
      "Agency Name",
      "Medium",
      "Third Party Vendor Name",
      "Channel Name",
      "Brand",
      "Campaign ID",
      "Campaign Name",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "Campaign Start Date",
      "Campaign End Date",
      "Program",
      "Date",
      "Day",
      "Air Time",
      "Duration Sec",
      "Spot Copy Caption",
      "Proof of Performance",
      "Expense Monitoring",
      "Monitoring Status",
      "File Name",
      "Status",
    ],
  },
};

// Suffix shown in column headers to identify which source document the data belongs to
const SOURCE_SUFFIX = {
  agency: "AGI",
  thirdPartyInvoice: "BRI",
  po: "PI",
  thirdPartyMonitoring: "MOI",
  mediaSchedule: "MEI",
  program: "CMP",
  pr: "PR",
};

const COLUMN_TO_SUFFIX = {
  "Campaign ID": "CMP",
  "Campaign Name": "CMP",
  "Campaign Type": "CMP",
  "Campaign Manager": "CMP",
  "Program Name": "CMP",
  "Budget": "CMP",
  "Program Manager": "CMP",
  "PR Number": "PR",
  "PR Date": "PR",
  "PR Description": "PR",
  "Vendor Name": "PR",
  "PR Amount": "PR",
  "PO Number": "PI",
  "PO Date": "PI",
  "PO Amount Incl Tax": "PI",
  "Medium": "PI",
  "Brand": "PI",
  "Brand Name": "PI",
  "Advertiser Name": "PI",
  "Campaign Start Date": "PI",
  "Campaign End Date": "PI",
  "Channel Name": "MEI",
  "Spots": "MEI",
  "Rate INR": "MEI",
  "Planned Amount": "MEI",
  "Agency Name": "AGI",
  "Invoice Number": "AGI",
  "Invoice Date": "AGI",
  "Campaign Period": "AGI",
  "Estimate Number": "AGI",
  "Estimate Period": "AGI",
  "Total Value Including Taxes": "AGI",
  "Time Band": "AGI",
  "Broadcaster Name": "AGI",
  "Date Wise Spots": "AGI",
  "Spot Duration": "AGI",
  "Spot Rate Per 10 Sec": "AGI",
  "Net Cost": "AGI",
  "Third Party Vendor Name": "BRI",
  "Billing Period": "BRI",
  "TP": "BRI",
  "Calculated Amount INR": "BRI",
  "Proof of Performance": "MOI",
  "Expense Monitoring": "MOI",
  "Monitoring Status": "MOI",
  "Program": "BRI",
  "Date": "BRI",
  "Day": "BRI",
  "Air Time": "BRI",
  "Duration Sec": "BRI",
  "Spot Copy Caption": "BRI",
};

// Columns hidden by default across all source views (user can unhide via Columns button)
const DEFAULT_HIDDEN_COLUMNS = [
  "Source",
  "File Name",
  "Status",
  "Import ID",
  "Document Type",
  "Source Type",
  "PDF File Name",
  "Extraction Review",
  "Parser Confidence",
  "Quality Issues",
];

// Keys used to link rows across different source tables for cross-fill
const CROSS_LINK_KEYS = ["PO Number", "PR Number", "Campaign ID"];

const GLOBAL_FILTERS = [
  "campaign",
  "advertiser",
  "brand",
  "agency",
  "mediaType",
  "channel",
];

const FILTER_LABELS = {
  campaign: "Campaign",
  advertiser: "Advertiser",
  brand: "Brand",
  agency: "Agency",
  mediaType: "Medium",
  channel: "Platform",
};

const SOURCE_PREFIXES = {
  mediaSchedule: "mes",
  agency: "agi",
  thirdPartyInvoice: "bri",
  thirdPartyMonitoring: "agm",
  po: "pur",
  program: "cmp",
};

const SOURCE_TYPE_LABELS = {
  mediaSchedule: "Media Estimate/Schedule",
  agency: "Agency Invoice",
  thirdPartyInvoice: "Broadcaster / 3rd Party / Channel Invoice",
  thirdPartyMonitoring: "3rd Party Monitoring",
  po: "Purchase Order",
};

const EXTRACTOR_SOURCE_TYPES = {
  po: "po",
  agency: "agency_invoice",
  thirdPartyInvoice: "broadcaster_invoice",
  thirdPartyMonitoring: "monitoring_report",
};

const APP_SOURCE_TYPES = {
  po: "po",
  agency_invoice: "agency",
  broadcaster_invoice: "thirdPartyInvoice",
  monitoring_report: "thirdPartyMonitoring",
};

const FILTER_DEFS = [
  { key: "brand", label: "Brand" },
  { key: "advertiser", label: "Advertiser" },
  { key: "agency", label: "Agency" },
  { key: "campaignPeriod", label: "Campaign Period" },
  { key: "campaignId", label: "Campaign ID" },
  { key: "broadcaster", label: "Broadcaster Name" },
  { key: "budget", label: "Budget" },
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "poNumber", label: "Purchase Order No." },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "proofOfPerformance", label: "Proof of Performance" },
  { key: "expenseMonitoring", label: "Expense Monitoring" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "programName", label: "Program Name" },
];

const FIELD_ALIASES = {
  source: ["source"],
  advertiser: ["advertiser", "advertiser name", "client", "client name"],
  agency: ["agency", "agency name", "vendor", "vendor name"],
  vendor: ["third party vendor name", "broadcaster name", "publisher name", "vendor name", "vendor", "producer", "producer name"],
  brand: ["brand", "brand name", "project"],
  brandName: ["brand name", "brand"],
  campaignId: ["campaign id", "program id"],
  campaign: ["campaign", "campaign name", "description", "activity", "activity month"],
  campaignType: ["campaign type", "campaigns type", "campaings type", "campaign category", "activity type", "media type", "medium"],
  campaignManager: ["campaign manager", "campaigns manager", "campaings manager", "program manager", "manager"],
  programManager: ["program manager", "campaign manager", "manager"],
  programName: ["program name", "programme name", "program", "tp", "telecast program"],
  mediaType: ["media type", "medium"],
  prNumber: ["pr number", "pr no", "pr", "purchase requisition number"],
  prDate: ["pr date", "purchase requisition date"],
  prAmount: ["pr amount", "purchase requisition amount", "estimate amount"],
  poNumber: ["po number", "po no", "po", "purchase order number"],
  poDate: ["po date", "purchase order date"],
  poAmount: ["po amount incl tax", "po amount", "po amount incl. tax", "po amount including tax", "amount incl tax"],
  budget: ["budget", "campaign budget", "program budget"],
  invoiceNumber: ["invoice number", "invoice no", "invoice #", "invoice"],
  invoiceDate: ["invoice date"],
  campaignPeriod: ["campaign period", "activity month", "billing period"],
  estimateNumber: ["estimate number", "estimate no"],
  estimatePeriod: ["estimate period"],
  totalValue: ["total value including taxes", "total value incl taxes", "total value", "invoice value"],
  broadcaster: ["broadcaster", "broadcaster name", "producer", "producer name"],
  channel: ["channel", "channel name", "station relation", "stn"],
  billingPeriod: ["billing period"],
  tp: ["tp", "telecast program"],
  program: ["program", "program name", "programme name"],
  timeBand: ["time band", "time range", "sales unit", "time range/sales unit"],
  date: ["date", "telecast date"],
  day: ["day", "dy"],
  airTime: ["air time", "telecast time"],
  duration: ["duration sec", "len", "len duration sec", "spot duration", "spot duration sec"],
  spots: ["date wise spots", "spots", "spot count"],
  caption: ["spot copy caption", "spot copy (caption)", "caption", "spot copy"],
  rate: ["rate inr", "rate", "spot rate", "spot rate per 10 sec"],
  amount: ["calculated amount inr", "calculate final amount inr", "net cost", "amount", "total"],
  plannedAmount: ["planned amount", "schedule amount", "media schedule amount"],
  proofOfPerformance: ["proof of performance", "pop", "proof", "monitoring proof", "tear sheet", "tear sheet status", "dcm proof", "barc proof", "adex proof"],
  expenseMonitoring: ["expense monitoring", "expense monitorning", "expense monitor", "monitoring expense", "spend monitoring", "cost monitoring"],
  monitoringStatus: ["monitoring status", "status"],
  status: ["reconciliation status", "status", "match status"],
  fileName: ["file name", "filename"],
  importId: ["import id", "unique id"],
  documentType: ["document type", "data source"],
  campaignStartDate: ["campaign start date", "start date"],
  campaignEndDate: ["campaign end date", "end date"],
};

const HELP_CONTENT = {
  mediaSchedule: {
    title: "Media Estimate/Schedule",
    lines: ["Supported: PDF files", "Recommended size: under 20 MB", "Use this for planned spots, dates, channels and schedule amount."],
  },
  agency: {
    title: "Agency Invoice",
    lines: ["Supported: PDF files", "Recommended size: under 20 MB", "Upload agency invoice with PO/PR/campaign references."],
  },
  thirdPartyInvoice: {
    title: "Publisher Invoice",
    lines: ["Supported: PDF files", "TV: upload broadcaster invoice", "Print: upload publisher invoice", "Other: 3rd party vendor invoice"],
  },
  thirdPartyMonitoring: {
    title: "3rd Party Monitoring Report",
    lines: ["Supported: PDF files", "TV: AdEx or BARC report", "Print: tear sheet copies", "Digital: platform or 3rd party monitoring and DCM report"],
  },
  po: {
    title: "Purchase Order",
    lines: ["Supported: PDF files", "Recommended size: under 20 MB", "Upload purchase order PDF."],
  },
  unifiedUpload: {
    title: "Upload PDF Source File",
    lines: ["Select one source type at a time.", "Agency, medium, advertiser and campaign dates are required.", "New agency or advertiser names are remembered for future uploads."],
  },
};

const QUALITY_REQUIRED_FIELDS = {
  po: ["advertiser", "poNumber", "poDate", "agency", "brand", "campaign", "poAmount"],
  mediaSchedule: ["poNumber", "advertiser", "agency", "brand", "channel", "program", "date", "duration", "spots", "rate", "plannedAmount"],
  agency: ["agency", "advertiser", "invoiceNumber", "invoiceDate", "estimateNumber", "estimatePeriod", "poNumber", "brand", "campaign", "channel", "program", "broadcaster", "date", "spots", "duration", "rate", "amount"],
  thirdPartyInvoice: ["advertiser", "vendor", "agency", "invoiceNumber", "invoiceDate", "channel", "date", "airTime", "duration", "caption", "brand"],
  thirdPartyMonitoring: ["channel", "brand", "program", "date", "airTime", "duration", "caption", "monitoringStatus"],
};

const QUALITY_LABELS = {
  advertiser: "Advertiser",
  agency: "Agency",
  vendor: "Vendor/Broadcaster",
  brand: "Brand",
  campaign: "Campaign",
  poNumber: "PO Number",
  poDate: "PO Date",
  invoiceNumber: "Invoice Number",
  invoiceDate: "Invoice Date",
  estimateNumber: "Estimate Number",
  estimatePeriod: "Estimate Period",
  channel: "Channel",
  program: "Program",
  broadcaster: "Broadcaster",
  date: "Date",
  airTime: "Air Time",
  duration: "Duration",
  spots: "Spots",
  rate: "Rate",
  amount: "Amount",
  plannedAmount: "Planned Amount",
  caption: "Caption",
  monitoringStatus: "Monitoring Status",
};

const SAMPLE_DATASETS = {
  program: [
    {
      "Campaign ID": "CMP-AGNI-2024",
      "Campaign Name": "Agni HSM Sustenance TV",
      Budget: "143713964",
      "Program Manager": "Riya Mehta",
      Brand: "Agni",
      "Advertiser Name": "Vigilis Retail",
      Status: "Derived",
    },
  ],
  pr: [
    {
      "PR Number": "PR-2501",
      "PR Date": "2024-05-18",
      "PR Description": "May TV media buy",
      "Vendor Name": "North Star Media",
      "Brand Name": "Agni",
      "Campaign Name": "Agni HSM Sustenance TV",
      "Campaign ID": "CMP-AGNI-2024",
      "PR Amount": "143713964",
      Status: "Derived",
    },
  ],
  po: [
    {
      "Campaign ID": "CMP-AGNI-2024",
      "Campaign Name": "Agni HSM Sustenance TV",
      "PR Number": "PR-2501",
      "Advertiser Name": "Vigilis Retail",
      "PO Number": "PO-5510",
      "PO Date": "2024-05-20",
      "Agency Name": "North Star Media",
      Brand: "Agni",
      "PO Amount Incl Tax": "143713964",
      Status: "Imported",
    },
  ],
  mediaSchedule: [
    {
      "Campaign ID": "CMP-AGNI-2024",
      "Campaign Name": "Agni HSM Sustenance TV",
      "PR Number": "PR-2501",
      "PO Number": "PO-5510",
      "Advertiser Name": "Vigilis Retail",
      "Agency Name": "North Star Media",
      Brand: "Agni",
      "Channel Name": "Sun TV",
      Program: "Prime Show",
      Date: "2024-05-22",
      Day: "Wed",
      "Air Time": "20:14:10",
      "Duration Sec": "10",
      Spots: "4",
      "Rate INR": "15000",
      "Planned Amount": "60000",
      Status: "Imported",
    },
  ],
  agency: [
    {
      "Agency Name": "North Star Media",
      "Advertiser Name": "Vigilis Retail",
      "Invoice Number": "AG-INV-1001",
      "Invoice Date": "2024-06-18",
      "Campaign Period": "May 2024",
      "Estimate Number": "EST-7781",
      "Estimate Period": "21-MAY-2024 To 12-JUN-2024",
      "PR Number": "PR-2501",
      "PO Number": "PO-5510",
      "Campaign ID": "CMP-AGNI-2024",
      Brand: "Agni",
      "Campaign Name": "Agni HSM Sustenance TV",
      "Total Value Including Taxes": "143713964",
      "Channel Name": "Sun TV",
      Program: "Prime Show",
      "Time Band": "19:00-22:00",
      "Broadcaster Name": "Sun Network",
      Date: "2024-05-22",
      "Date Wise Spots": "4",
      "Spot Duration": "10",
      "Spot Rate Per 10 Sec": "15000",
      "Net Cost": "60000",
      Status: "Imported",
    },
  ],
  thirdPartyInvoice: [
    {
      "Media Type": "TV",
      "Advertiser Name": "Vigilis Retail",
      "Third Party Vendor Name": "Sun Network",
      "Agency Name": "North Star Media",
      "Channel Name": "Sun TV",
      "Billing Period": "May 2024",
      "PR Number": "PR-2501",
      "PO Number": "PO-5510",
      "Invoice Number": "BR-INV-451",
      "Invoice Date": "2024-06-15",
      "Campaign ID": "CMP-AGNI-2024",
      TP: "TP-01",
      Program: "Prime Show",
      Date: "2024-05-22",
      Day: "Wed",
      "Air Time": "20:14:10",
      "Duration Sec": "10",
      "Spot Copy Caption": "Agni 10 sec",
      Brand: "Agni",
      "Rate INR": "15000",
      "Calculated Amount INR": "15000",
      Status: "Imported",
    },
  ],
  thirdPartyMonitoring: [
    {
      "Media Type": "TV",
      "Advertiser Name": "Vigilis Retail",
      "Agency Name": "North Star Media",
      "Third Party Vendor Name": "Sun Network",
      "Channel Name": "Sun TV",
      Brand: "Agni",
      "Campaign ID": "CMP-AGNI-2024",
      "Campaign Name": "Agni HSM Sustenance TV",
      Program: "Prime Show",
      Date: "2024-05-22",
      Day: "Wed",
      "Air Time": "20:14:10",
      "Duration Sec": "10",
      "Spot Copy Caption": "Agni 10 sec",
      "Monitoring Status": "Aired",
      Status: "Imported",
    },
  ],
};

const state = {
  currentUser: null,
  authMode: "signin",
  activeModule: "accounting",
  cases: [],
  activeCaseId: null,
  activeView: "agency",
  datasets: emptyDatasets(),
  columnOrders: {},
  columnWidths: {},
  hiddenColumns: {},
  sort: { column: null, direction: "asc" },
  columnFilters: {},
  globalFilters: {},
  accountingFilters: {},
  searchQuery: "",
  masterOptions: { agencies: [], advertisers: [] },
  dirty: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", async () => {
  await loadState();
  bindEvents();
  restoreSession();
});

function emptyDatasets() {
  return Object.fromEntries(Object.keys(SOURCE_CONFIG).map((key) => [key, []]));
}

async function loadState() {
  const session = readJSON(STORAGE_KEYS.session, null);
  const apiCases = session && session.token && Date.now() <= session.expiresAt ? await loadCasesFromApi(session.token) : null;
  state.cases = apiCases || readJSON(STORAGE_KEYS.cases, []);
  state.activeCaseId = session ? localStorage.getItem(STORAGE_KEYS.activeCase) : null;
  state.globalFilters = keepKnownFilters(readJSON(STORAGE_KEYS.globalFilters, {}), GLOBAL_FILTERS);
  state.accountingFilters = keepKnownFilters(readJSON(STORAGE_KEYS.accountingFilters, {}), FILTER_DEFS.map((item) => item.key));
  state.masterOptions = { agencies: [], advertisers: [], ...readJSON(STORAGE_KEYS.masterOptions, {}) };
  const active = getActiveCase();
  if (active) hydrateCase(active);
  refreshMasterOptionsFromCases();
  refreshMasterOptionsFromDatasets();
}

function keepKnownFilters(filters, allowedKeys) {
  const allowed = new Set(allowedKeys);
  return Object.fromEntries(
    Object.entries(filters || {})
      .filter(([key]) => allowed.has(key))
      .map(([key, value]) => [key, normalizeFilterValues(value)])
      .filter(([, values]) => values.length),
  );
}

function bindEvents() {
  $("#launch-button").addEventListener("click", showRoleScreen);
  $("#close-role").addEventListener("click", showEntry);
  $("#auditor-role").addEventListener("click", showLogin);
  $$(".disabled-role").forEach((button) => button.addEventListener("click", () => toast("The auditor workflow is active. Additional roles are planned for the next phase.")));
  $("#back-to-roles").addEventListener("click", showRoleScreen);
  $("#close-login").addEventListener("click", showEntry);
  $("#login-form").addEventListener("submit", handleLogin);
  $("#toggle-auth-mode").addEventListener("click", toggleAuthMode);
  $("#signout-button").addEventListener("click", signOut);
  $("#brand-dashboard").addEventListener("click", () => switchModule("dashboard"));
  $("#close-help").addEventListener("click", closeUploadHelp);
  $("#support-help").addEventListener("click", () => toast("Contact support with the file format, file size, and upload source."));
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchModule(button.dataset.module)));
  $$(".source-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $("#unified-import").addEventListener("click", importUnifiedSourceFiles);
  $$(".help-dot").forEach((button) => button.addEventListener("click", () => button.focus()));
  $("#reset-global-filters").addEventListener("click", resetGlobalFilters);
  $("#collapse-filters").addEventListener("click", () => setFiltersCollapsed(true));
  $("#expand-filters").addEventListener("click", () => setFiltersCollapsed(false));
  $("#load-sample")?.addEventListener("click", loadSample);
  $("#add-row").addEventListener("click", addRow);
  $("#column-settings").addEventListener("click", toggleColumnPanel);
  $("#export-csv").addEventListener("click", exportCsv);
  $("#save-campaign").addEventListener("click", saveCase);
  $("#clear-accounting-filters").addEventListener("click", clearAccountingFilters);
  $("#table-search").addEventListener("input", (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    renderGrid();
    renderFilterChips();
  });
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".search-filter")) return;
    $$(".search-filter.is-open").forEach((item) => item.classList.remove("is-open"));
    // Close column filter dropdowns if click outside
    if (!event.target.closest(".col-filter-wrap") && !event.target.closest(".col-filter-dropdown")) {
      closeAllColFilterDropdowns();
    }
  });
}

function showEntry() {
  $("#entry-screen").classList.remove("hidden");
  $("#role-screen").classList.add("hidden");
  $("#login-screen").classList.add("hidden");
  $("#app-shell").classList.add("hidden");
}

function showRoleScreen() {
  $("#entry-screen").classList.add("hidden");
  $("#role-screen").classList.remove("hidden");
  $("#login-screen").classList.add("hidden");
  $("#app-shell").classList.add("hidden");
}

function showLogin() {
  $("#entry-screen").classList.add("hidden");
  $("#role-screen").classList.add("hidden");
  $("#login-screen").classList.remove("hidden");
  $("#app-shell").classList.add("hidden");
  $("#auth-error").textContent = "";
  setAuthMode("signin");
  $("#username").focus();
}

function showApp() {
  $("#entry-screen").classList.add("hidden");
  $("#role-screen").classList.add("hidden");
  $("#login-screen").classList.add("hidden");
  $("#app-shell").classList.remove("hidden");
  $("#signed-in-user").textContent = signedInLabel();
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  const active = getActiveCase();
  if (active) $("#campaign-name").value = active.name || "";
  setFiltersCollapsed(false);
  switchModule(state.activeModule);
  renderAll();
}

function signedInLabel() {
  const user = state.currentUser || {};
  return user.username || user.displayName || "Signed in user";
}

function visibleView(view) {
  return ["program", "po", "mediaSchedule", "agency", "thirdPartyInvoice", "thirdPartyMonitoring"].includes(view) ? view : "agency";
}

async function handleLogin(event) {
  event.preventDefault();
  $("#auth-error").textContent = "";
  if (state.authMode === "signup") {
    await handleSignup();
  } else {
    await handleSignin();
  }
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  $$(".signup-only").forEach((item) => item.classList.toggle("hidden", !isSignup));
  $("#auth-title").textContent = isSignup ? "Create Account" : "Auditor Login";
  $("#auth-subtitle").textContent = isSignup ? "Secure account setup" : "Invoice Reconciliation";
  $("#auth-submit").textContent = isSignup ? "Create account" : "Sign in";
  $("#toggle-auth-mode").textContent = isSignup ? "Back to sign in" : "Create new account";
  $("#password").autocomplete = isSignup ? "new-password" : "current-password";
  $("#remember-me").closest("label").classList.toggle("hidden", isSignup);
}

function toggleAuthMode() {
  setAuthMode(state.authMode === "signin" ? "signup" : "signin");
  $("#auth-error").textContent = "";
}

async function handleSignin() {
  const username = $("#username").value.trim().toLowerCase();
  const password = $("#password").value;
  const result = await postApi("/api/auth/signin", { username, password });
  if (!result.ok) {
    if (IS_LOCAL_APP) {
      const localSignin = await signInWithLocalAccount(username, password);
      if (localSignin) return;
    }
    $("#auth-error").textContent = sharedDatabaseError(result.error, "Sign in failed. Check the configured API connection or create a local account.");
    return;
  }
  state.currentUser = result.data.user;
  const remember = $("#remember-me").checked;
  const duration = remember ? 30 * 24 * 60 * 60 * 1000 : (result.data.expiresInSeconds || 8 * 60 * 60) * 1000;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ user: state.currentUser, token: result.data.token, expiresAt: Date.now() + duration }));
  state.cases = await loadCasesFromApi() || readJSON(STORAGE_KEYS.cases, []);
  const active = getActiveCase();
  if (active) hydrateCase(active);
  showApp();
}

async function signInWithLocalAccount(username, password) {
  const localUsers = readJSON(STORAGE_KEYS.localUsers, []);
  const localUser = localUsers.find((user) => user.username === username);
  if (localUser) {
    const valid = await verifyLocalPassword(password, localUser.passwordSalt, localUser.passwordHash);
    if (!valid) return false;
    return startLocalSession({
      username: localUser.username,
      role: localUser.role,
      displayName: localUser.displayName,
    });
  }
  const matchedUser = USERS.find((user) => user.username === username && user.password === password);
  if (!matchedUser) return false;
  return startLocalSession({
    username: matchedUser.username,
    role: matchedUser.role,
    displayName: "",
  });
}

function startLocalSession(user) {
  const remember = $("#remember-me").checked;
  const duration = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  state.currentUser = user;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ user: state.currentUser, token: "", localOnly: true, expiresAt: Date.now() + duration }));
  state.cases = readJSON(STORAGE_KEYS.cases, []);
  const active = getActiveCase();
  if (active) hydrateCase(active);
  showApp();
  toast("Signed in locally. Saved work will stay in this browser.");
  return true;
}

async function handleSignup() {
  const payload = {
    displayName: $("#display-name").value.trim(),
    role: $("#signup-role").value,
    username: $("#username").value.trim().toLowerCase(),
    password: $("#password").value,
    confirmPassword: $("#confirm-password").value,
  };
  const localError = validatePasswordClient(payload.password, payload.confirmPassword);
  if (localError) {
    $("#auth-error").textContent = localError;
    return;
  }
  const result = await postApi("/api/auth/signup", payload);
  if (!result.ok) {
    if (!IS_LOCAL_APP) {
      $("#auth-error").textContent = sharedDatabaseError(result.error, "Account creation failed because the cloud database is not connected.");
      return;
    }
    if (isLocalAuthFallback(result.error)) {
      const created = await createLocalAccount(payload);
      if (created) {
        toast("Local account created. You can sign in now on this browser.");
        setAuthMode("signin");
      }
      return;
    }
    $("#auth-error").textContent = result.error || "Account creation failed.";
    return;
  }
  toast("Account created. You can sign in now.");
  setAuthMode("signin");
}

function isLocalAuthFallback(error) {
  return !API_BASE || /not configured|not reachable|failed to fetch|network|api/i.test(String(error || ""));
}

async function createLocalAccount(payload) {
  const username = payload.username;
  const displayName = payload.displayName;
  const role = payload.role || "Auditor";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username)) {
    $("#auth-error").textContent = "Enter a valid email address.";
    return false;
  }
  if (!displayName) {
    $("#auth-error").textContent = "Full name is required.";
    return false;
  }
  const localUsers = readJSON(STORAGE_KEYS.localUsers, []);
  const reservedDemo = USERS.some((user) => user.username === username);
  if (reservedDemo || localUsers.some((user) => user.username === username)) {
    $("#auth-error").textContent = "An account already exists for this email.";
    return false;
  }
  const passwordSalt = crypto.randomUUID();
  const passwordHash = await hashLocalPassword(payload.password, passwordSalt);
  localUsers.push({
    id: crypto.randomUUID(),
    username,
    displayName,
    role,
    passwordSalt,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.localUsers, JSON.stringify(localUsers));
  return true;
}

function validatePasswordClient(password, confirmPassword) {
  if (password !== confirmPassword) return "Password and confirm password do not match.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/\d/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
  return "";
}

async function hashLocalPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: 120000,
    },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyLocalPassword(password, salt, expectedHash) {
  if (!salt || !expectedHash) return false;
  const actualHash = await hashLocalPassword(password, salt);
  return actualHash === expectedHash;
}

function restoreSession() {
  const session = readJSON(STORAGE_KEYS.session, null);
  if (!session || Date.now() > session.expiresAt) {
    localStorage.removeItem(STORAGE_KEYS.session);
    showEntry();
    return;
  }
  state.currentUser = session.user;
  showApp();
}

async function signOut() {
  if (state.dirty) await saveCase();
  const session = readJSON(STORAGE_KEYS.session, null);
  if (session?.token) await postApi("/api/auth/signout", {});
  localStorage.removeItem(STORAGE_KEYS.session);
  state.currentUser = null;
  showEntry();
}

function switchModule(moduleName) {
  state.activeModule = moduleName;
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.module === moduleName));
  const isAccounting = moduleName === "accounting";
  $("#accounting-module").classList.toggle("hidden", !isAccounting);
  $("#module-placeholder").classList.toggle("hidden", isAccounting);
  if (!isAccounting) {
    $("#module-placeholder").innerHTML = `<div class="placeholder-panel"><h1>${escapeHTML(toTitle(moduleName))}</h1><p>This workspace will connect to the reconciliation workflow in a later release.</p></div>`;
  }
}

function switchView(view) {
  state.activeView = view;
  $$(".source-tab").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  renderGrid();
}

function setFiltersCollapsed(collapsed) {
  $("#accounting-module").classList.toggle("filters-collapsed", collapsed);
  $("#accounting-filters").classList.toggle("hidden", collapsed);
  $("#expand-filters").classList.toggle("hidden", !collapsed);
}

function startNewCase() {
  state.activeCaseId = null;
  state.datasets = emptyDatasets();
  state.columnOrders = {};
  state.columnWidths = {};
  state.hiddenColumns = {};
  state.sort = { column: null, direction: "asc" };
  state.accountingFilters = {};
  state.globalFilters = {};
  state.searchQuery = "";
  $("#table-search").value = "";
  state.activeView = "agency";
  ensureDefaultHiddenColumns();
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  $("#existing-list").classList.add("hidden");
  $("#campaign-name").value = "";
  resetUnifiedUploadForm();
  renderAll();
}

function showExistingCases() {
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  const list = $("#existing-list");
  list.classList.remove("hidden");
  if (!state.cases.length) {
    list.classList.add("hidden");
    list.innerHTML = "";
    return;
  }
  list.innerHTML = "";
  state.cases.forEach((caseItem) => {
    const button = document.createElement("button");
    button.className = "existing-card";
    button.type = "button";
    button.innerHTML = `<strong>${escapeHTML(caseItem.name)}</strong><span>${countRows(caseItem.datasets)} records - ${formatDateTime(caseItem.updatedAt)}</span>`;
    button.addEventListener("click", () => loadCase(caseItem.id));
    list.appendChild(button);
  });
}

function loadCase(id) {
  const caseItem = state.cases.find((item) => item.id === id);
  if (!caseItem) return;
  state.activeCaseId = id;
  localStorage.setItem(STORAGE_KEYS.activeCase, id);
  hydrateCase(caseItem);
  $("#campaign-name").value = caseItem.name;
  $("#existing-list").classList.add("hidden");
  renderAll();
  toast("Reconciliation loaded.");
}

function hydrateCase(caseItem) {
  state.datasets = { ...emptyDatasets(), ...(caseItem.datasets || {}) };
  deriveProgramAndPrRows();
  state.columnOrders = caseItem.columnOrders || {};
  state.columnWidths = caseItem.columnWidths || {};
  state.hiddenColumns = caseItem.hiddenColumns || {};
  state.sort = caseItem.sort || { column: null, direction: "asc" };
  state.activeView = visibleView(caseItem.activeView);
  ensureDefaultHiddenColumns();
  refreshMasterOptionsFromDatasets();
}

// Sets DEFAULT_HIDDEN_COLUMNS for any view not yet explicitly configured by user
function ensureDefaultHiddenColumns() {
  Object.keys(SOURCE_CONFIG).forEach((view) => {
    if (!Object.prototype.hasOwnProperty.call(state.hiddenColumns, view)) {
      state.hiddenColumns[view] = [...DEFAULT_HIDDEN_COLUMNS];
    }
  });
}

async function importUnifiedSourceFiles() {
  const sourceKey = $("#source-type-select").value;
  const config = SOURCE_CONFIG[sourceKey];
  const input = $("#source-file-input");
  const files = Array.from(input.files || []);
  const metadata = readUploadMetadata();
  const validationError = validateUploadMetadata(sourceKey, files, metadata);
  if (validationError) {
    toast(validationError);
    return;
  }

  try {
    const imported = [];
    for (const file of files) {
      const parsed = await parseFileForSource(file, sourceKey, metadata);
      imported.push(...applyUploadMetadata(parsed.rows, sourceKey, metadata));
    }
    state.datasets[sourceKey] = [...(state.datasets[sourceKey] || []), ...imported];
    rememberMasterOption("agencies", metadata.agency);
    rememberMasterOption("advertisers", metadata.advertiser);
    deriveProgramAndPrRows({ overwrite: false });
    state.accountingFilters = {};
    state.globalFilters = {};
    state.searchQuery = "";
    $("#table-search").value = "";
    state.activeView = visibleView(sourceKey);
    if (!$("#campaign-name").value.trim()) $("#campaign-name").value = "Invoice reconciliation";
    state.dirty = true;
    resetUnifiedUploadForm({ keepMasters: true });
    renderAll();
    toast(`${imported.length} row${imported.length === 1 ? "" : "s"} extracted into ${config.label}.`);
  } catch (error) {
    toast(error.message || "Import failed.");
  }
}

async function importSourceFiles(sourceKey) {
  const config = SOURCE_CONFIG[sourceKey];
  const input = $(`#${config.inputId}`);
  const files = Array.from(input?.files || []);
  if (!files.length) {
    toast(`Select a file for ${config.label}.`);
    return;
  }

  try {
    const pdfCount = files.filter((file) => /\.pdf$/i.test(file.name)).length;
    const imported = [];
    for (const file of files) {
      const parsed = await parseFileForSource(file, sourceKey);
      imported.push(...parsed.rows);
    }
    state.datasets[sourceKey] = [...(state.datasets[sourceKey] || []), ...imported];
    deriveProgramAndPrRows({ overwrite: false });
    state.accountingFilters = {};
    state.globalFilters = {};
    state.searchQuery = "";
    $("#table-search").value = "";
    state.activeView = visibleView(sourceKey);
    if (!$("#campaign-name").value.trim()) $("#campaign-name").value = "Invoice reconciliation";
    state.dirty = true;
    input.value = "";
    renderAll();
    toast(`${imported.length} PDF row${imported.length === 1 ? "" : "s"} extracted from ${pdfCount || files.length} file${(pdfCount || files.length) === 1 ? "" : "s"} into ${config.label}.`);
  } catch (error) {
    toast(error.message || "Import failed.");
  }
}

function readUploadMetadata() {
  const startDate = $("#campaign-start-date").value;
  const endDate = $("#campaign-end-date").value;
  return {
    agency: $("#upload-agency").value.trim(),
    advertiser: $("#upload-advertiser").value.trim(),
    medium: $("#upload-medium").value.trim(),
    campaignStartDate: startDate,
    campaignEndDate: endDate,
    campaignPeriod: startDate && endDate ? `${startDate} to ${endDate}` : "",
  };
}

function validateUploadMetadata(sourceKey, files, metadata) {
  if (!sourceKey || !SOURCE_CONFIG[sourceKey]) return "Choose what type of data this PDF contains.";
  if (!files.length) return "Choose at least one PDF file.";
  if (files.some((file) => !/\.pdf$/i.test(file.name))) return "Only PDF files are supported here.";
  if (!metadata.agency) return "Agency name is required.";
  if (!metadata.medium) return "Medium is required.";
  if (!metadata.advertiser) return "Advertiser name is required.";
  if (!metadata.campaignStartDate || !metadata.campaignEndDate) return "Campaign start and end dates are required.";
  if (metadata.campaignEndDate < metadata.campaignStartDate) return "Campaign end date must be after the start date.";
  return "";
}

function applyUploadMetadata(rows, sourceKey, metadata) {
  const prefix = SOURCE_PREFIXES[sourceKey] || "src";
  const stamp = `${compactTimestamp()}-${crypto.randomUUID().slice(0, 4)}`;
  return rows.map((row, index) => {
    const next = { ...row };
    next["Import ID"] = next["Import ID"] || `${prefix}-${stamp}-${String(index + 1).padStart(3, "0")}`;
    next["Document Type"] = next["Document Type"] || SOURCE_TYPE_LABELS[sourceKey] || SOURCE_CONFIG[sourceKey]?.label || "";
    next["Agency Name"] = next["Agency Name"] || metadata.agency;
    next["Advertiser Name"] = next["Advertiser Name"] || metadata.advertiser;
    next.Medium = next.Medium || metadata.medium;
    next["Media Type"] = next["Media Type"] || metadata.medium;
    next["Campaign Start Date"] = next["Campaign Start Date"] || metadata.campaignStartDate;
    next["Campaign End Date"] = next["Campaign End Date"] || metadata.campaignEndDate;
    next["Campaign Period"] = next["Campaign Period"] || metadata.campaignPeriod;
    return next;
  });
}

function compactTimestamp() {
  return new Date().toISOString().replace(/\D/g, "").slice(2, 14);
}

function resetUnifiedUploadForm(options = {}) {
  $("#source-file-input").value = "";
  $("#source-type-select").value = "";
  $("#upload-medium").value = "";
  $("#campaign-start-date").value = "";
  $("#campaign-end-date").value = "";
  if (!options.keepMasters) {
    $("#upload-agency").value = "";
    $("#upload-advertiser").value = "";
  }
  renderMasterOptionDatalists();
}

function rememberMasterOption(type, value) {
  const clean = String(value || "").trim();
  if (!clean) return;
  const current = new Set(state.masterOptions[type] || []);
  current.add(clean);
  state.masterOptions[type] = Array.from(current).sort((a, b) => a.localeCompare(b));
  localStorage.setItem(STORAGE_KEYS.masterOptions, JSON.stringify(state.masterOptions));
}

function refreshMasterOptionsFromDatasets() {
  const rows = combinedRows();
  rows.forEach((row) => {
    const agency = readField(row, "agency");
    const advertiser = readField(row, "advertiser");
    if (agency) rememberMasterOption("agencies", agency);
    if (advertiser) rememberMasterOption("advertisers", advertiser);
  });
  renderMasterOptionDatalists();
}

function refreshMasterOptionsFromCases() {
  state.cases.forEach((caseItem) => {
    Object.entries(caseItem.datasets || {}).forEach(([sourceKey, rows]) => {
      if (sourceKey === "pr") return;
      (rows || []).forEach((row) => {
        const agency = readField(row, "agency");
        const advertiser = readField(row, "advertiser");
        if (agency) rememberMasterOption("agencies", agency);
        if (advertiser) rememberMasterOption("advertisers", advertiser);
      });
    });
  });
}

function renderMasterOptionDatalists() {
  const agencyList = $("#agency-options");
  const advertiserList = $("#advertiser-options");
  if (agencyList) agencyList.innerHTML = (state.masterOptions.agencies || []).map((value) => `<option value="${escapeHTML(value)}"></option>`).join("");
  if (advertiserList) advertiserList.innerHTML = (state.masterOptions.advertisers || []).map((value) => `<option value="${escapeHTML(value)}"></option>`).join("");
}

async function parseFileForSource(file, sourceKey, metadata = {}) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const extracted = await extractPdfFiles([file], sourceKey, metadata);
    const rows = extracted.datasets?.[sourceKey] || [];
    if (!rows.length) return makePdfPlaceholderRows(file, sourceKey);
    return normalizeRows(rows, sourceKey, file.name);
  }
  throw new Error("Please upload PDF files only from these source cards.");
}

function makePdfPlaceholderRows(file, sourceKey) {
  const config = SOURCE_CONFIG[sourceKey];
  const row = {
    Source: config.label,
    "File Name": file.name,
    Status: "PDF selected - extractor integration pending",
  };
  return normalizeRows([row], sourceKey, file.name);
}

async function extractPdfFiles(files, sourceHint = "", metadata = {}) {
  const uploadFiles = files.filter((file) => /\.pdf$/i.test(file.name));
  if (!uploadFiles.length) throw new Error("Select PDF files for PDF extraction.");
  const datasets = { po: [], mediaSchedule: [], agency: [], thirdPartyInvoice: [], thirdPartyMonitoring: [] };
  for (const file of uploadFiles) {
    const sourceKey = sourceHint || "";
    const apiResult = await extractPdfFileViaApi(file, sourceKey, metadata);
    if (apiResult.ok) {
      datasets[apiResult.sourceKey].push(...apiResult.rows);
      continue;
    }

    const text = await extractPdfTextInBrowser(file);
    const fallbackSourceKey = sourceKey || classifyPdfDocument(file.name, text);
    const rows = extractRowsFromPdfText(fallbackSourceKey, text, file.name);
    addPdfMetadata(rows, fallbackSourceKey, text, file.name);
    datasets[fallbackSourceKey].push(...(rows.length ? rows : [makePdfReviewRow(fallbackSourceKey, file.name, text ? "No confident rows extracted" : "No selectable PDF text found")]));
  }
  return {
    datasets,
    summary: {
      documents: uploadFiles.length,
      rows: Object.values(datasets).reduce((total, rows) => total + rows.length, 0),
    },
  };
}

async function extractPdfFileViaApi(file, sourceKey, metadata = {}) {
  if (!EXTRACTOR_SOURCE_TYPES[sourceKey]) return { ok: false };
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("source_type", EXTRACTOR_SOURCE_TYPES[sourceKey]);
  body.append("agency_name", metadata.agency || "");
  body.append("medium", metadata.medium || "");
  body.append("advertiser_name", metadata.advertiser || "");
  body.append("campaign_period", metadata.campaignPeriod || "");

  for (const url of extractorApiUrls()) {
    try {
      const response = await fetchWithTimeout(url, { method: "POST", body }, 60000);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) continue;
      const resolvedSourceKey = APP_SOURCE_TYPES[payload.sourceType] || sourceKey;
      return {
        ok: true,
        sourceKey: resolvedSourceKey,
        rows: normalizeExtractorApiRows(payload.rows || [], resolvedSourceKey, file.name, payload),
      };
    } catch {
      // Try the next endpoint candidate, then fall back to browser extraction.
    }
  }
  return { ok: false };
}

function extractorApiUrls() {
  const cleanBase = String(API_BASE || "").replace(/\/+$/, "");
  if (!cleanBase) return ["/api/extract", "/extract"];
  if (cleanBase.endsWith("/api")) return [`${cleanBase}/extract`];
  return Array.from(new Set([`${cleanBase}/api/extract`, `${cleanBase}/extract`]));
}

function normalizeExtractorApiRows(rows, sourceKey, fileName, payload = {}) {
  const baseRows = rows.length ? rows : [makePdfReviewRow(sourceKey, fileName, "No rows extracted by API")];
  return baseRows.map((row) => {
    const next = { ...row };
    next["File Name"] = next["File Name"] || next["PDF File Name"] || fileName;
    next.Status = next.Status || next["Extraction Status"] || "Extracted - review";
    next["Parser Confidence"] = next["Parser Confidence"] || payload.confidence || "";
    next.Template = next.Template || payload.template || "";
    if (next["Brand Name"] && !next.Brand) next.Brand = next["Brand Name"];
    if (sourceKey === "po" && next.Description && !next["Campaign Name"]) {
      next["Campaign Name"] = next.Description;
    }
    if (sourceKey === "thirdPartyInvoice" && next["Broadcaster Name"] && !next["Third Party Vendor Name"]) {
      next["Third Party Vendor Name"] = next["Broadcaster Name"];
    }
    if (sourceKey === "thirdPartyInvoice" && next["Final Amount INR"] && !next["Calculated Amount INR"]) {
      next["Calculated Amount INR"] = next["Final Amount INR"];
    }
    if (payload.warnings?.length) next["Extractor Warnings"] = payload.warnings.join("; ");
    if (payload.missingFields?.length) next["Missing Fields"] = payload.missingFields.join(", ");
    return next;
  });
}

async function extractPdfTextInBrowser(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF reader is still loading or offline. Refresh once with internet access, then upload the PDF again.");
  }
  const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(textContentToLines(content).join("\n"));
  }
  return cleanPdfText(pages.join("\n\n"));
}

function textContentToLines(content) {
  const items = (content.items || [])
    .filter((item) => String(item.str || "").trim())
    .map((item) => ({ text: String(item.str).trim(), x: item.transform?.[4] || 0, y: item.transform?.[5] || 0 }))
    .sort((a, b) => Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x);
  const rows = [];
  items.forEach((item) => {
    const last = rows[rows.length - 1];
    if (!last || Math.abs(last.y - item.y) > 3) rows.push({ y: item.y, parts: [item] });
    else last.parts.push(item);
  });
  return rows.map((row) => row.parts.sort((a, b) => a.x - b.x).map((item) => item.text).join(" ").replace(/\s+/g, " ").trim());
}

function cleanPdfText(text) {
  return String(text || "")
    .replace(/\x00/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function classifyPdfDocument(name, text) {
  const haystack = `${name}\n${text.slice(0, 4000)}`.toLowerCase();
  if (haystack.includes("purchase order") || /\bpo[_ -]?\d/.test(haystack)) return "po";
  if (haystack.includes("monitoring") || haystack.includes("spot id") || haystack.includes("advertise start")) return "thirdPartyMonitoring";
  if (haystack.includes("annexure-1") || haystack.includes("client po number") || haystack.includes("estimate number")) return "agency";
  if (haystack.includes("schedule") || haystack.includes("media estimate") || haystack.includes("planned amount")) return "mediaSchedule";
  return "thirdPartyInvoice";
}

function extractRowsFromPdfText(sourceKey, text, fileName) {
  if (sourceKey === "po") return [extractPoPdfRow(text, fileName)];
  if (sourceKey === "mediaSchedule") return extractMediaSchedulePdfRows(text, fileName);
  if (sourceKey === "agency") return extractAgencyPdfRows(text, fileName);
  if (sourceKey === "thirdPartyMonitoring") return extractMonitoringPdfRows(text, fileName);
  return extractPublisherInvoicePdfRows(text, fileName);
}

function makePdfReviewRow(sourceKey, fileName, status) {
  return {
    Source: SOURCE_CONFIG[sourceKey]?.label || "PDF",
    "File Name": fileName,
    Status: status,
  };
}

function addPdfMetadata(rows, sourceKey, text, fileName) {
  const proof = pdfSourceProof(sourceKey, text);
  const confidence = pdfParserConfidence(sourceKey, rows);
  rows.forEach((row) => {
    row["Source Proof"] = proof;
    row["Parser Confidence"] = confidence;
  });
}

function extractPoPdfRow(text, fileName) {
  const advertiser = pdfLines(text).find((line) => /pvt|private|limited|ltd/i.test(line) && !/vendor/i.test(line)) || "";
  return {
    ...makePdfReviewRow("po", fileName, "Extracted - review"),
    "Advertiser Name": advertiser,
    "PO Number": pdfFirstMatch(text, /PO\s+No\s*:?\s*(\d+)/i) || pdfValueAfterLabel(text, ["PO No", "PO Number"]),
    "PO Date": pdfValueAfterLabel(text, ["Order date", "PO Date", "Purchase Order Date"]),
    "Agency Name": pdfValueAfterLabel(text, ["Vendor", "Agency Name"]),
    Brand: pdfValueAfterLabel(text, ["Brand", "Brand Name"]) || pdfFirstMatch(text, /\n\d+\s*0?([A-Z][A-Z0-9 ]+?)\n[A-Z]{2,}IN/i),
    "Campaign Name": pdfValueAfterLabel(text, ["Campaign Name", "Description"]) || pdfFirstMatch(text, /\n[A-Z0-9]{6,}\n\d{6}\n(.+?est-\s*\d+PC)/i),
    "PO Amount Incl Tax": pdfMoneyAfterLabel(text, ["TOTAL AMOUNT INCL.TAX", "Total Amount Incl Tax", "Total Amount"]),
  };
}

function extractMediaSchedulePdfRows(text, fileName) {
  const header = {
    "Advertiser Name": pdfValueAfterLabel(text, ["Advertiser", "Client Name"]),
    "Agency Name": pdfValueAfterLabel(text, ["Agency", "Agency Name", "Vendor"]),
    Brand: pdfValueAfterLabel(text, ["Brand", "Brand Name"]),
    "Campaign Name": pdfValueAfterLabel(text, ["Campaign Name", "Campaign"]),
    "PO Number": pdfValueAfterLabel(text, ["PO Number", "PO No", "Client PO Number"]),
    "Campaign Period": pdfValueAfterLabel(text, ["Campaign Period", "Estimate Period", "Billing Period"]),
  };
  const rows = [];
  pdfLines(text).forEach((line) => {
    const date = pdfFirstMatch(line, /(\d{1,2}[-/ ][A-Za-z]{3,}[-/ ]\d{2,4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
    if (!date) return;
    const time = pdfFirstMatch(line, /(\d{1,2}:\d{2}(?::\d{2})?)/);
    const numbers = line.match(/\d[\d,]*(?:\.\d+)?/g) || [];
    const money = numbers.filter((item) => Number(item.replace(/,/g, "")) > 99);
    if (!time && money.length < 2) return;
    rows.push({
      ...makePdfReviewRow("mediaSchedule", fileName, "Extracted - review"),
      ...header,
      "Channel Name": pdfValueAfterLabel(text, ["Channel", "Channel Name"]) || pdfFirstMatch(line, /^([A-Za-z][A-Za-z0-9 &-]+)\s+/),
      Program: pdfValueAfterLabel(text, ["Program", "Programme"]) || line.replace(date, "").replace(time || "", "").trim().slice(0, 80),
      Date: date,
      "Air Time": time,
      "Duration Sec": numbers.find((item) => Number(item) > 5 && Number(item) <= 300) || "",
      Spots: numbers.find((item) => Number(item) > 0 && Number(item) <= 999) || "",
      "Rate INR": money[money.length - 2] || "",
      "Planned Amount": money[money.length - 1] || "",
    });
  });
  if (rows.length) return rows;
  return [{
    ...makePdfReviewRow("mediaSchedule", fileName, "Header extracted - review"),
    ...header,
    "Planned Amount": pdfMoneyAfterLabel(text, ["Planned Amount", "Schedule Amount", "Total"]),
  }];
}

function extractAgencyPdfRows(text, fileName) {
  const header = {
    "Agency Name": pdfLines(text)[0] || pdfValueAfterLabel(text, ["Agency Name"]),
    "Advertiser Name": pdfFirstMatch(text, /Activity Details\s*\n(.+)/i) || pdfValueNear(text, "Service provided To", "Invoice Number"),
    "Invoice Number": pdfValueAfterLabel(text, ["Invoice Number", "Invoice No"]),
    "Invoice Date": pdfValueAfterLabel(text, ["Invoice Date"]),
    "Campaign Period": pdfValueAfterLabel(text, ["Activity Month", "Campaign Period"]),
    "Estimate Number": pdfValueAfterLabel(text, ["Estimate Number", "Estimate No"]),
    "Estimate Period": pdfValueAfterLabel(text, ["Estimate Period"]),
    "PO Number": pdfValueAfterLabel(text, ["Client PO Number", "PO Number", "PO No"]),
    Brand: pdfValueAfterLabel(text, ["Brand Name", "Brand"]),
    "Campaign Name": pdfMultilineValueAfterLabel(text, "Campaign Name", ["Country", "PAN Number", "GSTIN"]),
    "Total Value Including Taxes": pdfMoneyAfterLabel(text, ["Grand Total", "Total Invoice Value", "Total Value Including Taxes", "Total Chargeable"]),
  };
  const rows = extractAgencyAnnexurePdfRows(text, fileName, header);
  if (rows.length) return rows;
  return [{ ...makePdfReviewRow("agency", fileName, "Header extracted - review"), ...header }];
}

function extractAgencyAnnexurePdfRows(text, fileName, header) {
  if (!/Annexure-1/i.test(text)) return [];
  const block = text.split(/Annexure-1/i)[1].split(/Annexure-2/i)[0];
  const raw = pdfLines(block).filter((line) => ![
    "channel", "program", "producer", "dates", "spot", "duration", "net spot rate", "per 10 sec", "no of spots", "net cost", "annexure-1",
  ].includes(line.toLowerCase()));
  const rows = [];
  const used = new Set();
  for (let costIndex = 3; costIndex < raw.length; costIndex += 1) {
    if (used.has(costIndex)) continue;
    if (!(pdfIsMoney(raw[costIndex]) && /^\d+$/.test(raw[costIndex - 1]) && pdfIsMoney(raw[costIndex - 2]) && /^\d{1,3}$/.test(raw[costIndex - 3]))) continue;
    let dateEnd = costIndex - 4;
    let dateStart = dateEnd;
    while (dateStart >= 0 && pdfLooksLikeDateFragment(raw[dateStart])) dateStart -= 1;
    dateStart += 1;
    if (dateStart > dateEnd || dateStart < 3) continue;
    const [channel, program, producer] = splitAgencyPdfPrefix(raw, dateStart);
    if (!channel || !program) continue;
    rows.push({
      ...makePdfReviewRow("agency", fileName, "Extracted - review"),
      ...header,
      "Channel Name": channel,
      Program: program,
      "Broadcaster Name": producer,
      Date: raw.slice(dateStart, dateEnd + 1).join(" "),
      "Spot Duration": raw[costIndex - 3],
      "Spot Rate Per 10 Sec": normalizePdfMoney(raw[costIndex - 2]),
      "Date Wise Spots": raw[costIndex - 1],
      "Net Cost": normalizePdfMoney(raw[costIndex]),
    });
    used.add(costIndex);
  }
  return rows;
}

function extractPublisherInvoicePdfRows(text, fileName) {
  const header = {
    "Media Type": "TV",
    "Advertiser Name": pdfFirstMatch(text, /TAX INVOICE\s*\n(.+)/i) || pdfValueAfterLabel(text, ["Advertiser", "Client Name"]),
    "Third Party Vendor Name": pdfFirstMatch(text, /For\s+(.+?)\s*\n/i) || pdfFirstMatch(text, /Beneficiary Name:\s*\n(.+)/i) || pdfValueAfterLabel(text, ["Vendor", "Publisher"]),
    "Agency Name": pdfFirstMatch(text, /Traffic Order:\s*\n(.+)/i) || pdfValueAfterLabel(text, ["Agency Name", "Agency"]),
    "Channel Name": pdfValueAfterLabel(text, ["Station Relation", "Channel Name", "Channel"]),
    "Billing Period": pdfFirstMatch(text, /(\d{2}-[A-Za-z]{3}-\d{4}\s*-\s*\d{2}-[A-Za-z]{3}-\d{4})/i),
    "PO Number": pdfValueAfterLabel(text, ["R.O. Number", "PO Number", "PO No"]),
    "Invoice Number": pdfValueAfterLabel(text, ["Invoice No.", "Invoice No", "Invoice Number"]),
    "Invoice Date": pdfValueAfterLabel(text, ["Invoice Date"]),
    Brand: pdfValueAfterLabel(text, ["Brand", "Brand Name"]),
  };
  const rows = [];
  const telecast = text.split(/TELECAST CERTIFICATE/i).pop();
  let current = null;
  pdfLines(telecast).forEach((line) => {
    const match = line.match(/^(\d+)\s+(\d{1,2}-[A-Za-z]{3}-\d{4})\s+(\d{1,2}:\d{2}:\d{2})(.+)$/i);
    if (match) {
      if (current) rows.push(makePublisherPdfRow(header, current, fileName));
      current = { Date: match[2], "Air Time": match[3], "Spot Copy Caption": match[4].trim() };
      return;
    }
    if (!current) return;
    if (/^\d{1,3}\s+/.test(line) && !/sec/i.test(line)) {
      const [duration, ...program] = line.split(" ");
      current["Duration Sec"] = duration;
      current.Program = program.join(" ").trim();
    } else if (/^\d{1,3}$/.test(line)) {
      current["Duration Sec"] = line;
    } else if (!current.Program && !/page \d+/i.test(line)) {
      current.Program = line;
    }
  });
  if (current) rows.push(makePublisherPdfRow(header, current, fileName));
  if (rows.length) return rows;
  return [{
    ...makePdfReviewRow("thirdPartyInvoice", fileName, "Header extracted - review"),
    ...header,
    "Calculated Amount INR": pdfMoneyAfterLabel(text, ["Payable Amount", "Net Amount", "Total"]),
  }];
}

function makePublisherPdfRow(header, current, fileName) {
  return {
    ...makePdfReviewRow("thirdPartyInvoice", fileName, "Extracted - review"),
    ...header,
    ...current,
    "Calculated Amount INR": calculatePdfAmount(current["Duration Sec"], current["Rate INR"], 1),
  };
}

function extractMonitoringPdfRows(text, fileName) {
  const header = {
    "Media Type": "TV",
    Brand: pdfValueAfterLabel(text, ["PRODUCT", "Brand"]),
    "Channel Name": pdfValueAfterLabel(text, ["CHANNEL", "Channel Name"]),
    "Campaign Name": pdfValueAfterLabel(text, ["CATEGORY", "Campaign Name"]),
  };
  const tokens = pdfLines(text).filter((line) => ![
    "sr no", "program", "start time", "program date", "duration", "advertise start", "time", "brk", "language", "a pos", "caption", "spot id",
  ].includes(line.toLowerCase()));
  const rows = [];
  for (let index = 0; index + 10 < tokens.length; index += 1) {
    const chunk = tokens.slice(index, index + 11);
    if (!/^\d+$/.test(chunk[0]) || !pdfIsTime(chunk[2]) || !pdfIsDate(chunk[3]) || !/^\d{1,3}$/.test(chunk[4]) || !pdfIsTime(chunk[5])) continue;
    rows.push({
      ...makePdfReviewRow("thirdPartyMonitoring", fileName, "Extracted - review"),
      ...header,
      Program: chunk[1],
      Date: chunk[3],
      "Air Time": chunk[5],
      "Duration Sec": chunk[4],
      "Spot Copy Caption": chunk[9],
      "Proof of Performance": "PDF monitoring proof",
      "Expense Monitoring": "Verified from monitoring PDF",
      "Monitoring Status": "Aired",
    });
    index += 10;
  }
  if (rows.length) return rows;
  return [{ ...makePdfReviewRow("thirdPartyMonitoring", fileName, "Header extracted - review"), ...header }];
}

function pdfLines(text) {
  return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function pdfValueAfterLabel(text, labels, maxChars = 160) {
  for (const label of labels) {
    const match = String(text || "").match(new RegExp(`${escapeRegExp(label)}\\s*:?\\s*(.+)`, "i"));
    if (match) return pdfTrimValue(match[1], maxChars);
  }
  return "";
}

function pdfMoneyAfterLabel(text, labels) {
  for (const label of labels) {
    const match = String(text || "").match(new RegExp(`${escapeRegExp(label)}\\s*:?\\s*([-\\d,]+(?:\\.\\d+)?)`, "i"));
    if (match) return normalizePdfMoney(match[1]);
  }
  return "";
}

function pdfFirstMatch(text, regex) {
  const match = String(text || "").match(regex);
  return match ? pdfTrimValue(match[1]) : "";
}

function pdfValueNear(text, start, end) {
  const match = String(text || "").match(new RegExp(`${escapeRegExp(start)}.*?\\n(.+?)\\n.*?${escapeRegExp(end)}`, "is"));
  return match ? pdfTrimValue(match[1]) : "";
}

function pdfMultilineValueAfterLabel(text, label, stopLabels = []) {
  const stop = stopLabels.length ? `\\n(?:${stopLabels.map(escapeRegExp).join("|")})\\b` : "$";
  const match = String(text || "").match(new RegExp(`${escapeRegExp(label)}\\s*:?\\s*\\n(.+?)(?:${stop}|$)`, "is"));
  return match ? match[1].replace(/\s+/g, " ").trim().replace(/^[:-]+|[:-]+$/g, "") : pdfValueAfterLabel(text, [label]);
}

function pdfTrimValue(value, maxChars = 160) {
  return String(value || "").split(/\n/)[0].trim().replace(/^[:-]+|[:-]+$/g, "").replace(/\s{2,}/g, " ").slice(0, maxChars);
}

function normalizePdfMoney(value) {
  const clean = String(value || "").trim().replace(/,/g, "");
  return /^-?\d+(?:\.\d+)?$/.test(clean) ? clean : "";
}

function pdfIsMoney(value) {
  return /^\d[\d,]*(?:\.\d+)?$/.test(String(value || "").trim());
}

function pdfIsDate(value) {
  return /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(String(value || "").trim());
}

function pdfIsTime(value) {
  return /^\d{1,2}:\d{2}(?::\d{2})?$/.test(String(value || "").trim());
}

function pdfLooksLikeDateFragment(value) {
  return /\d{1,2}\s*\(\d+\)/.test(value) || /^\(\d+\)/.test(String(value || "").trim());
}

function splitAgencyPdfPrefix(raw, dateStart) {
  if (dateStart < 3) return ["", "", ""];
  if (dateStart >= 4 && /\b(PVT|PRIVATE|LIMITED|LTD)\b/i.test(raw[dateStart - 2])) {
    return [raw[dateStart - 4], raw[dateStart - 3], raw.slice(dateStart - 2, dateStart).join(" ")];
  }
  return [raw[dateStart - 3], raw[dateStart - 2], raw[dateStart - 1]];
}

function calculatePdfAmount(duration, rate, spots = 1) {
  const durationValue = Number(duration || 0);
  const rateValue = Number(String(rate || "0").replace(/,/g, ""));
  const amount = spots * durationValue / 10 * rateValue;
  return Number.isFinite(amount) && amount ? amount.toFixed(2) : "";
}

function pdfSourceProof(sourceKey, text) {
  const labels = {
    po: ["PO No", "Order date", "Vendor", "TOTAL AMOUNT INCL.TAX"],
    mediaSchedule: ["PO Number", "Campaign Name", "Channel", "Planned Amount"],
    agency: ["Invoice Number", "Invoice Date", "Estimate Number", "Client PO Number", "Annexure-1"],
    thirdPartyInvoice: ["Invoice No", "Invoice Date", "TELECAST CERTIFICATE", "Payable Amount"],
    thirdPartyMonitoring: ["PRODUCT", "CHANNEL", "PERIOD", "SPOT ID"],
  }[sourceKey] || [];
  const allLines = pdfLines(text);
  for (const label of labels) {
    const index = allLines.findIndex((line) => line.toLowerCase().includes(label.toLowerCase()));
    if (index >= 0) return allLines.slice(index, index + 3).join(" | ").slice(0, 260);
  }
  return pdfTrimValue(text, 220);
}

function pdfParserConfidence(sourceKey, rows) {
  const required = {
    po: ["PO Number", "PO Date", "Agency Name", "PO Amount Incl Tax"],
    mediaSchedule: ["Date", "Channel Name", "Program", "Planned Amount"],
    agency: ["Invoice Number", "Invoice Date", "PO Number", "Channel Name", "Net Cost"],
    thirdPartyInvoice: ["Invoice Number", "Invoice Date", "Date", "Air Time", "Duration Sec"],
    thirdPartyMonitoring: ["Channel Name", "Program", "Date", "Air Time", "Duration Sec"],
  }[sourceKey] || [];
  let filled = 0;
  let total = 0;
  rows.forEach((row) => {
    required.forEach((field) => {
      total += 1;
      if (row[field]) filled += 1;
    });
  });
  const ratio = total ? filled / total : 0;
  if (ratio >= 0.85) return "High";
  if (ratio >= 0.6) return "Medium";
  return "Low";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstDatasetWithRows(datasets) {
  return Object.keys(SOURCE_CONFIG).find((sourceKey) => datasets?.[sourceKey]?.length) || "";
}

function parseDelimitedRows(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  const [headers = [], ...body] = rows.filter((items) => items.some((item) => item.trim()));
  const columns = headers.map((header, index) => cleanHeader(header) || `Column ${index + 1}`);
  return body.map((items) => {
    const entry = {};
    columns.forEach((column, index) => {
      entry[column] = items[index] || "";
    });
    return entry;
  });
}

function normalizeRows(rows, sourceKey, fileName = "") {
  const config = SOURCE_CONFIG[sourceKey];
  const sourceColumns = config.columns;
  const cleanedRows = rows.map((row) => {
    const clean = {};
    Object.entries(row).forEach(([key, value]) => {
      clean[cleanHeader(key)] = value == null ? "" : String(value).trim();
    });
    clean.Source = config.label;
    clean["File Name"] = clean["File Name"] || fileName;
    clean.Status = clean.Status || "Imported";
    return clean;
  });
  const extraColumns = columnsFromRows(cleanedRows).filter((column) => !sourceColumns.includes(column));
  const columns = [...sourceColumns, ...extraColumns];
  const normalized = cleanedRows.map((row) => {
    const next = {};
    columns.forEach((column) => {
      next[column] = row[column] || "";
    });
    return next;
  });
  return { columns, rows: normalized };
}

function loadSample() {
  state.datasets = emptyDatasets();
  Object.entries(SAMPLE_DATASETS).forEach(([sourceKey, rows]) => {
    state.datasets[sourceKey] = normalizeRows(rows, sourceKey, "sample-data").rows;
  });
  deriveProgramAndPrRows({ overwrite: false });
  state.accountingFilters = {};
  state.globalFilters = {};
  state.searchQuery = "";
  $("#table-search").value = "";
  state.activeView = "agency";
  if (!$("#campaign-name").value.trim()) $("#campaign-name").value = "TAG-mPRO Reconciliation Sample";
  state.dirty = true;
  renderAll();
  toast("Sample data loaded. Filters and reconciliation results are ready.");
}

function addRow() {
  const sourceKey = SOURCE_CONFIG[state.activeView] ? state.activeView : "agency";
  const row = {};
  SOURCE_CONFIG[sourceKey].columns.forEach((column) => {
    row[column] = "";
  });
  row.Source = SOURCE_CONFIG[sourceKey].label;
  row.Status = "Manual";
  state.datasets[sourceKey].push(row);
  state.activeView = sourceKey;
  state.dirty = true;
  renderAll();
}

async function saveCase() {
  const name = $("#campaign-name").value.trim() || "Untitled reconciliation";
  const caseItem = {
    id: state.activeCaseId || crypto.randomUUID(),
    name,
    datasets: state.datasets,
    columnOrders: state.columnOrders,
    columnWidths: state.columnWidths,
    hiddenColumns: state.hiddenColumns,
    sort: state.sort,
    activeView: state.activeView,
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = state.cases.findIndex((item) => item.id === caseItem.id);
  if (existingIndex >= 0) state.cases[existingIndex] = caseItem;
  else state.cases.unshift(caseItem);
  state.activeCaseId = caseItem.id;
  localStorage.setItem(STORAGE_KEYS.activeCase, caseItem.id);
  localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(state.cases));
  const apiSavedCase = await saveCaseToApi(caseItem);
  if (apiSavedCase) {
    const savedIndex = state.cases.findIndex((item) => item.id === apiSavedCase.id);
    if (savedIndex >= 0) state.cases[savedIndex] = apiSavedCase;
    localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(state.cases));
  }
  state.dirty = false;
  $("#save-status").textContent = `Saved ${formatDateTime(caseItem.updatedAt)}`;
  toast(apiOnline ? "Reconciliation saved to the database." : (IS_LOCAL_APP ? "Reconciliation saved in this browser." : "Cloud database is not connected. This was only saved in this browser."));
}

function exportCsv() {
  const rows = getFilteredRows();
  const columns = getActiveColumns(rows);
  const lines = [columns.map(csvEscape).join(",")];
  rows.forEach((row) => lines.push(columns.map((column) => csvEscape(row[column] || "")).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${($("#campaign-name").value.trim() || "tag-mpro-reconciliation").replace(/\s+/g, "-").toLowerCase()}-${state.activeView}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderAll() {
  applyQualityAnnotations();
  renderTabs();
  renderSummary();
  renderGlobalFilters();
  renderAccountingFilters();
  renderFilterChips();
  renderColumnPanel();
  renderGrid();
}

function renderTabs() {
  $$(".source-tab").forEach((item) => item.classList.toggle("active", item.dataset.view === state.activeView));
}

function renderSummary() {
  const summary = $("#source-summary");
  summary.innerHTML = "";
  summary.classList.add("hidden");
}

function applyQualityAnnotations() {
  Object.keys(QUALITY_REQUIRED_FIELDS).forEach((sourceKey) => {
    (state.datasets[sourceKey] || []).forEach((row) => {
      const issues = qualityIssuesForRow(sourceKey, row);
      row["Quality Issues"] = issues.join("; ");
      if (issues.length) {
        row.Status = "Needs Review";
      } else if (/extracted/i.test(row.Status || "")) {
        row.Status = "Review ready";
      }
    });
  });
  annotateDuplicateQualityIssues("agency", "invoiceNumber", "Duplicate agency invoice number");
  annotateDuplicateQualityIssues("thirdPartyInvoice", "invoiceNumber", "Duplicate publisher invoice number");
  annotateDuplicateQualityIssues("po", "poNumber", "Duplicate PO number");
}

function buildQualityReport() {
  const rows = Object.keys(QUALITY_REQUIRED_FIELDS).flatMap((sourceKey) => {
    return (state.datasets[sourceKey] || []).map((row) => ({ sourceKey, row, issues: qualityIssuesForRow(sourceKey, row) }));
  });
  rows.forEach(({ sourceKey, row, issues }) => {
    if (isDuplicateValue(sourceKey, row, sourceKey === "po" ? "poNumber" : "invoiceNumber")) {
      issues.push(sourceKey === "po" ? "Duplicate PO number" : "Duplicate invoice number");
    }
  });

  let totalChecks = 0;
  let passedChecks = 0;
  let missingFields = 0;
  let formulaIssues = 0;
  let duplicateIssues = 0;
  const issueCounts = new Map();

  rows.forEach(({ sourceKey, row, issues }) => {
    const required = QUALITY_REQUIRED_FIELDS[sourceKey] || [];
    const missing = required.filter((fieldKey) => !readField(row, fieldKey));
    totalChecks += required.length;
    passedChecks += required.length - missing.length;
    missingFields += missing.length;
    issues.forEach((issue) => {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
      if (/formula|amount mismatch/i.test(issue)) formulaIssues += 1;
      if (/duplicate/i.test(issue)) duplicateIssues += 1;
    });
    const formulaCheck = hasFormulaInputs(sourceKey, row);
    if (formulaCheck) {
      totalChecks += 1;
      if (!issues.some((issue) => /formula|amount mismatch/i.test(issue))) passedChecks += 1;
    }
  });

  const topIssues = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([issue, count]) => `${count} row${count === 1 ? "" : "s"}: ${issue}`);

  return {
    totalRows: rows.length,
    accuracy: totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 0,
    rowsWithIssues: rows.filter(({ issues }) => issues.length).length,
    missingFields,
    formulaIssues,
    duplicateIssues,
    aiChecked: rows.filter(({ row }) => /matched|mismatch|review/i.test(row["AI Audit Status"] || "")).length,
    topIssues,
  };
}

function qualityIssuesForRow(sourceKey, row) {
  const issues = [];
  const required = QUALITY_REQUIRED_FIELDS[sourceKey] || [];
  const missing = required.filter((fieldKey) => !readField(row, fieldKey)).map((fieldKey) => QUALITY_LABELS[fieldKey] || toTitle(fieldKey));
  if (missing.length) issues.push(`Missing ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? ` +${missing.length - 4} more` : ""}`);

  const formulaIssue = formulaIssueForRow(sourceKey, row);
  if (formulaIssue) issues.push(formulaIssue);

  const dateIssue = dateIssueForRow(sourceKey, row);
  if (dateIssue) issues.push(dateIssue);

  return issues;
}

function formulaIssueForRow(sourceKey, row) {
  if (sourceKey === "agency") {
    const spots = parseNumber(readField(row, "spots"));
    const duration = parseNumber(readField(row, "duration"));
    const rate = parseNumber(readField(row, "rate"));
    const amount = parseNumber(readField(row, "amount"));
    if ([spots, duration, rate, amount].some(Number.isNaN)) return "";
    const expected = spots * (duration / 10) * rate;
    return amountMismatch(expected, amount) ? `Net Cost formula mismatch; expected ${formatAmount(expected)}` : "";
  }
  if (sourceKey === "thirdPartyInvoice") {
    const duration = parseNumber(readField(row, "duration"));
    const rate = parseNumber(readField(row, "rate"));
    const spots = parseNumber(readField(row, "spots")) || 1;
    const amount = parseNumber(readField(row, "amount"));
    if ([duration, rate, amount].some(Number.isNaN)) return "";
    const expected = spots * (duration / 10) * rate;
    return amountMismatch(expected, amount) ? `Final amount formula mismatch; expected ${formatAmount(expected)}` : "";
  }
  if (sourceKey === "mediaSchedule") {
    const spots = parseNumber(readField(row, "spots"));
    const duration = parseNumber(readField(row, "duration"));
    const rate = parseNumber(readField(row, "rate"));
    const amount = parseNumber(readField(row, "plannedAmount"));
    if ([spots, duration, rate, amount].some(Number.isNaN)) return "";
    const expected = spots * (duration / 10) * rate;
    return amountMismatch(expected, amount) ? `Planned amount formula mismatch; expected ${formatAmount(expected)}` : "";
  }
  return "";
}

function dateIssueForRow(sourceKey, row) {
  const dateValue = readField(row, "date") || readField(row, "invoiceDate") || readField(row, "poDate");
  if (!dateValue || parseLooseDate(dateValue)) return "";
  if (/\d+\(\d+\)/.test(dateValue)) return "";
  return "Date format needs review";
}

function hasFormulaInputs(sourceKey, row) {
  if (sourceKey === "agency") return ["spots", "duration", "rate", "amount"].every((key) => readField(row, key));
  if (sourceKey === "thirdPartyInvoice") return ["duration", "rate", "amount"].every((key) => readField(row, key));
  if (sourceKey === "mediaSchedule") return ["spots", "duration", "rate", "plannedAmount"].every((key) => readField(row, key));
  return false;
}

function amountMismatch(expected, actual) {
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) > Math.max(1, Math.abs(expected) * 0.02);
}

function annotateDuplicateQualityIssues(sourceKey, fieldKey, message) {
  const rows = state.datasets[sourceKey] || [];
  rows.forEach((row) => {
    if (!isDuplicateValue(sourceKey, row, fieldKey)) return;
    const issues = new Set(String(row["Quality Issues"] || "").split(";").map((item) => item.trim()).filter(Boolean));
    issues.add(message);
    row["Quality Issues"] = Array.from(issues).join("; ");
    row.Status = "Needs Review";
  });
}

function isDuplicateValue(sourceKey, row, fieldKey) {
  const value = readField(row, fieldKey);
  if (!value) return false;
  const rows = state.datasets[sourceKey] || [];
  return rows.filter((item) => readField(item, fieldKey) === value).length > 1;
}

function showUploadHelp(key) {
  const help = HELP_CONTENT[key];
  if (!help) return;
  $("#help-title").textContent = help.title;
  $("#help-lines").innerHTML = help.lines.map((line) => `<li>${escapeHTML(line)}</li>`).join("");
  $("#help-panel").classList.remove("hidden");
}

function closeUploadHelp() {
  $("#help-panel").classList.add("hidden");
}

function toggleColumnPanel() {
  $("#column-panel").classList.toggle("hidden");
  renderColumnPanel();
}

function renderColumnPanel() {
  const panel = $("#column-panel");
  if (!panel || panel.classList.contains("hidden")) return;
  const rows = getActiveRows();
  const columns = getActiveColumns(rows, { includeHidden: true });
  const hidden = state.hiddenColumns[state.activeView] || [];
  panel.innerHTML = `<strong>Columns</strong><span>Select columns for this view</span>`;
  columns.forEach((column) => {
    const label = document.createElement("label");
    label.className = "column-toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !hidden.includes(column);
    input.addEventListener("change", () => {
      const nextHidden = new Set(state.hiddenColumns[state.activeView] || []);
      if (input.checked) nextHidden.delete(column);
      else nextHidden.add(column);
      state.hiddenColumns[state.activeView] = Array.from(nextHidden);
      state.dirty = true;
      renderGrid();
    });
    label.append(input, document.createTextNode(column));
    panel.appendChild(label);
  });
}

function renderGlobalFilters() {
  const rows = allRowsWithReconciliation();
  GLOBAL_FILTERS.forEach((key) => {
    const container = $(`[data-global-filter-control="${key}"]`);
    const values = uniqueValues(rows.map((row) => readField(row, key))).filter(Boolean);
    renderSearchableFilter(container, {
      key,
      label: FILTER_LABELS[key] || toTitle(key),
      values,
      selected: state.globalFilters[key],
      disabledText: "No values yet",
      onChange: (nextValues) => {
        state.globalFilters[key] = nextValues;
        if (!nextValues.length) delete state.globalFilters[key];
        localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
        renderFilterChips();
        renderGrid();
      },
    });
    state.globalFilters[key] = normalizeFilterValues(state.globalFilters[key]).filter((value) => values.includes(value));
    if (!state.globalFilters[key].length) delete state.globalFilters[key];
  });
  updateGlobalFilterCount();
  localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
}

function renderAccountingFilters() {
  const form = $("#accounting-filter-form");
  const rows = allRowsWithReconciliation();
  form.innerHTML = "";
  FILTER_DEFS.forEach((def) => {
    const wrapper = document.createElement("div");
    wrapper.className = "filter-control-shell side-filter-control";
    const values = uniqueValues(rows.map((row) => readField(row, def.key))).filter(Boolean);
    renderSearchableFilter(wrapper, {
      key: def.key,
      label: def.label,
      values,
      selected: state.accountingFilters[def.key],
      disabledText: "No values yet",
      onChange: (nextValues) => {
        state.accountingFilters[def.key] = nextValues;
        if (!nextValues.length) delete state.accountingFilters[def.key];
        localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
        renderFilterChips();
        renderGrid();
      },
    });
    state.accountingFilters[def.key] = normalizeFilterValues(state.accountingFilters[def.key]).filter((value) => values.includes(value));
    if (!state.accountingFilters[def.key].length) delete state.accountingFilters[def.key];
    form.appendChild(wrapper);
  });
  localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
}

function renderSearchableFilter(container, config) {
  if (!container) return;
  const selected = normalizeFilterValues(config.selected).filter((value) => config.values.includes(value));
  const summary = selected.length ? `${selected.length} selected` : "All";
  container.innerHTML = `
    <label class="filter-label">${escapeHTML(config.label)}</label>
    <div class="search-filter ${config.values.length ? "" : "is-disabled"}" data-filter-key="${escapeHTML(config.key)}">
      <button class="filter-select-button" type="button" ${config.values.length ? "" : "disabled"}>
        <span>${escapeHTML(summary)}</span><b>v</b>
      </button>
      <div class="filter-dropdown">
        <input class="filter-search-input" type="search" placeholder="Search ${escapeHTML(config.label)}" />
        <button class="filter-clear-option" type="button">All</button>
        <div class="filter-option-list">
          ${
            config.values.length
              ? config.values.map((value) => `
                <label class="filter-option">
                  <input type="checkbox" value="${escapeHTML(value)}" ${selected.includes(value) ? "checked" : ""} />
                  <span>${escapeHTML(value)}</span>
                </label>
              `).join("")
              : `<span class="filter-empty">${escapeHTML(config.disabledText || "No values")}</span>`
          }
        </div>
      </div>
    </div>
  `;
  const root = container.querySelector(".search-filter");
  const button = container.querySelector(".filter-select-button");
  const search = container.querySelector(".filter-search-input");
  button?.addEventListener("click", () => {
    $$(".search-filter.is-open").forEach((item) => {
      if (item !== root) item.classList.remove("is-open");
    });
    root.classList.toggle("is-open");
    if (root.classList.contains("is-open")) search?.focus();
  });
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    container.querySelectorAll(".filter-option").forEach((option) => {
      option.hidden = query && !option.textContent.toLowerCase().includes(query);
    });
  });
  container.querySelector(".filter-clear-option")?.addEventListener("click", () => {
    container.querySelectorAll(".filter-option input").forEach((input) => {
      input.checked = false;
    });
    config.onChange([]);
    renderSearchableFilter(container, { ...config, selected: [] });
  });
  container.querySelectorAll(".filter-option input").forEach((input) => {
    input.addEventListener("change", () => {
      const nextValues = Array.from(container.querySelectorAll(".filter-option input:checked")).map((item) => item.value);
      config.onChange(nextValues);
      const label = container.querySelector(".filter-select-button span");
      if (label) label.textContent = nextValues.length ? `${nextValues.length} selected` : "All";
    });
  });
}

function renderFilterChips() {
  const chipBar = $("#active-filter-chips");
  if (!chipBar) return;
  const chips = [];
  Object.entries(state.globalFilters).forEach(([key, value]) => {
    normalizeFilterValues(value).forEach((item) => chips.push({ type: "global", key, label: toTitle(key), value: item }));
  });
  Object.entries(state.accountingFilters).forEach(([key, value]) => {
    normalizeFilterValues(value).forEach((item) => chips.push({ type: "accounting", key, label: toTitle(key), value: item }));
  });
  if (state.searchQuery) chips.push({ type: "search", key: "search", label: "Search", value: state.searchQuery });

  if (!chips.length) {
    chipBar.innerHTML = `<span class="empty-chip">No active filters</span>`;
    updateGlobalFilterCount();
    return;
  }

  chipBar.innerHTML = chips.map((chip) => (
    `<button class="filter-chip" type="button" data-filter-type="${chip.type}" data-filter-key="${chip.key}" data-filter-value="${escapeHTML(chip.value)}">
      <span>${escapeHTML(chip.label)}: ${escapeHTML(chip.value)}</span><b>x</b>
    </button>`
  )).join("");
  chipBar.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => clearFilterChip(button.dataset.filterType, button.dataset.filterKey, button.dataset.filterValue));
  });
  updateGlobalFilterCount();
}

function updateGlobalFilterCount() {
  const counter = $("#global-filter-count");
  if (!counter) return;
  const count = Object.values(state.globalFilters).reduce((total, value) => total + normalizeFilterValues(value).length, 0);
  counter.textContent = count ? `${count} active` : "All records";
}

function clearFilterChip(type, key, value = "") {
  if (type === "global") {
    state.globalFilters[key] = normalizeFilterValues(state.globalFilters[key]).filter((item) => item !== value);
    if (!state.globalFilters[key].length) delete state.globalFilters[key];
    localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
  } else if (type === "accounting") {
    state.accountingFilters[key] = normalizeFilterValues(state.accountingFilters[key]).filter((item) => item !== value);
    if (!state.accountingFilters[key].length) delete state.accountingFilters[key];
    localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
  } else if (type === "search") {
    state.searchQuery = "";
    $("#table-search").value = "";
  }
  renderAll();
}

function resetGlobalFilters() {
  state.globalFilters = {};
  localStorage.removeItem(STORAGE_KEYS.globalFilters);
  renderAll();
}

function clearAccountingFilters() {
  state.accountingFilters = {};
  localStorage.removeItem(STORAGE_KEYS.accountingFilters);
  renderAccountingFilters();
  renderFilterChips();
  renderGrid();
}

function normalizeFilterValues(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  const clean = String(value || "").trim();
  return clean ? [clean] : [];
}

function renderGrid() {
  ensureRowIds();
  const table = $("#invoice-grid");
  const rows = getFilteredRows();
  const columns = getActiveColumns(rows);
  $("#record-count").textContent = `${rows.length} of ${getActiveRows().length} records`;
  $("#save-status").textContent = state.dirty ? "Unsaved changes" : state.activeCaseId ? "Saved" : "Not saved";
  table.innerHTML = "";
  if (!columns.length) return;

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.appendChild(makeHeaderCell("#", "row-index"));
  columns.forEach((column) => headRow.appendChild(makeColumnHeader(column)));
  headRow.appendChild(makeHeaderCell("", "delete-col"));
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    const indexCell = document.createElement("td");
    indexCell.className = "row-index";
    indexCell.textContent = rowIndex + 1;
    tr.appendChild(indexCell);
    columns.forEach((column) => {
      const td = document.createElement("td");
      td.style.width = `${state.columnWidths[column] || 160}px`;
      const readOnly = state.activeView === "reconciliation" || state.activeView === "combined";
      if (readOnly) {
        const value = row[column] || "";
        const text = document.createElement("span");
        text.className = ["Reconciliation Status", "Status"].includes(column) ? `status-pill ${normalizeKey(value).replace(/\s+/g, "-")}` : "cell-text";
        text.textContent = value;
        td.appendChild(text);

        if (row.__crossFills && row.__crossFills[column]) {
          const filler = row.__crossFills[column];
          const suffix = SOURCE_SUFFIX[filler] || filler.toUpperCase();
          td.classList.add("cross-filled");
          td.title = `Auto-filled from: ${SOURCE_CONFIG[filler]?.label || filler} (${suffix})`;

          const badge = document.createElement("span");
          badge.className = "cross-filled-badge";
          badge.textContent = suffix;
          td.appendChild(badge);
        }

        tr.appendChild(td);
        return;
      }
      const input = document.createElement("input");
      input.value = row[column] || "";
      input.addEventListener("input", () => {
        const targetRow = row.__originalRow || row;
        targetRow[column] = input.value;
        state.dirty = true;
        $("#save-status").textContent = "Unsaved changes";
      });
      input.addEventListener("blur", () => {
        if (!["program", "pr"].includes(state.activeView)) deriveProgramAndPrRows({ overwrite: false });
        renderAll();
      });
      td.appendChild(input);

      if (row.__crossFills && row.__crossFills[column]) {
        const filler = row.__crossFills[column];
        const suffix = SOURCE_SUFFIX[filler] || filler.toUpperCase();
        td.classList.add("cross-filled");
        td.title = `Auto-filled from: ${SOURCE_CONFIG[filler]?.label || filler} (${suffix})`;

        const badge = document.createElement("span");
        badge.className = "cross-filled-badge";
        badge.textContent = suffix;
        td.appendChild(badge);
      }

      tr.appendChild(td);
    });
    const deleteCell = document.createElement("td");
    deleteCell.className = "delete-col";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-row";
    deleteButton.textContent = "x";
    deleteButton.disabled = state.activeView === "reconciliation" || state.activeView === "combined";
    deleteButton.addEventListener("click", () => deleteRow(row.__rowId));
    deleteCell.appendChild(deleteButton);
    tr.appendChild(deleteCell);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function getActiveRows() {
  if (state.activeView === "reconciliation") return buildReconciliationRows();
  if (state.activeView === "combined") return combinedRows();
  return state.datasets[state.activeView] || [];
}

// Feature 3: Cross-Table Data Enrichment (Auto-Fill + Highlight)
function buildCrossRefIndex() {
  const index = {
    byPo: new Map(),
    byPr: new Map(),
    byCampaign: new Map(),
  };

  Object.entries(state.datasets).forEach(([sourceKey, rows]) => {
    if (!rows || !Array.isArray(rows)) return;
    rows.forEach((row) => {
      // 1. PO Number
      const poVal = String(row["PO Number"] || "").trim().toUpperCase();
      if (poVal) {
        if (!index.byPo.has(poVal)) index.byPo.set(poVal, []);
        index.byPo.get(poVal).push({ sourceKey, row });
      }

      // 2. PR Number
      const prVal = String(row["PR Number"] || "").trim().toUpperCase();
      if (prVal) {
        if (!index.byPr.has(prVal)) index.byPr.set(prVal, []);
        index.byPr.get(prVal).push({ sourceKey, row });
      }

      // 3. Campaign ID
      const cmpVal = String(row["Campaign ID"] || "").trim().toUpperCase();
      if (cmpVal) {
        if (!index.byCampaign.has(cmpVal)) index.byCampaign.set(cmpVal, []);
        index.byCampaign.get(cmpVal).push({ sourceKey, row });
      }
    });
  });

  return index;
}

function findMatches(row, index, currentSourceKey) {
  const matches = [];
  const seenRows = new Set();

  const addMatchesFromList = (list) => {
    if (!list) return;
    list.forEach(({ sourceKey: matchSourceKey, row: matchRow }) => {
      if (matchSourceKey === currentSourceKey) return;
      if (matchRow === row || (matchRow.__rowId && matchRow.__rowId === row.__rowId)) return;
      if (seenRows.has(matchRow)) return;
      seenRows.add(matchRow);
      matches.push({ sourceKey: matchSourceKey, row: matchRow });
    });
  };

  // 1. PO Number Match
  const poVal = String(row["PO Number"] || "").trim().toUpperCase();
  if (poVal) {
    addMatchesFromList(index.byPo.get(poVal));
  }

  // 2. PR Number Match
  const prVal = String(row["PR Number"] || "").trim().toUpperCase();
  if (prVal) {
    addMatchesFromList(index.byPr.get(prVal));
  }

  // 3. Campaign ID Match
  const cmpVal = String(row["Campaign ID"] || "").trim().toUpperCase();
  if (cmpVal) {
    addMatchesFromList(index.byCampaign.get(cmpVal));
  }

  // Sort matches by SOURCE_PRIORITY
  const SOURCE_PRIORITY = {
    po: 1,
    agency: 2,
    thirdPartyInvoice: 3,
    mediaSchedule: 4,
    thirdPartyMonitoring: 5,
    pr: 6,
    program: 7,
  };

  matches.sort((a, b) => {
    const priA = SOURCE_PRIORITY[a.sourceKey] || 99;
    const priB = SOURCE_PRIORITY[b.sourceKey] || 99;
    return priA - priB;
  });

  return matches;
}

function enrichRow(row, sourceKey, index, columns) {
  const enrichedRow = { ...row };
  const crossFills = {}; // maps column -> sourceKey

  const hasLinkKey = ["PO Number", "PR Number", "Campaign ID"].some((k) => {
    const val = row[k];
    return val !== undefined && val !== null && String(val).trim() !== "";
  });

  if (!hasLinkKey) {
    return { enrichedRow, crossFills };
  }

  const matches = findMatches(row, index, sourceKey);
  if (!matches.length) {
    return { enrichedRow, crossFills };
  }

  const isBlank = (val) => val === undefined || val === null || String(val).trim() === "";

  columns.forEach((column) => {
    // Avoid cross-filling metadata columns or columns that already have values
    if (["Source", "File Name", "Status", "Import ID", "Document Type", "Source Type", "PDF File Name", "Extraction Review", "Parser Confidence", "Quality Issues"].includes(column)) return;
    if (!isBlank(row[column])) return;

    // Find the first match that has a value for this column
    for (const match of matches) {
      const matchVal = match.row[column];
      if (!isBlank(matchVal)) {
        enrichedRow[column] = matchVal;
        crossFills[column] = match.sourceKey;
        break;
      }
    }
  });

  return { enrichedRow, crossFills };
}

function getFilteredRows() {
  let rows = [...getActiveRows()];

  if (state.activeView !== "reconciliation") {
    const crossRefIndex = buildCrossRefIndex();
    const allCols = getActiveColumns(rows, { includeHidden: true });
    rows = rows.map((row) => {
      const { enrichedRow, crossFills } = enrichRow(row, state.activeView, crossRefIndex, allCols);
      enrichedRow.__crossFills = crossFills;
      enrichedRow.__originalRow = row;
      return enrichedRow;
    });
  }

  rows = rows.filter(matchesGlobalFilters).filter(matchesAccountingFilters);
  // Apply per-column filters
  const colFilters = state.columnFilters[state.activeView] || {};
  Object.entries(colFilters).forEach(([col, allowed]) => {
    if (!allowed || !allowed.length) return;
    const allowedSet = new Set(allowed);
    rows = rows.filter((row) => allowedSet.has(String(row[col] || "")));
  });
  if (state.searchQuery) {
    rows = rows.filter((row) => Object.values(row).some((value) => String(value || "").toLowerCase().includes(state.searchQuery)));
  }
  if (state.sort.column) {
    const direction = state.sort.direction === "asc" ? 1 : -1;
    rows.sort((a, b) => compareValues(a[state.sort.column], b[state.sort.column]) * direction);
  }
  return rows;
}

function getActiveColumns(rows, options = {}) {
  let columns;
  if (state.activeView === "reconciliation") {
    columns = [
      "Reconciliation Status",
      "Issues",
      "Campaign ID",
      "Campaign Name",
      "Campaign Type",
      "Campaign Manager",
      "Program Name",
      "PR Number",
      "PO Number",
      "Advertiser Name",
      "Agency Name",
      "Brand",
      "Program Budget",
      "PR Amount",
      "PO Amount Incl Tax",
      "Media Estimate/Schedule Amount",
      "Agency Total Value",
      "Publisher Invoice Amount",
      "Proof of Performance",
      "Expense Monitoring",
      "Program Budget Balance",
      "PR Budget Balance",
      "Agency Rows",
      "Publisher Invoice Rows",
      "Monitoring Rows",
    ];
  } else if (SOURCE_CONFIG[state.activeView]) {
    columns = mergeColumns(SOURCE_CONFIG[state.activeView].columns, columnsFromRows(rows));
  } else {
    columns = columnsFromRows(rows);
  }
  columns = applyColumnOrder(columns);
  if (options.includeHidden) return columns;
  const hidden = state.hiddenColumns[state.activeView] || [];
  const visible = columns.filter((column) => !hidden.includes(column));
  return visible.length ? visible : columns.slice(0, 1);
}

function allRowsWithReconciliation() {
  return [...combinedRows(), ...buildReconciliationRows()];
}

function combinedRows() {
  return Object.entries(state.datasets)
    .filter(([sourceKey]) => sourceKey !== "pr")
    .flatMap(([, rows]) => rows);
}

function deriveProgramAndPrRows(options = {}) {
  const sourceRows = [
    ...state.datasets.po,
    ...state.datasets.mediaSchedule,
    ...state.datasets.agency,
    ...state.datasets.thirdPartyInvoice,
    ...state.datasets.thirdPartyMonitoring,
  ];
  const programRows = new Map((options.overwrite === false ? state.datasets.program : []).map((row) => [readField(row, "campaignId") || readField(row, "campaign"), row]));
  const prRows = new Map((options.overwrite === false ? state.datasets.pr : []).map((row) => [readField(row, "prNumber"), row]));

  sourceRows.forEach((row) => {
    const campaignId = readField(row, "campaignId");
    const campaign = readField(row, "campaign");
    const programKey = campaignId || campaign;
    if (programKey && !programRows.has(programKey)) {
      const related = sourceRows.filter((item) => (campaignId && readField(item, "campaignId") === campaignId) || (campaign && readField(item, "campaign") === campaign));
      programRows.set(programKey, {
        Source: "Derived Program",
        "Campaign ID": campaignId,
        "Campaign Name": campaign,
        "Program Name": readField(row, "programName") || readField(row, "program"),
        "Campaign Type": readField(row, "campaignType"),
        Budget: String(sumValues(related, "budget") || sumValues(related, "prAmount") || sumValues(related, "poAmount") || sumValues(related, "totalValue") || ""),
        "Program Manager": readField(row, "programManager"),
        "Campaign Manager": readField(row, "campaignManager"),
        Brand: readField(row, "brand"),
        "Advertiser Name": readField(row, "advertiser"),
        Status: "Derived",
      });
    }

    const prNumber = readField(row, "prNumber");
    if (prNumber && !prRows.has(prNumber)) {
      const related = sourceRows.filter((item) => readField(item, "prNumber") === prNumber);
      prRows.set(prNumber, {
        Source: "Derived PR",
        "PR Number": prNumber,
        "PR Date": readField(row, "prDate"),
        "PR Description": readField(row, "campaign") || readField(row, "program"),
        "Vendor Name": readField(row, "vendor") || readField(row, "agency"),
        "Brand Name": readField(row, "brand"),
        "Campaign Name": campaign,
        "Campaign ID": campaignId,
        "Campaign Type": readField(row, "campaignType"),
        "Campaign Manager": readField(row, "campaignManager"),
        "Program Name": readField(row, "programName") || readField(row, "program"),
        "PR Amount": String(sumValues(related, "prAmount") || sumValues(related, "poAmount") || sumValues(related, "totalValue") || ""),
        Status: "Derived",
      });
    }
  });

  if (programRows.size) state.datasets.program = normalizeRows(Array.from(programRows.values()), "program", "derived").rows;
  if (prRows.size) state.datasets.pr = normalizeRows(Array.from(prRows.values()), "pr", "derived").rows;
}

function buildReconciliationRows() {
  const poKeys = uniqueValues([
    ...state.datasets.po.map((row) => readField(row, "poNumber")),
    ...state.datasets.agency.map((row) => readField(row, "poNumber")),
    ...state.datasets.mediaSchedule.map((row) => readField(row, "poNumber")),
    ...state.datasets.thirdPartyInvoice.map((row) => readField(row, "poNumber")),
  ]).filter(Boolean);
  const prOnlyKeys = uniqueValues(state.datasets.pr.map((row) => readField(row, "prNumber"))).filter((prNumber) => {
    return prNumber && !state.datasets.po.some((row) => readField(row, "prNumber") === prNumber);
  });
  const keys = [...poKeys, ...prOnlyKeys];
  if (!keys.length && !countRows(state.datasets)) return [];

  return keys.map((key) => {
    const poRows = state.datasets.po.filter((row) => readField(row, "poNumber") === key || readField(row, "prNumber") === key);
    const poNumber = readField(poRows[0] || {}, "poNumber") || key;
    const agencyRows = state.datasets.agency.filter((row) => readField(row, "poNumber") === poNumber || readField(row, "prNumber") === key);
    const scheduleRows = state.datasets.mediaSchedule.filter((row) => readField(row, "poNumber") === poNumber || readField(row, "prNumber") === key);
    const thirdPartyRows = state.datasets.thirdPartyInvoice.filter((row) => readField(row, "poNumber") === poNumber || readField(row, "prNumber") === key);
    const linkedPrNumber = [poRows[0], agencyRows[0], scheduleRows[0], thirdPartyRows[0]].map((row) => readField(row || {}, "prNumber")).find(Boolean) || key;
    const prRows = state.datasets.pr.filter((row) => readField(row, "prNumber") === linkedPrNumber);
    const monitoringRows = matchMonitoringRows(agencyRows, thirdPartyRows, scheduleRows);
    const first = prRows[0] || poRows[0] || scheduleRows[0] || agencyRows[0] || thirdPartyRows[0] || monitoringRows[0] || {};
    const campaignId = readField(first, "campaignId");
    const campaignName = readField(first, "campaign");
    const programRows = state.datasets.program.filter((row) => (campaignId && readField(row, "campaignId") === campaignId) || (campaignName && readField(row, "campaign") === campaignName));
    const programBudget = sumValues(programRows, "budget");
    const prAmount = sumValues(prRows, "prAmount");
    const poAmount = sumValues(poRows, "poAmount");
    const scheduleAmount = sumValues(scheduleRows, "plannedAmount");
    const agencyAmount = sumValues(agencyRows, "totalValue");
    const thirdPartyAmount = sumValues(thirdPartyRows, "amount");
    const issues = [];
    if (!prRows.length && String(linkedPrNumber).startsWith("PR")) issues.push("PR data missing");
    if (!poRows.length) issues.push("PO missing");
    if (!scheduleRows.length) issues.push("Media schedule missing");
    if (!agencyRows.length) issues.push("Agency invoice missing");
    if (!thirdPartyRows.length) issues.push("Publisher invoice missing");
    if (thirdPartyRows.length && !monitoringRows.length) issues.push("Monitoring missing");
    if (programBudget && prAmount && prAmount > programBudget) issues.push("PR amount exceeds program budget");
    if (prAmount && poAmount && poAmount > prAmount) issues.push("PO amount exceeds PR amount");
    if (poAmount && agencyAmount && Math.abs(poAmount - agencyAmount) > 1) issues.push("PO vs agency amount mismatch");
    if (scheduleAmount && thirdPartyAmount && Math.abs(scheduleAmount - thirdPartyAmount) > Math.max(1, scheduleAmount * 0.02)) issues.push("Schedule vs publisher invoice amount review");
    if (agencyAmount && thirdPartyAmount && Math.abs(agencyAmount - thirdPartyAmount) > Math.max(1, agencyAmount * 0.02)) issues.push("Agency vs publisher invoice amount review");

    return {
      "Reconciliation Status": issues.length ? "Needs Review" : "Matched",
      Issues: issues.join("; ") || "Matched",
      "Campaign ID": campaignId,
      "Campaign Name": campaignName,
      "Campaign Type": readField(first, "campaignType"),
      "Campaign Manager": readField(first, "campaignManager"),
      "Program Name": readField(first, "programName") || readField(first, "program"),
      "PR Number": readField(first, "prNumber") || linkedPrNumber,
      "PO Number": poNumber,
      "Advertiser Name": readField(first, "advertiser"),
      "Agency Name": readField(first, "agency"),
      Brand: readField(first, "brand"),
      "Program Budget": programBudget ? String(programBudget) : "",
      "PR Amount": prAmount ? String(prAmount) : "",
      "PO Amount Incl Tax": poAmount ? String(poAmount) : "",
      "Media Estimate/Schedule Amount": scheduleAmount ? String(scheduleAmount) : "",
      "Agency Total Value": agencyAmount ? String(agencyAmount) : "",
      "Publisher Invoice Amount": thirdPartyAmount ? String(thirdPartyAmount) : "",
      "Proof of Performance": readField(monitoringRows[0] || first, "proofOfPerformance"),
      "Expense Monitoring": readField(monitoringRows[0] || first, "expenseMonitoring"),
      "Program Budget Balance": programBudget ? String(programBudget - prAmount) : "",
      "PR Budget Balance": prAmount ? String(prAmount - poAmount) : "",
      "Agency Rows": String(agencyRows.length),
      "Publisher Invoice Rows": String(thirdPartyRows.length),
      "Monitoring Rows": String(monitoringRows.length),
      Source: "Reconciliation",
      Status: issues.length ? "Needs Review" : "Matched",
    };
  });
}

function matchMonitoringRows(agencyRows, thirdPartyRows, scheduleRows = []) {
  const anchors = [...agencyRows, ...thirdPartyRows, ...scheduleRows];
  return state.datasets.thirdPartyMonitoring.filter((monitoringRow) => {
    return anchors.some((row) => {
      const sameDate = !readField(row, "date") || !readField(monitoringRow, "date") || readField(row, "date") === readField(monitoringRow, "date");
      const sameChannel = !readField(row, "channel") || !readField(monitoringRow, "channel") || readField(row, "channel") === readField(monitoringRow, "channel");
      const sameProgram = !readField(row, "program") || !readField(monitoringRow, "program") || readField(row, "program") === readField(monitoringRow, "program");
      return sameDate && sameChannel && sameProgram;
    });
  });
}

function deleteRow(rowId) {
  if (!SOURCE_CONFIG[state.activeView]) return;
  state.datasets[state.activeView] = state.datasets[state.activeView].filter((row) => row.__rowId !== rowId);
  if (!["program", "pr"].includes(state.activeView)) deriveProgramAndPrRows({ overwrite: false });
  state.dirty = true;
  renderAll();
}

function matchesGlobalFilters(row) {
  return Object.entries(state.globalFilters).every(([key, selected]) => matchesAnySelectedValue(row, key, selected));
}

function matchesAccountingFilters(row) {
  return Object.entries(state.accountingFilters).every(([key, selected]) => matchesAnySelectedValue(row, key, selected));
}

function matchesAnySelectedValue(row, key, selected) {
  const values = normalizeFilterValues(selected);
  if (!values.length) return true;
  const actual = readField(row, key).toLowerCase();
  return values.some((value) => actual === value.toLowerCase());
}

function makeHeaderCell(text, className) {
  const th = document.createElement("th");
  th.className = className;
  th.textContent = text;
  return th;
}

function makeColumnHeader(column) {
  const th = document.createElement("th");
  th.draggable = true;
  th.dataset.column = column;
  th.style.width = `${state.columnWidths[column] || 160}px`;
  const inner = document.createElement("div");
  inner.className = "th-inner";
  const title = document.createElement("span");
  title.className = "th-title";
  title.textContent = column;

  const suffix = COLUMN_TO_SUFFIX[column];
  let suffixSpan = null;
  if (suffix) {
    suffixSpan = document.createElement("span");
    suffixSpan.className = "th-suffix";
    suffixSpan.textContent = suffix;
    suffixSpan.title = `Source: ${suffix}`;
  }

  const sortMark = document.createElement("span");
  sortMark.textContent = state.sort.column === column ? (state.sort.direction === "asc" ? "▲" : "▼") : "";
  sortMark.style.fontSize = "9px";
  sortMark.style.color = "var(--teal)";

  // Filter button
  const filterWrap = document.createElement("span");
  filterWrap.className = "col-filter-wrap";
  const filterBtn = document.createElement("button");
  filterBtn.type = "button";
  filterBtn.className = "col-filter-btn";
  const colFilters = state.columnFilters[state.activeView] || {};
  const isFiltered = colFilters[column] && colFilters[column].length > 0;
  if (isFiltered) filterBtn.classList.add("col-filter-active");
  filterBtn.title = "Filter column";
  filterBtn.innerHTML = isFiltered ? "▼" : "⌄";
  filterBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openColFilterDropdown(column, filterBtn, getActiveRows());
  });
  filterWrap.appendChild(filterBtn);

  const handle = document.createElement("span");
  handle.className = "resize-handle";
  if (suffixSpan) {
    inner.append(title, suffixSpan, sortMark, filterWrap, handle);
  } else {
    inner.append(title, sortMark, filterWrap, handle);
  }
  th.appendChild(inner);
  th.addEventListener("click", (event) => {
    if (event.target === handle || event.target.closest(".col-filter-wrap")) return;
    sortBy(column);
  });
  th.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", column));
  th.addEventListener("dragover", (event) => event.preventDefault());
  th.addEventListener("drop", (event) => {
    event.preventDefault();
    moveColumn(event.dataTransfer.getData("text/plain"), column);
  });
  handle.addEventListener("mousedown", (event) => startResize(event, column, th));
  return th;
}

// ── Column Filter Dropdown Logic ──────────────────────────────
let _activeColFilterDropdown = null;

function closeAllColFilterDropdowns() {
  if (_activeColFilterDropdown) {
    _activeColFilterDropdown.classList.remove("is-open");
    _activeColFilterDropdown.style.display = "none";
    if (_activeColFilterDropdown.parentNode) _activeColFilterDropdown.parentNode.removeChild(_activeColFilterDropdown);
    _activeColFilterDropdown = null;
  }
}

function openColFilterDropdown(column, anchorBtn, allRows) {
  // Close any open dropdown first
  if (_activeColFilterDropdown) {
    const wasThisOne = _activeColFilterDropdown.dataset.colFilterFor === column;
    closeAllColFilterDropdowns();
    if (wasThisOne) return;
  }

  // Build unique sorted values from ALL rows for this column
  const allValues = [...new Set(allRows.map((row) => String(row[column] || "")).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  const colFilters = state.columnFilters[state.activeView] || {};
  const currentSelected = new Set(colFilters[column] || allValues);
  const isAllSelected = colFilters[column] == null;

  // Create dropdown element
  const dropdown = document.createElement("div");
  dropdown.className = "col-filter-dropdown is-open";
  dropdown.dataset.colFilterFor = column;
  _activeColFilterDropdown = dropdown;
  document.body.appendChild(dropdown);

  // Sort section
  const sortSection = document.createElement("div");
  sortSection.className = "col-filter-sort-section";
  const sortAsc = document.createElement("button");
  sortAsc.type = "button";
  sortAsc.className = "col-filter-sort-btn";
  sortAsc.innerHTML = `<span class="col-filter-sort-icon">↑</span> Sort A → Z`;
  sortAsc.addEventListener("click", () => { sortBy(column); if (state.sort.direction !== "asc") sortBy(column); closeAllColFilterDropdowns(); });
  const sortDesc = document.createElement("button");
  sortDesc.type = "button";
  sortDesc.className = "col-filter-sort-btn";
  sortDesc.innerHTML = `<span class="col-filter-sort-icon">↓</span> Sort Z → A`;
  sortDesc.addEventListener("click", () => { if (state.sort.column === column && state.sort.direction === "desc") { /* already */ } else { state.sort = { column, direction: "desc" }; renderGrid(); } closeAllColFilterDropdowns(); });
  sortSection.append(sortAsc, sortDesc);
  dropdown.appendChild(sortSection);

  // Search section
  const searchSection = document.createElement("div");
  searchSection.className = "col-filter-search-section";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "col-filter-search-input";
  searchInput.placeholder = "Search values...";
  searchSection.appendChild(searchInput);
  dropdown.appendChild(searchSection);

  // Values list
  const listWrap = document.createElement("div");
  listWrap.className = "col-filter-list";
  dropdown.appendChild(listWrap);

  // Temporary selection state
  const tempSelected = new Set(isAllSelected ? allValues : (colFilters[column] || []));

  function renderValueList(query) {
    listWrap.innerHTML = "";
    const filtered = allValues.filter((v) => v.toLowerCase().includes(query.toLowerCase()));
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "col-filter-empty";
      empty.textContent = "No values found";
      listWrap.appendChild(empty);
      return;
    }
    // Select All
    const allOpt = document.createElement("label");
    allOpt.className = "col-filter-option";
    const allChk = document.createElement("input");
    allChk.type = "checkbox";
    const visibleSelected = filtered.filter((v) => tempSelected.has(v));
    allChk.checked = visibleSelected.length === filtered.length;
    allChk.indeterminate = visibleSelected.length > 0 && visibleSelected.length < filtered.length;
    const allLbl = document.createElement("span");
    allLbl.textContent = "(Select All)";
    allChk.addEventListener("change", () => {
      if (allChk.checked) filtered.forEach((v) => tempSelected.add(v));
      else filtered.forEach((v) => tempSelected.delete(v));
      renderValueList(searchInput.value);
    });
    allOpt.append(allChk, allLbl);
    listWrap.appendChild(allOpt);

    filtered.forEach((value) => {
      const label = document.createElement("label");
      label.className = "col-filter-option";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = tempSelected.has(value);
      const lbl = document.createElement("span");
      lbl.textContent = value || "(blank)";
      chk.addEventListener("change", () => {
        if (chk.checked) tempSelected.add(value);
        else tempSelected.delete(value);
        renderValueList(searchInput.value);
      });
      label.append(chk, lbl);
      listWrap.appendChild(label);
    });
  }

  renderValueList("");
  searchInput.addEventListener("input", () => renderValueList(searchInput.value));

  // Footer
  const footer = document.createElement("div");
  footer.className = "col-filter-footer";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "col-filter-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => closeAllColFilterDropdowns());
  const okBtn = document.createElement("button");
  okBtn.type = "button";
  okBtn.className = "col-filter-ok";
  okBtn.textContent = "OK";
  okBtn.addEventListener("click", () => {
    if (!state.columnFilters[state.activeView]) state.columnFilters[state.activeView] = {};
    // If all values selected, clear filter (no restriction)
    if (tempSelected.size === allValues.length) {
      delete state.columnFilters[state.activeView][column];
    } else {
      state.columnFilters[state.activeView][column] = [...tempSelected];
    }
    closeAllColFilterDropdowns();
    renderGrid();
  });
  footer.append(cancelBtn, okBtn);
  dropdown.appendChild(footer);

  // Position the dropdown under the button
  const rect = anchorBtn.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + 4}px`;
  dropdown.style.left = `${Math.min(rect.left, window.innerWidth - 250)}px`;
}

function startResize(event, column, th) {
  event.preventDefault();
  event.stopPropagation();
  const startX = event.clientX;
  const startWidth = th.offsetWidth;
  const onMove = (moveEvent) => {
    const width = Math.max(100, Math.min(430, startWidth + moveEvent.clientX - startX));
    state.columnWidths[column] = width;
    th.style.width = `${width}px`;
  };
  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    state.dirty = true;
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

function sortBy(column) {
  if (state.sort.column === column) state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
  else state.sort = { column, direction: "asc" };
  renderGrid();
}

function applyColumnOrder(columns) {
  const order = state.columnOrders[state.activeView] || [];
  return [...order.filter((column) => columns.includes(column)), ...columns.filter((column) => !order.includes(column))];
}

function moveColumn(source, target) {
  if (!source || source === target) return;
  const columns = getActiveColumns(getFilteredRows());
  const from = columns.indexOf(source);
  const to = columns.indexOf(target);
  if (from < 0 || to < 0) return;
  columns.splice(from, 1);
  columns.splice(to, 0, source);
  state.columnOrders[state.activeView] = columns;
  state.dirty = true;
  renderGrid();
}

function readField(row, fieldKey) {
  const aliases = (FIELD_ALIASES[fieldKey] || [fieldKey]).map(normalizeKey);
  const matchedKey = Object.keys(row).find((key) => aliases.includes(normalizeKey(key)));
  return matchedKey ? String(row[matchedKey] || "") : "";
}

function columnsFromRows(rows) {
  const columns = [];
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key !== "__rowId" && !columns.includes(key)) columns.push(key);
    });
  });
  return columns;
}

function mergeColumns(base, extra) {
  return [...base, ...extra.filter((column) => !base.includes(column))];
}

function ensureRowIds() {
  Object.values(state.datasets).flat().forEach((row) => {
    if (!row.__rowId) row.__rowId = crypto.randomUUID();
  });
}

function getActiveCase() {
  return state.cases.find((caseItem) => caseItem.id === state.activeCaseId);
}

function countRows(datasets) {
  return Object.values(datasets || {}).reduce((total, rows) => total + (rows?.length || 0), 0);
}

function sumValues(rows, fieldKey) {
  return rows.reduce((total, row) => {
    const value = parseNumber(readField(row, fieldKey));
    return Number.isNaN(value) ? total : total + value;
  }, 0);
}

function cleanHeader(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeKey(value) {
  return cleanHeader(value).toLowerCase().replace(/[()./_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function compareValues(a, b) {
  const numA = parseNumber(a);
  const numB = parseNumber(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
  return String(a || "").localeCompare(String(b || ""), undefined, { numeric: true, sensitivity: "base" });
}

function parseNumber(value) {
  const clean = String(value || "").replace(/[^0-9.-]/g, "");
  return clean ? Number(clean) : Number.NaN;
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function parseLooseDate(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const normalized = text.replace(/\bSept\b/i, "Sep").replace(/\./g, "-");
  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) return date;
  const match = normalized.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,})[-/ ](\d{2,4})$/);
  if (!match) return null;
  const [, day, monthName, yearText] = match;
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(monthName.slice(0, 3).toLowerCase());
  if (month < 0) return null;
  const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
  const parsed = new Date(year, month, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function csvEscape(value) {
  const text = String(value || "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toTitle(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/(^|\s|-)\w/g, (match) => match.toUpperCase())
    .replace(/-/g, " ");
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

async function loadCasesFromApi() {
  try {
    const token = readJSON(STORAGE_KEYS.session, {})?.token;
    if (!token) return null;
    const response = await fetchWithTimeout(apiUrl("/api/cases"), { method: "GET", headers: { Authorization: `Bearer ${token}` } }, 900);
    if (!response.ok) throw new Error("API unavailable");
    const payload = await response.json();
    apiOnline = true;
    return payload.cases || [];
  } catch {
    apiOnline = false;
    return null;
  }
}

async function saveCaseToApi(caseItem) {
  try {
    const token = readJSON(STORAGE_KEYS.session, {})?.token;
    if (!token) throw new Error("Missing auth token");
    const response = await fetchWithTimeout(
      apiUrl("/api/cases"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          actor: state.currentUser?.username || "auditor@mpro.com",
          case: caseItem,
        }),
      },
      1800,
    );
    if (!response.ok) throw new Error("API save failed");
    const payload = await response.json();
    apiOnline = true;
    return payload.case || null;
  } catch {
    apiOnline = false;
    return null;
  }
}

async function postApi(path, payload, timeoutMs = 2500) {
  try {
    const token = readJSON(STORAGE_KEYS.session, {})?.token;
    const response = await fetchWithTimeout(
      apiUrl(path),
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      },
      timeoutMs,
    );
    const data = await response.json().catch(() => ({}));
    apiOnline = response.ok;
    return response.ok ? { ok: true, data } : { ok: false, error: data.error };
  } catch {
    apiOnline = false;
    return { ok: false, error: "Backend API is not reachable from this deployment." };
  }
}

function sharedDatabaseError(error, fallback) {
  if (!IS_LOCAL_APP) {
    return error || "Cloud database is not connected. Add DATABASE_URL or POSTGRES_URL in Vercel, redeploy, then try again.";
  }
  return error || fallback;
}

function apiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanBase = String(API_BASE || "").replace(/\/+$/, "");
  if (!cleanBase) return cleanPath;
  if (cleanBase.endsWith("/api") && cleanPath.startsWith("/api/")) {
    return `${cleanBase}${cleanPath.slice(4)}`;
  }
  return `${cleanBase}${cleanPath}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 1000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function toast(message) {
  const toastEl = $("#toast");
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  clearTimeout(toastEl.timer);
  toastEl.timer = setTimeout(() => toastEl.classList.add("hidden"), 3600);
}
