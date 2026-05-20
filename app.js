const STORAGE_KEYS = {
  session: "mpro.session.v3",
  cases: "mpro.reconciliation.cases.v1",
  activeCase: "mpro.activeCase.v1",
  accountingFilters: "mpro.accountingFilters.v3",
  globalFilters: "mpro.globalFilters.v3",
  localUsers: "mpro.localUsers.v1",
};

const LOCAL_API_BASE = "http://127.0.0.1:8787";
const configuredApiBase = window.TAG_MPRO_API_BASE || localStorage.getItem("mpro.apiBase") || "";
const API_BASE = configuredApiBase || (["", "localhost", "127.0.0.1"].includes(window.location.hostname) ? LOCAL_API_BASE : "/api");
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
    label: "Program / Campaign",
    columns: [
      "Source",
      "Campaign ID",
      "Campaign Name",
      "Budget",
      "Program Manager",
      "Brand",
      "Advertiser Name",
      "Status",
    ],
  },
  pr: {
    label: "PR",
    columns: [
      "Source",
      "PR Number",
      "PR Date",
      "PR Description",
      "Vendor Name",
      "Brand Name",
      "Campaign Name",
      "Campaign ID",
      "PR Amount",
      "Status",
    ],
  },
  po: {
    label: "PO",
    inputId: "po-input",
    columns: [
      "Source",
      "Campaign ID",
      "Campaign Name",
      "PR Number",
      "Advertiser Name",
      "PO Number",
      "PO Date",
      "Agency Name",
      "Brand",
      "PO Amount Incl Tax",
      "File Name",
      "Status",
    ],
  },
  mediaSchedule: {
    label: "Media Schedule",
    inputId: "media-schedule-input",
    columns: [
      "Source",
      "Campaign ID",
      "Campaign Name",
      "PR Number",
      "PO Number",
      "Advertiser Name",
      "Agency Name",
      "Brand",
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
    inputId: "agency-input",
    columns: [
      "Source",
      "Agency Name",
      "Advertiser Name",
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
    label: "3rd Party Invoice",
    inputId: "third-party-invoice-input",
    columns: [
      "Source",
      "Media Type",
      "Advertiser Name",
      "Third Party Vendor Name",
      "Agency Name",
      "Channel Name",
      "Billing Period",
      "PR Number",
      "PO Number",
      "Invoice Number",
      "Invoice Date",
      "Campaign ID",
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
    inputId: "third-party-monitoring-input",
    columns: [
      "Source",
      "Media Type",
      "Advertiser Name",
      "Agency Name",
      "Third Party Vendor Name",
      "Channel Name",
      "Brand",
      "Campaign ID",
      "Campaign Name",
      "Program",
      "Date",
      "Day",
      "Air Time",
      "Duration Sec",
      "Spot Copy Caption",
      "Monitoring Status",
      "File Name",
      "Status",
    ],
  },
};

const GLOBAL_FILTERS = [
  "advertiser",
  "agency",
  "brand",
  "campaign",
  "prNumber",
  "poNumber",
  "invoiceNumber",
  "vendor",
  "channel",
  "status",
];

const FILTER_DEFS = [
  { key: "source", label: "Source" },
  { key: "advertiser", label: "Advertiser" },
  { key: "agency", label: "Agency" },
  { key: "brand", label: "Brand" },
  { key: "campaign", label: "Campaign" },
  { key: "campaignId", label: "Campaign ID" },
  { key: "prNumber", label: "PR Number" },
  { key: "poNumber", label: "PO Number" },
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "vendor", label: "Vendor" },
  { key: "channel", label: "Channel" },
  { key: "program", label: "Program" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
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
  programManager: ["program manager", "campaign manager", "manager"],
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
  program: ["program"],
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
  monitoringStatus: ["monitoring status", "status"],
  status: ["reconciliation status", "status", "match status"],
  fileName: ["file name", "filename"],
};

const HELP_CONTENT = {
  mediaSchedule: {
    title: "Media Schedule",
    lines: ["Supported: CSV, TSV, XLS, XLSX, PDF", "Recommended size: under 20 MB", "Use this for planned spots, dates, channels and schedule amount."],
  },
  agency: {
    title: "Agency Invoice",
    lines: ["Supported: CSV, TSV, XLS, XLSX, PDF", "Recommended size: under 20 MB", "Upload agency invoice with PO/PR/campaign references."],
  },
  thirdPartyInvoice: {
    title: "3rd Party Invoice",
    lines: ["Supported: CSV, TSV, XLS, XLSX, PDF", "TV: upload broadcaster invoice", "Print: upload publisher invoice", "Other: 3rd party vendor invoice"],
  },
  thirdPartyMonitoring: {
    title: "3rd Party Monitoring Report",
    lines: ["Supported: CSV, TSV, XLS, XLSX, PDF", "TV: AdEx or BARC report", "Print: tear sheet copies", "Digital: platform or 3rd party monitoring and DCM report"],
  },
  po: {
    title: "PO",
    lines: ["Supported: CSV, TSV, XLS, XLSX, PDF", "Recommended size: under 20 MB", "Upload purchase order extract or PO PDF."],
  },
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
  activeView: "reconciliation",
  datasets: emptyDatasets(),
  columnOrders: {},
  columnWidths: {},
  hiddenColumns: {},
  sort: { column: null, direction: "asc" },
  globalFilters: {},
  accountingFilters: {},
  searchQuery: "",
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
  state.globalFilters = readJSON(STORAGE_KEYS.globalFilters, {});
  state.accountingFilters = readJSON(STORAGE_KEYS.accountingFilters, {});
  const active = getActiveCase();
  if (active) hydrateCase(active);
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
  $$("#app-shell [data-global-filter]").forEach((select) => select.addEventListener("change", handleGlobalFilter));
  $$(".source-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$("[data-import-source]").forEach((button) => button.addEventListener("click", () => importSourceFiles(button.dataset.importSource)));
  $$(".help-dot").forEach((button) => button.addEventListener("click", () => showUploadHelp(button.dataset.help)));
  $("#reset-global-filters").addEventListener("click", resetGlobalFilters);
  $("#collapse-filters").addEventListener("click", () => setFiltersCollapsed(true));
  $("#expand-filters").addEventListener("click", () => setFiltersCollapsed(false));
  $("#new-campaign-button").addEventListener("click", startNewCase);
  $("#existing-campaign-button").addEventListener("click", showExistingCases);
  $("#load-sample").addEventListener("click", loadSample);
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
  $("#signed-in-user").textContent = `${state.currentUser.role} - ${state.currentUser.username}`;
  switchModule(state.activeModule);
  renderAll();
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
    const localSignin = await signInWithLocalAccount(username, password);
    if (localSignin) return;
    $("#auth-error").textContent = result.error || "Sign in failed. Check the configured API connection or create a local account.";
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
    displayName: "TAG-mPRO Auditor",
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
  state.activeView = "reconciliation";
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  $("#existing-list").classList.add("hidden");
  $("#campaign-name").value = "";
  Object.values(SOURCE_CONFIG).forEach((config) => {
    const input = $(`#${config.inputId}`);
    if (input) input.value = "";
  });
  renderAll();
}

function showExistingCases() {
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  const list = $("#existing-list");
  list.classList.remove("hidden");
  if (!state.cases.length) {
    list.innerHTML = `<div class="existing-card"><strong>No saved reconciliations</strong><span>Load sample data or upload files, then save your first case.</span></div>`;
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
  state.activeView = caseItem.activeView || "reconciliation";
}

async function importSourceFiles(sourceKey) {
  const config = SOURCE_CONFIG[sourceKey];
  const input = $(`#${config.inputId}`);
  const files = Array.from(input.files || []);
  if (!files.length) {
    toast(`Select a file for ${config.label}.`);
    return;
  }

  try {
    const imported = [];
    for (const file of files) {
      const parsed = await parseFileForSource(file, sourceKey);
      imported.push(...parsed.rows);
    }
    state.datasets[sourceKey] = ["thirdPartyInvoice", "thirdPartyMonitoring"].includes(sourceKey) ? [...state.datasets[sourceKey], ...imported] : imported;
    deriveProgramAndPrRows();
    state.accountingFilters = {};
    state.globalFilters = {};
    state.searchQuery = "";
    $("#table-search").value = "";
    state.activeView = sourceKey;
    if (!$("#campaign-name").value.trim()) $("#campaign-name").value = "Invoice reconciliation";
    state.dirty = true;
    renderAll();
    toast(`${imported.length} rows imported into ${config.label}.`);
  } catch (error) {
    toast(error.message || "Import failed.");
  }
}

async function parseFileForSource(file, sourceKey) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    return makePdfPlaceholderRows(file, sourceKey);
  }
  if (name.endsWith(".csv") || name.endsWith(".tsv")) {
    const text = await file.text();
    return normalizeRows(parseDelimitedRows(text, name.endsWith(".tsv") ? "\t" : ","), sourceKey, file.name);
  }
  if (!window.XLSX) throw new Error("The XLSX parser did not load. Use CSV or reload with an internet connection.");
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return normalizeRows(XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }), sourceKey, file.name);
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
  state.activeView = "reconciliation";
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
  toast(apiOnline ? "Reconciliation saved to the database." : "Reconciliation saved in this browser.");
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
  const reconciliationRows = buildReconciliationRows();
  const cards = [
    ["Programs", state.datasets.program.length],
    ["PR", state.datasets.pr.length],
    ["PO", state.datasets.po.length],
    ["Schedule", state.datasets.mediaSchedule.length],
    ["Agency", state.datasets.agency.length],
    ["3rd Party", state.datasets.thirdPartyInvoice.length],
    ["Monitoring", state.datasets.thirdPartyMonitoring.length],
    ["Review Items", reconciliationRows.filter((row) => row["Reconciliation Status"] !== "Matched").length],
  ];
  summary.innerHTML = cards.map(([label, count]) => `<div><strong>${count}</strong><span>${label}</span></div>`).join("");
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
    const select = $(`[data-global-filter="${key}"]`);
    fillSelectFromRows(select, rows, key, state.globalFilters[key]);
  });
  updateGlobalFilterCount();
  localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
}

