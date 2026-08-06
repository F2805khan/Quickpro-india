import { SupabaseModel } from "./SupabaseModel.js";

class Invoice extends SupabaseModel {
  static get tableName() {
    return "invoices";
  }

  static get columnMap() {
    return {
      bookingId: "booking_id",
      invoiceNumber: "invoice_number",
      subtotal: "subtotal",
      tax: "tax",
      total: "total",
      status: "status",
      pdfUrl: "pdf_url"
    };
  }
}

export default Invoice;
