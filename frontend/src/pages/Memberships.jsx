import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Memberships() {
  const [purchased, setPurchased] = useState(false);

  const handleSubscribe = () => {
    // In prod, this would hit /api/subscriptions and open a payment gateway
    setPurchased(true);
  };

  if (purchased) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <CheckCircle2 size={64} color="#10b981" style={{ margin: "0 auto 20px" }} />
        <h1>Welcome to FunService Plus!</h1>
        <p style={{ color: "var(--muted)", fontSize: "18px", maxWidth: "500px", margin: "10px auto 30px" }}>
          Your subscription is now active. Enjoy free standard AC servicing and priority bookings all year long!
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
          Go to Home <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "60px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <span className="eyebrow" style={{ display: "inline-block", marginBottom: "10px" }}>Subscriptions</span>
        <h1>Peace of mind, all year round.</h1>
        <p style={{ color: "var(--muted)", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
          Join FunService Plus for recurring maintenance plans that save you time, money, and hassle.
        </p>
      </div>

      <div style={{ display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap" }}>
        
        {/* Plan 1 */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "350px", display: "flex", flexDirection: "column" }}>
          <ShieldCheck size={40} color="#3b82f6" style={{ marginBottom: "20px" }} />
          <h2 style={{ margin: "0 0 10px 0" }}>AC Care Plus</h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "20px" }}>
            <span style={{ fontSize: "32px", fontWeight: "bold" }}>₹2,999</span>
            <span style={{ color: "var(--muted)" }}>/ year</span>
          </div>
          <p style={{ color: "var(--muted)", marginBottom: "30px" }}>Never worry about your AC breaking down in the summer heat.</p>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1 }}>
            {["2 Free standard services", "Free gas top-up (once)", "Priority technician booking", "10% off spare parts"].map(feature => (
              <li key={feature} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
                <CheckCircle2 size={18} color="#10b981" /> {feature}
              </li>
            ))}
          </ul>
          
          <button className="btn btn-primary" onClick={handleSubscribe} style={{ width: "100%" }}>Subscribe Now</button>
        </div>

        {/* Plan 2 */}
        <div style={{ background: "var(--surface)", border: "2px solid var(--primary)", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "350px", display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "white", padding: "5px 15px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>Most Popular</div>
          <Zap size={40} color="var(--primary)" style={{ marginBottom: "20px" }} />
          <h2 style={{ margin: "0 0 10px 0" }}>Home Sentinel</h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "20px" }}>
            <span style={{ fontSize: "32px", fontWeight: "bold" }}>₹4,999</span>
            <span style={{ color: "var(--muted)" }}>/ year</span>
          </div>
          <p style={{ color: "var(--muted)", marginBottom: "30px" }}>Comprehensive protection for your home's most critical systems.</p>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1 }}>
            {["Everything in AC Care Plus", "Quarterly Pest Control", "1 Free Plumbing visit", "No surge pricing"].map(feature => (
              <li key={feature} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
                <CheckCircle2 size={18} color="#10b981" /> {feature}
              </li>
            ))}
          </ul>
          
          <button className="btn btn-primary" onClick={handleSubscribe} style={{ width: "100%" }}>Subscribe Now</button>
        </div>

      </div>
    </div>
  );
}
