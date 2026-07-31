import express from "express";
import {
  browseTable,
  createTableRow,
  deleteTableRow,
  exportTable,
  getDatabaseStats,
  getTableColumns,
  getTableRow,
  listTables,
  updateTableRow,
  verifySchema
} from "../controllers/databaseController.js";
import { owner, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Database management is owner-only — it exposes raw table access. */
router.use(protect, owner);

router.get("/tables", listTables);
router.get("/stats", getDatabaseStats);
router.get("/schema/verify", verifySchema);

router.get("/tables/:table", browseTable);
router.post("/tables/:table", createTableRow);
router.get("/tables/:table/columns", getTableColumns);
router.get("/tables/:table/export", exportTable);
router.get("/tables/:table/rows/:id", getTableRow);
router.put("/tables/:table/rows/:id", updateTableRow);
router.delete("/tables/:table/rows/:id", deleteTableRow);

export default router;