function renderAccountingFilters() {
  const form = $("#accounting-filter-form");
  const rows = allRowsWithReconciliation();
  form.innerHTML = "";
  FILTER_DEFS.forEach((def) => {
    const label = document.createElement("label");
    label.textContent = def.label;
    const select = document.createElement("select");
    select.dataset.accountFilter = def.key;
    const values = uniqueValues(rows.map((row) => readField(row, def.key))).filter(Boolean);
    if (!values.length) {
      select.innerHTML = `<option value="">Column not found yet</option>`;
      select.disabled = true;
    } else {
      select.innerHTML = `<option value="">All</option>${values.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("")}`;
      select.value = values.includes(state.accountingFilters[def.key]) ? state.accountingFilters[def.key] : "";
      if (!select.value) delete state.accountingFilters[def.key];
    }
    select.addEventListener("change", handleAccountingFilter);
    label.appendChild(select);
    form.appendChild(label);
  });
  localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
}

function renderFilterChips() {
  const chipBar = $("#active-filter-chips");
  if (!chipBar) return;
  const chips = [];
  Object.entries(state.globalFilters).forEach(([key, value]) => {
    if (value) chips.push({ type: "global", key, label: toTitle(key), value });
  });
  Object.entries(state.accountingFilters).forEach(([key, value]) => {
    if (value) chips.push({ type: "accounting", key, label: toTitle(key), value });
  });
  if (state.searchQuery) chips.push({ type: "search", key: "search", label: "Search", value: state.searchQuery });

  if (!chips.length) {
    chipBar.innerHTML = `<span class="empty-chip">No active filters</span>`;
    updateGlobalFilterCount();
    return;
  }

  chipBar.innerHTML = chips.map((chip) => (
    `<button class="filter-chip" type="button" data-filter-type="${chip.type}" data-filter-key="${chip.key}">
      <span>${escapeHTML(chip.label)}: ${escapeHTML(chip.value)}</span><b>x</b>
    </button>`
  )).join("");
  chipBar.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => clearFilterChip(button.dataset.filterType, button.dataset.filterKey));
  });
  updateGlobalFilterCount();
}

