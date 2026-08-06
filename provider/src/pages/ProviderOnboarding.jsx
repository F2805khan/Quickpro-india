import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, CheckCircle, Upload } from "lucide-react";

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    bio: "",
    experience: "",
    pincode: "",
    city: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call to register provider
    setTimeout(() => {
      navigate("/provider-dashboard");
    }, 1000);
  };

  return (
    <div className="container" style={{ maxWidth: "600px", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Become a Professional</h1>
      
      <div style={{ background: "var(--surface)", padding: "30px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        {step === 1 && (
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Briefcase size={24} color="var(--primary)" /> 
              Professional Details
            </h2>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Company / Display Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. CleanPro Services" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Years of Experience</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "25px" }}>
              <label>Short Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell customers about your expertise..." className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px", minHeight: "100px" }} />
            </div>
            <button className="btn btn-primary" onClick={handleNext} style={{ width: "100%" }}>Next: Service Areas</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <MapPin size={24} color="var(--primary)" /> 
              Service Areas
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: "20px" }}>Where can customers book you?</p>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Primary Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 400001" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "25px" }}>
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <button className="btn btn-primary" onClick={handleNext} style={{ width: "100%" }}>Next: Verification</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <CheckCircle size={24} color="var(--primary)" /> 
              Document Upload
            </h2>
            <div style={{ padding: "40px 20px", border: "2px dashed var(--border)", borderRadius: "8px", textAlign: "center", marginBottom: "25px" }}>
              <Upload size={32} color="var(--muted)" style={{ margin: "0 auto 10px" }} />
              <p>Upload Aadhar / Identity Proof</p>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Click or drag file here</span>
            </div>
            <button className="btn btn-primary" onClick={handleSubmit} style={{ width: "100%" }}>Complete Registration</button>
          </div>
        )}
      </div>
    </div>
  );
}
