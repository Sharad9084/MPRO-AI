const STORAGE_KEYS = {
  session: "mpro.session.v2",
  campaigns: "mpro.campaigns.v2",
  activeCampaign: "mpro.activeCampaign.v2",
  accountingFilters: "mpro.accountingFilters.v2",
  globalFilters: "mpro.globalFilters.v2",
};

const USERS = [
  {
    username: "auditor@mpro.com",
    password: "Auditor@2026",
    role: "Auditor",
    subtitle: "Invoice Reconciliation",
  },
];

const DEFAULT_COLUMNS = [
  "Campaign",
  "Agency",
  "Medium",
  "Platform",
  "Region",
  "Goal",
  "Budget",
  "Invoice Number",
  "PR No",
  "Invoice Date",
  "PO Number",
  "Expense Of Monitoring",
  "Campaign Type",
  "Campaign Manager",
  "Proof Of Performance",
  "Program Manager",
  "Amount",
  "Status",
];

const FILTER_DEFS = [
  { key: "budget", label: "Budget" },
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "prNo", label: "PR No" },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "poNumber", label: "PO Number" },
  { key: "expenseOfMonitoring", label: "Expense Of Monitoring" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "campaignManager", label: "Campaign Manager" },
  { key: "proofOfPerformance", label: "Proof Of Performance" },
  { key: "programManager", label: "Program Manager" },
];

const FIELD_ALIASES = {
  campaign: ["campaign", "campaign name", "campaing", "campaning", "campane"],
  agency: ["agency", "agency name"],
  medium: ["medium", "media"],
  platform: ["platform", "publisher"],
  region: ["region", "zone", "market"],
  goal: ["goal", "goals", "objective"],
  budget: ["budget", "approved budget", "total budget"],
  invoiceNumber: ["invoice number", "invoice no", "invoice #", "invoice"],
  prNo: ["pr no", "pr number", "pr"],
  invoiceDate: ["invoice date", "date"],
  poNumber: ["po number", "po no", "po"],
  expenseOfMonitoring: ["expense of monitoring", "monitoring expense", "monitoring"],
  campaignType: ["campaign type", "campane type", "type"],
  campaignManager: ["campaign manager", "campane manager", "manager"],
  proofOfPerformance: ["proof of performance", "proove of performance", "pop"],
  programManager: ["program manager"],
};

const SAMPLE_ROWS = [
  {
    Campaign: "MPRO Awareness May",
    Agency: "North Star Media",
    Medium: "Digital",
    Platform: "Meta",
    Region: "North",
    Goal: "Awareness",
    Budget: "450000",
    "Invoice Number": "INV-1001",
    "PR No": "PR-7781",
    "Invoice Date": "2026-05-01",
    "PO Number": "PO-5510",
    "Expense Of Monitoring": "Brand safety audit",
    "Campaign Type": "Always-on",
    "Campaign Manager": "Riya Sharma",
    "Proof Of Performance": "Received",
    "Program Manager": "Aman Verma",
    Amount: "392500",
    Status: "Pending",
  },
  {
    Campaign: "MPRO Awareness May",
    Agency: "ReachWorks",
    Medium: "OOH",
    Platform: "Billboard",
    Region: "West",
    Goal: "Reach",
    Budget: "320000",
    "Invoice Number": "INV-1002",
    "PR No": "PR-7782",
    "Invoice Date": "2026-05-03",
    "PO Number": "PO-5511",
    "Expense Of Monitoring": "Site verification",
    "Campaign Type": "Launch",
    "Campaign Manager": "Karan Mehta",
    "Proof Of Performance": "Pending",
    "Program Manager": "Aman Verma",
    Amount: "281000",
    Status: "Review",
  },
  {
    Campaign: "Summer Retail Push",
    Agency: "MarketPulse",
    Medium: "Search",
    Platform: "Google",
    Region: "South",
    Goal: "Leads",
    Budget: "510000",
    "Invoice Number": "INV-1003",
    "PR No": "PR-7790",
    "Invoice Date": "2026-05-07",
    "PO Number": "PO-5523",
    "Expense Of Monitoring": "Keyword monitoring",
    "Campaign Type": "Performance",
    "Campaign Manager": "Neha Rao",
    "Proof Of Performance": "Received",
    "Program Manager": "Sameer Khan",
    Amount: "486200",
    Status: "Approved",
  },
];