function updateGlobalFilterCount() {
  const counter = $("#global-filter-count");
  if (!counter) return;
  const count = Object.values(state.globalFilters).filter(Boolean).length;
  counter.textContent = count ? `${count} active` : "All records";
}

function clearFilterChip(type, key) {
  if (type === "global") {
    delete state.globalFilters[key];
    localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
  } else if (type === "accounting") {
    delete state.accountingFilters[key];
    localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
  } else if (type === "search") {
    state.searchQuery = "";
    $("#table-search").value = "";
  }
  renderAll();
}

function fillSelectFromRows(select, rows, key, current) {
  const values = uniqueValues(rows.map((row) => readField(row, key))).filter(Boolean);
  select.innerHTML = `<option value="">All</option>${values.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("")}`;
  select.value = values.includes(current) ? current : "";
  if (!select.value) delete state.globalFilters[key];
}

function handleGlobalFilter(event) {
  const key = event.target.dataset.globalFilter;
  state.globalFilters[key] = event.target.value;
  if (!state.globalFilters[key]) delete state.globalFilters[key];
  localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
  renderFilterChips();
  renderGrid();
}

function resetGlobalFilters() {
  state.globalFilters = {};
  localStorage.removeItem(STORAGE_KEYS.globalFilters);
  renderAll();
}

