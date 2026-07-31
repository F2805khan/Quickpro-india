import asyncHandler from "../middleware/asyncHandler.js";
import { supabase } from "../config/supabase.js";

/* ------------------------------------------------------------------ */
/*  Table registry                                                     */
/*  Only tables listed here can be touched through the DB manager.     */
/* ------------------------------------------------------------------ */

const TABLES = {
  users: {
    label: "Users",
    sensitiveColumns: ["password", "otp", "otp_expiry"]
  },
  bookings: { label: "Bookings" },
  services: { label: "Services" },
  payments: { label: "Payments" },
  coupons: { label: "Coupons" },
  beauty_artists: { label: "Beauty Artists" },
  support_messages: { label: "Support Messages" },
  auth_events: { label: "Auth Events" },
  payment_method_settings: { label: "Payment Method Settings" },
  auth_method_settings: { label: "Auth Method Settings" }
};

/* Columns that can never be written through the generic editor */
const PROTECTED_COLUMNS = new Set(["id", "created_at", "updated_at"]);

const MAX_PAGE_SIZE = 100;
const EXPORT_CHUNK_SIZE = 1000;
const MAX_EXPORT_ROWS = 50000;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const resolveTable = (res, tableName) => {
  const config = TABLES[tableName];
  if (!config) {
    res.status(404);
    throw new Error(`Unknown table "${tableName}". Managed tables: ${Object.keys(TABLES).join(", ")}`);
  }
  return { name: tableName, ...config };
};

const sanitizeRow = (table, row) => {
  if (!row || !table.sensitiveColumns?.length) return row;
  const next = { ...row };
  for (const column of table.sensitiveColumns) {
    if (column in next) next[column] = next[column] ? "•••redacted•••" : next[column];
  }
  return next;
};

const stripUnwritableColumns = (table, payload = {}) => {
  const clean = {};
  const rejected = [];

  for (const [key, value] of Object.entries(payload)) {
    if (PROTECTED_COLUMNS.has(key) || table.sensitiveColumns?.includes(key)) {
      rejected.push(key);
    } else {
      clean[key] = value;
    }
  }

  return { clean, rejected };
};

const getSampleColumns = async (tableName) => {
  const { data, error } = await supabase.from(tableName).select("*").limit(1);
  if (error) throw error;

  const sample = data?.[0];
  if (!sample) return [];

  return Object.entries(sample).map(([column, value]) => ({
    column,
    type: value === null ? "unknown" : Array.isArray(value) ? "array" : typeof value
  }));
};

/* PostgREST or() expressions break on commas/parens — strip them from search input */
const cleanSearchTerm = (term) => String(term || "").replace(/[(),]/g, " ").trim();

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  let str = typeof value === "object" ? JSON.stringify(value) : String(value);
  str = str.replace(/"/g, '""');
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    str = `"${str}"`;
  }
  return str;
};

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/tables                                     */
/* ------------------------------------------------------------------ */