const state = {
  currentUser: null,
  activeModule: "accounting",
  campaigns: [],
  activeCampaignId: null,
  rows: [],
  columns: [...DEFAULT_COLUMNS],
  columnWidths: {},
  sort: { column: null, direction: "asc" },
  globalFilters: {},
  accountingFilters: {},
  dirty: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  bindEvents();
  restoreSession();
});

function loadState() {
  state.campaigns = readJSON(STORAGE_KEYS.campaigns, []);
  state.activeCampaignId = localStorage.getItem(STORAGE_KEYS.activeCampaign);
  state.globalFilters = readJSON(STORAGE_KEYS.globalFilters, {});
  state.accountingFilters = readJSON(STORAGE_KEYS.accountingFilters, {});
  const active = getActiveCampaign();
  if (active) hydrateCampaign(active);
}

function bindEvents() {
  $("#launch-button").addEventListener("click", showRoleScreen);
  $("#close-role").addEventListener("click", showEntry);
  $("#auditor-role").addEventListener("click", showLogin);
  $$(".disabled-role").forEach((button) => button.addEventListener("click", () => toast("Abhi Auditor use case active hai. Ye role next phase mein add hoga.")));
  $("#back-to-roles").addEventListener("click", showRoleScreen);
  $("#close-login").addEventListener("click", showEntry);
  $("#login-form").addEventListener("submit", handleLogin);
  $("#signout-button").addEventListener("click", signOut);
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchModule(button.dataset.module)));
  $$("#app-shell [data-global-filter]").forEach((select) => select.addEventListener("change", handleGlobalFilter));
  $("#reset-global-filters").addEventListener("click", resetGlobalFilters);
  $("#collapse-filters").addEventListener("click", () => setFiltersCollapsed(true));
  $("#expand-filters").addEventListener("click", () => setFiltersCollapsed(false));
  $("#new-campaign-button").addEventListener("click", startNewCampaign);
  $("#existing-campaign-button").addEventListener("click", showExistingCampaigns);
  $("#file-input").addEventListener("change", handleFileImport);
  $("#load-sample").addEventListener("click", loadSample);
  $("#add-row").addEventListener("click", addRow);
  $("#export-csv").addEventListener("click", exportCsv);
  $("#save-campaign").addEventListener("click", saveCampaign);
  $("#clear-accounting-filters").addEventListener("click", clearAccountingFilters);
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
  $("#username").focus();
}

function showApp() {
  $("#entry-screen").classList.add("hidden");
  $("#role-screen").classList.add("hidden");
  $("#login-screen").classList.add("hidden");
  $("#app-shell").classList.remove("hidden");
  $("#signed-in-user").textContent = `${state.currentUser.role} - ${state.currentUser.username}`;
  switchModule(state.activeModule);
  renderAllFilters();
  renderGrid();
}

function handleLogin(event) {
  event.preventDefault();
  const username = $("#username").value.trim().toLowerCase();
  const password = $("#password").value;
  const user = USERS.find((item) => item.username.toLowerCase() === username && item.password === password);
  if (!user) {
    $("#auth-error").textContent = "Auditor username ya password galat hai.";
    return;
  }
  state.currentUser = { username: user.username, role: user.role, subtitle: user.subtitle };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ user: state.currentUser, expiresAt: Date.now() + 30 * 60 * 1000 }));
  showApp();
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

function signOut() {
  if (state.dirty) saveCampaign();
  localStorage.removeItem(STORAGE_KEYS.session);
  state.currentUser = null;
  showEntry();
}