function handleAccountingFilter(event) {
  state.accountingFilters[event.target.dataset.accountFilter] = event.target.value;
  if (!state.accountingFilters[event.target.dataset.accountFilter]) delete state.accountingFilters[event.target.dataset.accountFilter];
  localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
  renderFilterChips();
  renderGrid();
}

function clearAccountingFilters() {
  state.accountingFilters = {};
  localStorage.removeItem(STORAGE_KEYS.accountingFilters);
  renderAccountingFilters();
  renderFilterChips();
  renderGrid();
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
        tr.appendChild(td);
        return;
      }
      const input = document.createElement("input");
      input.value = row[column] || "";
      input.addEventListener("input", () => {
        row[column] = input.value;
        state.dirty = true;
        $("#save-status").textContent = "Unsaved changes";
      });
      input.addEventListener("blur", () => {
        if (!["program", "pr"].includes(state.activeView)) deriveProgramAndPrRows({ overwrite: false });
        renderAll();
      });
      td.appendChild(input);
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

function getFilteredRows() {
  let rows = [...getActiveRows()];
  rows = rows.filter(matchesGlobalFilters).filter(matchesAccountingFilters);
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
      "PR Number",
      "PO Number",
      "Advertiser Name",
      "Agency Name",
      "Brand",
      "Program Budget",
      "PR Amount",
      "PO Amount Incl Tax",
      "Media Schedule Amount",
      "Agency Total Value",
      "3rd Party Invoice Amount",
      "Program Budget Balance",
      "PR Budget Balance",
      "Agency Rows",
      "3rd Party Invoice Rows",
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
  return Object.values(state.datasets).flat();
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
        Budget: String(sumValues(related, "budget") || sumValues(related, "prAmount") || sumValues(related, "poAmount") || sumValues(related, "totalValue") || ""),
        "Program Manager": readField(row, "programManager"),
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
    if (!thirdPartyRows.length) issues.push("3rd party invoice missing");
    if (thirdPartyRows.length && !monitoringRows.length) issues.push("Monitoring missing");
    if (programBudget && prAmount && prAmount > programBudget) issues.push("PR amount exceeds program budget");
    if (prAmount && poAmount && poAmount > prAmount) issues.push("PO amount exceeds PR amount");
    if (poAmount && agencyAmount && Math.abs(poAmount - agencyAmount) > 1) issues.push("PO vs agency amount mismatch");
    if (scheduleAmount && thirdPartyAmount && Math.abs(scheduleAmount - thirdPartyAmount) > Math.max(1, scheduleAmount * 0.02)) issues.push("Schedule vs 3rd party invoice amount review");
    if (agencyAmount && thirdPartyAmount && Math.abs(agencyAmount - thirdPartyAmount) > Math.max(1, agencyAmount * 0.02)) issues.push("Agency vs 3rd party invoice amount review");

    return {
      "Reconciliation Status": issues.length ? "Needs Review" : "Matched",
      Issues: issues.join("; ") || "Matched",
      "Campaign ID": campaignId,
      "Campaign Name": campaignName,
      "PR Number": readField(first, "prNumber") || linkedPrNumber,
      "PO Number": poNumber,
      "Advertiser Name": readField(first, "advertiser"),
      "Agency Name": readField(first, "agency"),
      Brand: readField(first, "brand"),
      "Program Budget": programBudget ? String(programBudget) : "",
      "PR Amount": prAmount ? String(prAmount) : "",
      "PO Amount Incl Tax": poAmount ? String(poAmount) : "",
      "Media Schedule Amount": scheduleAmount ? String(scheduleAmount) : "",
      "Agency Total Value": agencyAmount ? String(agencyAmount) : "",
      "3rd Party Invoice Amount": thirdPartyAmount ? String(thirdPartyAmount) : "",
      "Program Budget Balance": programBudget ? String(programBudget - prAmount) : "",
      "PR Budget Balance": prAmount ? String(prAmount - poAmount) : "",
      "Agency Rows": String(agencyRows.length),
      "3rd Party Invoice Rows": String(thirdPartyRows.length),
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
  return Object.entries(state.globalFilters).every(([key, selected]) => !selected || readField(row, key).toLowerCase() === selected.toLowerCase());
}

function matchesAccountingFilters(row) {
  return Object.entries(state.accountingFilters).every(([key, selected]) => !selected || readField(row, key).toLowerCase() === selected.toLowerCase());
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
  const sortMark = document.createElement("span");
  sortMark.textContent = state.sort.column === column ? (state.sort.direction === "asc" ? "^" : "v") : "";
  const handle = document.createElement("span");
  handle.className = "resize-handle";
  inner.append(title, sortMark, handle);
  th.appendChild(inner);
  th.addEventListener("click", (event) => {
    if (event.target === handle) return;
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

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function csvEscape(value) {
  const text = String(value || "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toTitle(value) {
  return String(value).replace(/(^|\s|-)\w/g, (match) => match.toUpperCase()).replace(/-/g, " ");
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
    if (!API_BASE) return null;
    const token = readJSON(STORAGE_KEYS.session, {})?.token;
    if (!token) return null;
    const response = await fetchWithTimeout(`${API_BASE}/api/cases`, { method: "GET", headers: { Authorization: `Bearer ${token}` } }, 900);
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
    if (!API_BASE) throw new Error("API not configured");
    const token = readJSON(STORAGE_KEYS.session, {})?.token;
    if (!token) throw new Error("Missing auth token");
    const response = await fetchWithTimeout(
      `${API_BASE}/api/cases`,
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

async function postApi(path, payload) {
  try {
    if (!API_BASE) {
      apiOnline = false;
      return { ok: false, error: "Backend API is not configured for this deployment." };
    }
    const token = readJSON(STORAGE_KEYS.session, {})?.token;
    const response = await fetchWithTimeout(
      `${API_BASE}${path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      },
      2500,
    );
    const data = await response.json().catch(() => ({}));
    apiOnline = response.ok;
    return response.ok ? { ok: true, data } : { ok: false, error: data.error };
  } catch {
    apiOnline = false;
    return { ok: false, error: "Backend API is not reachable from this deployment." };
  }
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
