import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, Building2, CheckCircle } from "lucide-react";
import { api } from "../api/client";

export default function DigitalInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from /api/invoices/:id
    // Simulating API fetch
    setTimeout(() => {
      setInvoice({
        invoiceNumber: `INV-${id}`,
        date: new Date().toISOString().split('T')[0],
        customerName: "John Doe",
        serviceName: "Deep Home Cleaning",
        subtotal: 2999,
        discount: 500,
        tax: 449.82,
        total: 2948.82,
        status: "Paid",
        providerName: "Rajesh Kumar (CleanPro)"
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading invoice...</div>;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Actions (Hidden when printing) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Link to="/profile?tab=history" className="btn btn-light" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ArrowLeft size={18} /> Back to History
          </Link>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Printer size={18} /> Print / Save as PDF
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div style={{ background: "white", padding: "50px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid var(--border)" }} className="printable-area">
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--border)", paddingBottom: "30px", marginBottom: "30px" }}>
            <div>
              <h1 style={{ color: "var(--primary)", margin: "0 0 10px 0" }}>FunService</h1>
              <p style={{ color: "var(--muted)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={16} /> 123 Tech Park, Mumbai, 400001
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: "0 0 5px 0", color: "var(--text)" }}>TAX INVOICE</h2>
              <p style={{ color: "var(--muted)", margin: 0 }}>#{invoice.invoiceNumber}</p>
              <div style={{ marginTop: "15px", display: "inline-block", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "5px 15px", borderRadius: "20px", fontWeight: "600" }}>
                {invoice.status}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <p style={{ color: "var(--muted)", margin: "0 0 5px 0", fontSize: "14px", textTransform: "uppercase" }}>Billed To</p>
              <h3 style={{ margin: "0 0 5px 0" }}>{invoice.customerName}</h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "var(--muted)", margin: "0 0 5px 0", fontSize: "14px", textTransform: "uppercase" }}>Date of Service</p>
              <h3 style={{ margin: 0 }}>{invoice.date}</h3>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "15px 0", color: "var(--muted)" }}>Description</th>
                <th style={{ padding: "15px 0", color: "var(--muted)", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "20px 0", fontWeight: "500" }}>
                  {invoice.serviceName}
                  <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "5px", fontWeight: "normal" }}>
                    Provided by: {invoice.providerName}
                  </div>
                </td>
                <td style={{ padding: "20px 0", textAlign: "right", fontWeight: "500" }}>₹{invoice.subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ width: "300px", marginLeft: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "var(--muted)" }}>
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#10b981" }}>
                <span>Discount</span>
                <span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "var(--muted)" }}>
              <span>Taxes (GST 18%)</span>
              <span>₹{invoice.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--border)", paddingTop: "15px", fontSize: "20px", fontWeight: "bold" }}>
              <span>Total</span>
              <span>₹{invoice.total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: "60px", textAlign: "center", color: "var(--muted)", fontSize: "14px", borderTop: "1px dashed var(--border)", paddingTop: "30px" }}>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "0 0 5px 0" }}>
              <CheckCircle size={16} color="#10b981" /> Thank you for trusting FunService!
            </p>
            <p style={{ margin: 0 }}>This is a computer-generated document and requires no signature.</p>
          </div>
        </div>
      </div>
      
      {/* Add print styles inline for simplicity */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .printable-area { box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