function switchModule(moduleName) {
  state.activeModule = moduleName;
  $("#active-module-label").textContent = toTitle(moduleName);
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.module === moduleName));
  const isAccounting = moduleName === "accounting";
  $("#accounting-module").classList.toggle("hidden", !isAccounting);
  $("#module-placeholder").classList.toggle("hidden", isAccounting);
  if (!isAccounting) {
    $("#module-placeholder").innerHTML = `<div class="placeholder-panel"><h1>${escapeHTML(toTitle(moduleName))}</h1><p>Ye section next phase mein Auditor workflow se connect hoga.</p></div>`;
  }
}

function setFiltersCollapsed(collapsed) {
  $("#accounting-filters").classList.toggle("hidden", collapsed);
  $("#expand-filters").classList.toggle("hidden", !collapsed);
}

function startNewCampaign() {
  state.activeCampaignId = null;
  state.rows = [];
  state.columns = [...DEFAULT_COLUMNS];
  state.columnWidths = {};
  state.sort = { column: null, direction: "asc" };
  state.accountingFilters = {};
  state.globalFilters = {};
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  $("#existing-list").classList.add("hidden");
  $("#campaign-name").value = "";
  $("#file-input").value = "";
  renderAllFilters();
  renderGrid();
}

function showExistingCampaigns() {
  $("#campaign-choice").classList.add("hidden");
  $("#campaign-panel").classList.remove("hidden");
  const list = $("#existing-list");
  list.classList.remove("hidden");
  if (!state.campaigns.length) {
    list.innerHTML = `<div class="existing-card"><strong>No saved campaigns</strong><span>Sample ya Excel upload karke pehla campaign save karein.</span></div>`;
    return;
  }
  list.innerHTML = "";
  state.campaigns.forEach((campaign) => {
    const button = document.createElement("button");
    button.className = "existing-card";
    button.type = "button";
    button.innerHTML = `<strong>${escapeHTML(campaign.name)}</strong><span>${campaign.rows.length} records - ${formatDateTime(campaign.updatedAt)}</span>`;
    button.addEventListener("click", () => loadCampaign(campaign.id));
    list.appendChild(button);
  });
}

function loadCampaign(id) {
  const campaign = state.campaigns.find((item) => item.id === id);
  if (!campaign) return;
  state.activeCampaignId = id;
  localStorage.setItem(STORAGE_KEYS.activeCampaign, id);
  hydrateCampaign(campaign);
  $("#campaign-name").value = campaign.name;
  $("#existing-list").classList.add("hidden");
  renderAllFilters();
  renderGrid();
  toast("Campaign loaded.");
}

function hydrateCampaign(campaign) {
  state.rows = campaign.rows || [];
  state.columns = campaign.columns?.length ? campaign.columns : columnsFromRows(state.rows);
  state.columnWidths = campaign.columnWidths || {};
  state.sort = campaign.sort || { column: null, direction: "asc" };
}

async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = await parseWorkbook(file);
    state.columns = parsed.columns.length ? parsed.columns : [...DEFAULT_COLUMNS];
    state.rows = parsed.rows;
    state.accountingFilters = {};
    state.globalFilters = {};
    if (!$("#campaign-name").value.trim()) $("#campaign-name").value = file.name.replace(/\.[^.]+$/, "");
    state.dirty = true;
    renderAllFilters();
    renderGrid();
    toast(`${parsed.rows.length} rows imported. Filters Excel values se update ho gaye.`);
  } catch (error) {
    toast(error.message || "File import failed.");
  }
}

async function parseWorkbook(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".tsv")) {
    const text = await file.text();
    return parseDelimited(text, name.endsWith(".tsv") ? "\t" : ",");
  }
  if (!window.XLSX) throw new Error("XLSX parser load nahi hua. CSV use karein ya internet on karke reload karein.");
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return normalizeRows(XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }));
}

function parseDelimited(text, delimiter) {
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
  const dataRows = body.map((items) => {
    const entry = {};
    columns.forEach((column, index) => {
      entry[column] = items[index] || "";
    });
    return entry;
  });
  return normalizeRows(dataRows);
}