export const listTables = asyncHandler(async (req, res) => {
  const tables = await Promise.all(
    Object.entries(TABLES).map(async ([name, config]) => {
      try {
        const { count, error } = await supabase
          .from(name)
          .select("*", { count: "exact", head: true });

        if (error) throw error;
        return { name, label: config.label, rows: count || 0, available: true };
      } catch (error) {
        return { name, label: config.label, rows: null, available: false, error: error.message };
      }
    })
  );

  res.json({ tables });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/stats                                      */
/* ------------------------------------------------------------------ */

export const getDatabaseStats = asyncHandler(async (req, res) => {
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  /* Health check: measure round-trip latency of a trivial query */
  const healthStart = Date.now();
  let healthy = true;
  let healthError = null;
  try {
    const { error } = await supabase.from("services").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
  } catch (error) {
    healthy = false;
    healthError = error.message;
  }
  const latencyMs = Date.now() - healthStart;

  const stats = await Promise.all(
    Object.entries(TABLES).map(async ([name, config]) => {
      const entry = { name, label: config.label, rows: null, last24h: null, last7d: null };

      try {
        const { count, error } = await supabase.from(name).select("*", { count: "exact", head: true });
        if (error) throw error;
        entry.rows = count || 0;
      } catch {
        entry.available = false;
        return entry;
      }

      /* Recent activity requires a created_at column — not all tables have one */
      try {
        const [{ count: day }, { count: week }] = await Promise.all([
          supabase.from(name).select("*", { count: "exact", head: true }).gte("created_at", dayAgo),
          supabase.from(name).select("*", { count: "exact", head: true }).gte("created_at", weekAgo)
        ]);
        entry.last24h = day || 0;
        entry.last7d = week || 0;
      } catch {
        /* Table has no created_at column — skip activity metrics */
      }

      return entry;
    })
  );

  res.json({
    database: "supabase",
    healthy,
    latencyMs,
    ...(healthError ? { healthError } : {}),
    totals: {
      tables: stats.filter((entry) => entry.rows !== null).length,
      rows: stats.reduce((sum, entry) => sum + (entry.rows || 0), 0)
    },
    tables: stats,
    generatedAt: new Date().toISOString()
  });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/tables/:table                              */
/*  Query params: page, limit, search, sort, dir                       */
/* ------------------------------------------------------------------ */

export const browseTable = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const search = cleanSearchTerm(req.query.search);
  const sort = String(req.query.sort || "").trim();
  const dir = String(req.query.dir || "desc").toLowerCase() === "asc";

  let query = supabase.from(table.name).select("*", { count: "exact" });

  if (search) {
    const columns = await getSampleColumns(table.name);
    const searchable = columns
      .filter(({ column, type }) => type === "string" && !table.sensitiveColumns?.includes(column))
      .map(({ column }) => `${column}.ilike.%${search}%`);

    if (searchable.length) {
      query = query.or(searchable.join(","));
    }
  }

  if (sort) {
    query = query.order(sort, { ascending: dir });
  } else {
    /* Best-effort default ordering; some tables lack created_at */
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  let { data, count, error } = await query.range(from, from + limit - 1);

  /* Retry without ordering if the default sort column doesn't exist */
  if (error && !sort && /created_at/i.test(error.message || "")) {
    const retry = await supabase
      .from(table.name)
      .select("*", { count: "exact" })
      .range(from, from + limit - 1);
    data = retry.data;
    count = retry.count;
    error = retry.error;
  }

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.json({
    table: table.name,
    page,
    limit,
    total: count || 0,
    totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
    rows: (data || []).map((row) => sanitizeRow(table, row))
  });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/tables/:table/columns                      */
/* ------------------------------------------------------------------ */

export const getTableColumns = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);
  const columns = await getSampleColumns(table.name);

  res.json({
    table: table.name,
    columns: columns.map((entry) => ({
      ...entry,
      writable: !PROTECTED_COLUMNS.has(entry.column) && !table.sensitiveColumns?.includes(entry.column)
    }))
  });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/tables/:table/rows/:id                     */
/* ------------------------------------------------------------------ */

export const getTableRow = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);

  const { data, error } = await supabase
    .from(table.name)
    .select("*")
    .eq("id", req.params.id)
    .limit(1);

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  if (!data?.length) {
    res.status(404);
    throw new Error("Record not found");
  }

  res.json({ table: table.name, row: sanitizeRow(table, data[0]) });
});

/* ------------------------------------------------------------------ */
/*  POST /api/admin/database/tables/:table                             */
/* ------------------------------------------------------------------ */

export const createTableRow = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);
  const { clean, rejected } = stripUnwritableColumns(table, req.body);

  if (!Object.keys(clean).length) {
    res.status(400);
    throw new Error("No writable columns provided");
  }

  const { data, error } = await supabase
    .from(table.name)
    .insert([clean])
    .select()
    .single();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.status(201).json({
    table: table.name,
    row: sanitizeRow(table, data),
    ...(rejected.length ? { ignoredColumns: rejected } : {})
  });
});

/* ------------------------------------------------------------------ */
/*  PUT /api/admin/database/tables/:table/rows/:id                     */
/* ------------------------------------------------------------------ */

