import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Database,
  Download,
  Edit3,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import { toast } from "../utils/notifications.js";
import { api } from "../api/client.js";

const PAGE_SIZE = 25;

const formatCell = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  const str = String(value);
  return str.length > 60 ? `${str.slice(0, 60)}…` : str;
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function DatabaseManager() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTable, setActiveTable] = useState("");
  const [tableData, setTableData] = useState(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingRow, setSavingRow] = useState(false);
  const [schemaReport, setSchemaReport] = useState(null);
  const [verifyingSchema, setVerifyingSchema] = useState(false);
  const [exporting, setExporting] = useState("");

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.getDbStats();
      setStats(data);
    } catch (error) {
      toast.error(error.message || "Could not load database stats.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadRows = useCallback(
    async (table, nextPage, nextSearch) => {
      if (!table) return;
      setLoadingRows(true);
      try {
        const data = await api.browseDbTable(table, { page: nextPage, limit: PAGE_SIZE, search: nextSearch });
        setTableData(data);
      } catch (error) {
        toast.error(error.message || "Could not load table rows.");
        setTableData(null);
      } finally {
        setLoadingRows(false);
      }
    },
    []
  );

  const openTable = (table) => {
    setActiveTable(table);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setEditingRow(null);
    loadRows(table, 1, "");
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    loadRows(activeTable, nextPage, search);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadRows(activeTable, 1, searchInput);
  };

  const startEdit = (row) => {
    const editable = { ...row };
    delete editable.id;
    delete editable.created_at;
    delete editable.updated_at;
    setEditingRow(row);
    setEditDraft(JSON.stringify(editable, null, 2));
  };

  const saveEdit = async () => {
    let payload;
    try {
      payload = JSON.parse(editDraft);
    } catch {
      toast.error("Invalid JSON — please fix the syntax before saving.");
      return;
    }

    setSavingRow(true);
    try {
      const result = await api.updateDbRow(activeTable, editingRow.id, payload);
      toast.success("Record updated.");
      if (result.ignoredColumns?.length) {
        toast.error(`Protected columns ignored: ${result.ignoredColumns.join(", ")}`);
      }
      setEditingRow(null);
      loadRows(activeTable, page, search);
    } catch (error) {
      toast.error(error.message || "Update failed.");
    } finally {
      setSavingRow(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete this record from "${activeTable}"? This cannot be undone.`)) return;
    try {
      await api.deleteDbRow(activeTable, row.id);
      toast.success("Record deleted.");
      loadRows(activeTable, page, search);
      loadStats();
    } catch (error) {
      toast.error(error.message || "Delete failed.");
    }
  };

  const exportTable = async (format) => {
    setExporting(format);
    try {
      const blob = await api.downloadDbExport(activeTable, format);
      triggerDownload(blob, `${activeTable}_${new Date().toISOString().slice(0, 10)}.${format}`);
      toast.success(`Exported ${activeTable} as ${format.toUpperCase()}.`);
    } catch (error) {
      toast.error(error.message || "Export failed.");
    } finally {
      setExporting("");
    }
  };

  const runSchemaCheck = async () => {
    setVerifyingSchema(true);
    try {
      const report = await api.verifyDbSchema();
      setSchemaReport(report);
      if (report.allGood) {
        toast.success("Schema verified — all tables and columns present.");
      } else {
        toast.error("Schema check found problems. See the report below.");
      }
    } catch (error) {
      toast.error(error.message || "Schema verification failed.");
    } finally {
      setVerifyingSchema(false);
    }
  };

  const columns = tableData?.rows?.length ? Object.keys(tableData.rows[0]) : [];

  return (
    <div className="admin-database-tab animated-fade-in">
      {/* Health + totals strip */}
      <section className="admin-panel">
        <div className="section-heading inline">
          <div>
            <h2><Activity size={16} /> Database Health</h2>
            <p>
              {loadingStats
                ? "Checking Supabase connection..."
                : stats
                  ? `${stats.healthy ? "Connected" : "Unhealthy"} • ${stats.latencyMs}ms latency • ${stats.totals.tables} tables • ${stats.totals.rows} total rows`
                  : "Stats unavailable."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-soft compact" type="button" onClick={runSchemaCheck} disabled={verifyingSchema}>
              <ShieldCheck size={14} /> {verifyingSchema ? "Verifying..." : "Verify Schema"}
            </button>
            <button className="btn btn-soft compact" type="button" onClick={loadStats} disabled={loadingStats}>
              <RefreshCcw size={14} className={loadingStats ? "spin-loop" : ""} /> Refresh
            </button>
          </div>
        </div>

        {schemaReport && (
          <div className="admin-table-wrapper" style={{ marginTop: "12px" }}>
            <table className="admin-datatable">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Schema Check</th>
                </tr>
              </thead>
              <tbody>
                {schemaReport.results.map((result) => (
                  <tr key={result.table}>
                    <td><strong>{result.table}</strong></td>
                    <td>
                      {result.ok ? (
                        <span className="role-badge owner">OK</span>
                      ) : (
                        <span className="role-badge customer" title={result.error}>{result.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Table cards */}
      <section className="admin-panel" style={{ marginTop: "20px" }}>
        <div className="section-heading inline">
          <div>
            <h2><Database size={16} /> Tables</h2>
            <p>Select a table to browse, search, edit, or export records.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
          {(stats?.tables || []).map((table) => (
            <button
              key={table.name}
              type="button"
              className={`btn compact ${activeTable === table.name ? "btn-primary" : "btn-soft"}`}
              onClick={() => openTable(table.name)}
              disabled={table.rows === null}
              title={table.rows === null ? "Table unavailable" : `${table.rows} rows`}
            >
              {table.label} {table.rows !== null ? `(${table.rows})` : "(n/a)"}
            </button>
          ))}
        </div>
      </section>

      {/* Table browser */}
      {activeTable && (
        <section className="admin-panel" style={{ marginTop: "20px" }}>
          <div className="section-heading inline">
            <div>
              <h2>{activeTable}</h2>
              <p>
                {tableData
                  ? `${tableData.total} rows • page ${tableData.page} of ${tableData.totalPages}`
                  : loadingRows
                    ? "Loading rows..."
                    : "No data loaded."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <form onSubmit={submitSearch} className="search-box" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Search size={14} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search text columns..."
                />
              </form>
              <button className="btn btn-soft compact" type="button" onClick={() => exportTable("csv")} disabled={Boolean(exporting)}>
                <Download size={14} /> {exporting === "csv" ? "Exporting..." : "CSV"}
              </button>
              <button className="btn btn-soft compact" type="button" onClick={() => exportTable("json")} disabled={Boolean(exporting)}>
                <Download size={14} /> {exporting === "json" ? "Exporting..." : "JSON"}
              </button>
            </div>
          </div>

          <div className="admin-table-wrapper" style={{ marginTop: "12px", overflowX: "auto" }}>
            <table className="admin-datatable">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingRows ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="table-empty">Loading rows...</td>
                  </tr>
                ) : tableData?.rows?.length ? (
                  tableData.rows.map((row) => (
                    <tr key={row.id || JSON.stringify(row)}>
                      {columns.map((column) => (
                        <td key={column} title={typeof row[column] === "object" ? JSON.stringify(row[column]) : String(row[column] ?? "")}>
                          {formatCell(row[column])}
                        </td>
                      ))}
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-ghost btn-small" type="button" onClick={() => startEdit(row)} title="Edit record">
                          <Edit3 size={13} />
                        </button>
                        <button className="btn btn-ghost btn-small text-danger" type="button" onClick={() => deleteRow(row)} title="Delete record">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="table-empty">
                      {search ? "No rows match the search." : "Table is empty."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {tableData && tableData.totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
              <button className="btn btn-soft compact" type="button" disabled={page <= 1 || loadingRows} onClick={() => goToPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {tableData.page} / {tableData.totalPages}
              </span>
              <button
                className="btn btn-soft compact"
                type="button"
                disabled={page >= tableData.totalPages || loadingRows}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* Edit drawer */}
      {editingRow && (
        <section className="admin-panel" style={{ marginTop: "20px" }}>
          <div className="section-heading inline">
            <div>
              <h2><Edit3 size={16} /> Edit record</h2>
              <p>
                {activeTable} • id: {editingRow.id} — protected columns (id, timestamps, passwords) are ignored on save.
              </p>
            </div>
            <button className="btn btn-ghost compact" type="button" onClick={() => setEditingRow(null)}>
              <X size={14} /> Close
            </button>
          </div>
          <textarea
            value={editDraft}
            onChange={(event) => setEditDraft(event.target.value)}
            rows={Math.min(20, editDraft.split("\n").length + 2)}
            spellCheck={false}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "13px", marginTop: "10px" }}
          />
          <button className="btn btn-primary" type="button" onClick={saveEdit} disabled={savingRow} style={{ marginTop: "10px" }}>
            <Save size={15} /> {savingRow ? "Saving..." : "Save changes"}
          </button>
        </section>
      )}
    </div>
  );
}

export default DatabaseManager;