function normalizeRows(rows) {
  const cleanedRows = rows.map((row) => {
    const clean = {};
    Object.entries(row).forEach(([key, value]) => {
      clean[cleanHeader(key)] = value == null ? "" : String(value).trim();
    });
    return clean;
  });
  const columns = mergeColumns(DEFAULT_COLUMNS, columnsFromRows(cleanedRows));
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
  state.columns = [...DEFAULT_COLUMNS];
  state.rows = SAMPLE_ROWS.map((row) => ({ ...row }));
  state.accountingFilters = {};
  state.globalFilters = {};
  if (!$("#campaign-name").value.trim()) $("#campaign-name").value = "MPRO Auditor Sample";
  state.dirty = true;
  renderAllFilters();
  renderGrid();
  toast("Sample loaded. Dropdown filters sample data se ban gaye.");
}

function addRow() {
  if (!state.columns.length) state.columns = [...DEFAULT_COLUMNS];
  const row = {};
  state.columns.forEach((column) => {
    row[column] = "";
  });
  state.rows.push(row);
  state.dirty = true;
  renderAllFilters();
  renderGrid();
}

function saveCampaign() {
  const name = $("#campaign-name").value.trim() || "Untitled auditor campaign";
  const cleanRows = state.rows.map((row) => {
    const clean = {};
    state.columns.forEach((column) => {
      clean[column] = row[column] || "";
    });
    return clean;
  });
  const campaign = {
    id: state.activeCampaignId || crypto.randomUUID(),
    name,
    rows: cleanRows,
    columns: state.columns,
    columnWidths: state.columnWidths,
    sort: state.sort,
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = state.campaigns.findIndex((item) => item.id === campaign.id);
  if (existingIndex >= 0) state.campaigns[existingIndex] = campaign;
  else state.campaigns.unshift(campaign);
  state.activeCampaignId = campaign.id;
  localStorage.setItem(STORAGE_KEYS.activeCampaign, campaign.id);
  localStorage.setItem(STORAGE_KEYS.campaigns, JSON.stringify(state.campaigns));
  state.dirty = false;
  $("#save-status").textContent = `Saved ${formatDateTime(campaign.updatedAt)}`;
  toast("Campaign saved.");
}

function exportCsv() {
  const rows = getFilteredRows();
  const lines = [state.columns.map(csvEscape).join(",")];
  rows.forEach((row) => lines.push(state.columns.map((column) => csvEscape(row[column] || "")).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${($("#campaign-name").value.trim() || "mpro-auditor-accounting").replace(/\s+/g, "-").toLowerCase()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderAllFilters() {
  renderGlobalFilters();
  renderAccountingFilters();
}

function renderGlobalFilters() {
  ["campaign", "agency", "medium", "platform", "region", "goal"].forEach((key) => {
    const select = $(`[data-global-filter="${key}"]`);
    fillSelectFromRows(select, key, state.globalFilters[key]);
  });
  localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
}

function renderAccountingFilters() {
  const form = $("#accounting-filter-form");
  form.innerHTML = "";
  FILTER_DEFS.forEach((def) => {
    const label = document.createElement("label");
    label.textContent = def.label;
    const select = document.createElement("select");
    select.dataset.accountFilter = def.key;
    const values = uniqueValues(state.rows.map((row) => readField(row, def.key))).filter(Boolean);
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

function fillSelectFromRows(select, key, current) {
  const values = uniqueValues(state.rows.map((row) => readField(row, key))).filter(Boolean);
  select.innerHTML = `<option value="">All</option>${values.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("")}`;
  select.value = values.includes(current) ? current : "";
  if (!select.value) delete state.globalFilters[key];
}

function handleGlobalFilter(event) {
  const key = event.target.dataset.globalFilter;
  state.globalFilters[key] = event.target.value;
  localStorage.setItem(STORAGE_KEYS.globalFilters, JSON.stringify(state.globalFilters));
  renderGrid();
}

function resetGlobalFilters() {
  state.globalFilters = {};
  localStorage.removeItem(STORAGE_KEYS.globalFilters);
  renderAllFilters();
  renderGrid();
}

function handleAccountingFilter(event) {
  state.accountingFilters[event.target.dataset.accountFilter] = event.target.value;
  localStorage.setItem(STORAGE_KEYS.accountingFilters, JSON.stringify(state.accountingFilters));
  renderGrid();
}

function clearAccountingFilters() {
  state.accountingFilters = {};
  localStorage.removeItem(STORAGE_KEYS.accountingFilters);
  renderAccountingFilters();
  renderGrid();
}

function renderGrid() {
  ensureRowIds();
  const table = $("#invoice-grid");
  const rows = getFilteredRows();
  $("#record-count").textContent = `${rows.length} of ${state.rows.length} records`;
  $("#save-status").textContent = state.dirty ? "Unsaved changes" : state.activeCampaignId ? "Saved" : "Not saved";
  table.innerHTML = "";
  if (!state.columns.length) return;

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.appendChild(makeHeaderCell("#", "row-index"));
  state.columns.forEach((column) => headRow.appendChild(makeColumnHeader(column)));
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
    state.columns.forEach((column) => {
      const td = document.createElement("td");
      td.style.width = `${state.columnWidths[column] || 160}px`;
      const input = document.createElement("input");
      input.value = row[column] || "";
      input.addEventListener("input", () => {
        row[column] = input.value;
        state.dirty = true;
        $("#save-status").textContent = "Unsaved changes";
      });
      input.addEventListener("blur", renderAllFilters);
      td.appendChild(input);
      tr.appendChild(td);
    });
    const deleteCell = document.createElement("td");
    deleteCell.className = "delete-col";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-row";
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", () => {
      state.rows = state.rows.filter((item) => item.__rowId !== row.__rowId);
      state.dirty = true;
      renderAllFilters();
      renderGrid();
    });
    deleteCell.appendChild(deleteButton);
    tr.appendChild(deleteCell);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
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
    document.querySelectorAll(`#invoice-grid td:nth-child(${state.columns.indexOf(column) + 2})`).forEach((td) => {
      td.style.width = `${width}px`;
    });
  };
  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    state.dirty = true;
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

function moveColumn(source, target) {
  if (!source || source === target) return;
  const from = state.columns.indexOf(source);
  const to = state.columns.indexOf(target);
  if (from < 0 || to < 0) return;
  state.columns.splice(from, 1);
  state.columns.splice(to, 0, source);
  state.dirty = true;
  renderGrid();
}

function sortBy(column) {
  if (state.sort.column === column) state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
  else state.sort = { column, direction: "asc" };
  renderGrid();
}

function getFilteredRows() {
  let rows = [...state.rows];
  rows = rows.filter(matchesGlobalFilters).filter(matchesAccountingFilters);
  if (state.sort.column) {
    const direction = state.sort.direction === "asc" ? 1 : -1;
    rows.sort((a, b) => compareValues(a[state.sort.column], b[state.sort.column]) * direction);
  }
  return rows;
}

function matchesGlobalFilters(row) {
  return Object.entries(state.globalFilters).every(([key, selected]) => !selected || readField(row, key).toLowerCase() === selected.toLowerCase());
}

function matchesAccountingFilters(row) {
  return Object.entries(state.accountingFilters).every(([key, selected]) => !selected || readField(row, key).toLowerCase() === selected.toLowerCase());
}

function readField(row, fieldKey) {
  const aliases = FIELD_ALIASES[fieldKey] || [fieldKey];
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
  return columns.length ? columns : [...DEFAULT_COLUMNS];
}

function mergeColumns(base, extra) {
  return [...base, ...extra.filter((column) => !base.includes(column))];
}

function ensureRowIds() {
  state.rows.forEach((row) => {
    if (!row.__rowId) row.__rowId = crypto.randomUUID();
  });
}

function getActiveCampaign() {
  return state.campaigns.find((campaign) => campaign.id === state.activeCampaignId);
}

function cleanHeader(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeKey(value) {
  return cleanHeader(value).toLowerCase();
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
  toastEl.timer = setTimeout(() => toastEl.classList.add("hidden"), 3200);
}