export const updateTableRow = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);
  const { clean, rejected } = stripUnwritableColumns(table, req.body);

  if (!Object.keys(clean).length) {
    res.status(400);
    throw new Error("No writable columns provided");
  }

  const { data, error } = await supabase
    .from(table.name)
    .update(clean)
    .eq("id", req.params.id)
    .select();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  if (!data?.length) {
    res.status(404);
    throw new Error("Record not found");
  }

  res.json({
    table: table.name,
    row: sanitizeRow(table, data[0]),
    ...(rejected.length ? { ignoredColumns: rejected } : {})
  });
});

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/database/tables/:table/rows/:id                  */
/* ------------------------------------------------------------------ */

export const deleteTableRow = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);

  const { data, error } = await supabase
    .from(table.name)
    .delete()
    .eq("id", req.params.id)
    .select();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  if (!data?.length) {
    res.status(404);
    throw new Error("Record not found");
  }

  res.json({ table: table.name, deleted: true, id: req.params.id });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/tables/:table/export?format=csv|json       */
/* ------------------------------------------------------------------ */

export const exportTable = asyncHandler(async (req, res) => {
  const table = resolveTable(res, req.params.table);
  const format = String(req.query.format || "csv").toLowerCase();

  if (!["csv", "json"].includes(format)) {
    res.status(400);
    throw new Error('Supported export formats: "csv" (opens in Excel) and "json"');
  }

  const rows = [];
  for (let from = 0; from < MAX_EXPORT_ROWS; from += EXPORT_CHUNK_SIZE) {
    const { data, error } = await supabase
      .from(table.name)
      .select("*")
      .range(from, from + EXPORT_CHUNK_SIZE - 1);

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    rows.push(...(data || []).map((row) => sanitizeRow(table, row)));
    if (!data || data.length < EXPORT_CHUNK_SIZE) break;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${table.name}_${timestamp}.${format}`;

  if (format === "json") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(rows, null, 2));
    return;
  }

  const headers = rows.length ? Object.keys(rows[0]) : [];
  const csvLines = [headers.join(",")];
  for (const row of rows) {
    csvLines.push(headers.map((header) => escapeCsvValue(row[header])).join(","));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csvLines.join("\n"));
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/database/schema/verify                              */
/*  Runs the same column checks as scripts/verify_schema.js            */
/* ------------------------------------------------------------------ */

const SCHEMA_CHECKS = [
  { table: "users", cols: "full_name,email,phone,username,password,role,provider,otp,otp_expiry,address,city,firebase_uid,status" },
  { table: "bookings", cols: "booking_number,user_id,service_id,service_name,customer_name,customer_phone,customer_address,booking_date,booking_time,subtotal_amount,discount_amount,coupon_code,amount,payment_method,payment_status,booking_status,technician_name" },
  { table: "payments", cols: "booking_number,amount,payment_method,status,transaction_id" },
  { table: "auth_events", cols: "user_id,event_type,provider,email,ip_address,user_agent" },
  { table: "services", cols: "service_name,price,category,description,image_url,duration,rating,service_area,is_active" },
  { table: "beauty_artists", cols: 'name,specialty,"salonName",region,phone,email,image,bio,rating,services,enabled' },
  { table: "support_messages", cols: '"userId","ticketId",name,email,message,reply,status' },
  { table: "payment_method_settings", cols: "method,enabled,label,details" },
  { table: "coupons", cols: "code,discount_type,discount_value,min_order_amount,max_discount,usage_limit,used_count,is_active,expires_at" }
];

export const verifySchema = asyncHandler(async (req, res) => {
  const results = await Promise.all(
    SCHEMA_CHECKS.map(async ({ table, cols }) => {
      const { error } = await supabase.from(table).select(cols).limit(0);
      return {
        table,
        ok: !error,
        ...(error ? { error: error.message } : {})
      };
    })
  );

  res.json({
    allGood: results.every((result) => result.ok),
    results,
    checkedAt: new Date().toISOString()
  });
});
