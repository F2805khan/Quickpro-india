import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  CreditCard, 
  Car, 
  FileSignature, 
  PhoneCall, 
  Upload, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: "",
    dob: "",
    gender: "",
    profilePhoto: null,
    phone: "",
    email: "",
    address: "",
    pincode: "",
    
    // Step 2: Identity Verification
    aadhaarNumber: "",
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: "",
    panImage: null,
    secondIdProof: null,
    
    // Step 3: Professional Details
    serviceCategory: "",
    subServices: "",
    experience: "",
    skillsCertifications: null,
    languages: "",
    
    // Step 4: Work Preferences
    serviceAreaPincodes: "",
    availability: "",
    jobRadius: "",
    
    // Step 5: Bank Details
    bankAccount: "",
    ifscCode: "",
    accountHolderName: "",
    upiId: "",
    cancelledCheque: null,
    
    // Step 6: Vehicle Details
    vehicleType: "none",
    vehicleNumber: "",
    drivingLicense: null,
    
    // Step 7: Legal / Consent
    acceptTerms: false,
    consentBackgroundCheck: false,
    digitalSignature: "",
    
    // Step 8: Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call to register provider
    setTimeout(() => {
      navigate("/provider-dashboard");
    }, 1500);
  };

  const renderStepIndicator = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '0', width: `${((step - 1) / (totalSteps - 1)) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.3s' }}></div>
        
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div key={idx} style={{ 
            width: '30px', height: '30px', borderRadius: '50%', 
            background: step > idx ? 'var(--primary)' : 'var(--surface)',
            color: step > idx ? '#fff' : 'var(--muted)',
            border: `2px solid ${step >= idx + 1 ? 'var(--primary)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 'bold', zIndex: 2,
            transition: 'all 0.3s'
          }}>
            {step > idx + 1 ? <CheckCircle size={16} /> : idx + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "700px", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Agent Onboarding</h1>
      <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: "40px" }}>Complete your profile to start receiving jobs</p>
      
      {renderStepIndicator()}
      
      <div style={{ background: "var(--surface)", padding: "30px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <User size={24} color="var(--primary)" /> Personal Details
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number (OTP Verified)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Residential Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px", minHeight: "60px" }} />
            </div>
            
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>

            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Profile Photo (Live Selfie Capture Recommended)</label>
              <div style={{ padding: "20px", border: "1px dashed var(--border)", borderRadius: "8px", textAlign: "center", marginTop: "5px" }}>
                <input type="file" name="profilePhoto" onChange={handleChange} accept="image/*" capture="user" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <ShieldCheck size={24} color="var(--primary)" /> Identity Verification (KYC)
            </h2>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Aadhaar Number</label>
              <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div className="form-group">
                <label>Aadhaar Front Image</label>
                <input type="file" name="aadhaarFront" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>
              <div className="form-group">
                <label>Aadhaar Back Image</label>
                <input type="file" name="aadhaarBack" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>PAN Card Number (For Tax/Payout)</label>
              <input type="text" name="panCard" value={formData.panCard} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>PAN Card Image</label>
              <input type="file" name="panImage" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Second ID Proof (Optional - DL / Voter ID)</label>
              <input type="file" name="secondIdProof" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Briefcase size={24} color="var(--primary)" /> Professional Details
            </h2>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Service Category</label>
              <select name="serviceCategory" value={formData.serviceCategory} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }}>
                <option value="">Select Category...</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="cleaner">Cleaner</option>
                <option value="salon">Salon & Spa</option>
                <option value="carpenter">Carpenter</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Sub-services Offered (e.g. wiring, installation)</label>
              <input type="text" name="subServices" value={formData.subServices} onChange={handleChange} placeholder="Comma separated..." className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Years of Experience</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Languages Spoken</label>
              <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="e.g. English, Hindi" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Skills / Certifications (Upload file)</label>
              <input type="file" name="skillsCertifications" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <MapPin size={24} color="var(--primary)" /> Work Preferences
            </h2>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Service Area / Pincode(s) covered</label>
              <input type="text" name="serviceAreaPincodes" value={formData.serviceAreaPincodes} onChange={handleChange} placeholder="e.g. 400001, 400002" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Availability (Days / Hours)</label>
              <input type="text" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Mon-Sat, 9AM-6PM" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Preferred Job Radius (km)</label>
              <input type="number" name="jobRadius" value={formData.jobRadius} onChange={handleChange} placeholder="e.g. 10" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <CreditCard size={24} color="var(--primary)" /> Bank / Payout Details
            </h2>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Account Holder Name</label>
              <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Bank Account Number</label>
              <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>IFSC Code</label>
              <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>UPI ID (Optional)</label>
              <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Cancelled Cheque / Passbook Photo</label>
              <input type="file" name="cancelledCheque" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Car size={24} color="var(--primary)" /> Vehicle Details
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: "15px", fontSize: "0.9rem" }}>If you travel to customers, provide vehicle details.</p>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Vehicle Type</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }}>
                <option value="none">None</option>
                <option value="bike">Bike / Two-Wheeler</option>
                <option value="car">Car / Four-Wheeler</option>
              </select>
            </div>
            {formData.vehicleType !== "none" && (
              <>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label>Vehicle Number</label>
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label>Driving License Upload</label>
                  <input type="file" name="drivingLicense" onChange={handleChange} className="form-input" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
                </div>
              </>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <FileSignature size={24} color="var(--primary)" /> Legal / Consent
            </h2>
            <div className="form-group" style={{ marginBottom: "15px", display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} style={{ marginTop: '5px', width: '20px', height: '20px' }} />
              <label style={{ fontSize: '0.95rem' }}>I accept the Terms & Conditions and Privacy Policy of the platform.</label>
            </div>
            <div className="form-group" style={{ marginBottom: "20px", display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input type="checkbox" name="consentBackgroundCheck" checked={formData.consentBackgroundCheck} onChange={handleChange} style={{ marginTop: '5px', width: '20px', height: '20px' }} />
              <label style={{ fontSize: '0.95rem' }}>I consent to a background verification check using the provided documents.</label>
            </div>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Digital Signature (Type your full name as agreement)</label>
              <input type="text" name="digitalSignature" value={formData.digitalSignature} onChange={handleChange} placeholder="e.g. John Doe" className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="animate-slide-up">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <PhoneCall size={24} color="var(--primary)" /> Emergency Contact
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: "15px", fontSize: "0.9rem" }}>Optional but recommended for your safety.</p>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Emergency Contact Name</label>
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
            <div className="form-group" style={{ marginBottom: "25px" }}>
              <label>Emergency Contact Phone</label>
              <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "10px", marginTop: "5px" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <button 
            className="btn btn-outline" 
            onClick={handlePrev} 
            disabled={step === 1}
            style={{ opacity: step === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          {step < totalSteps ? (
            <button className="btn btn-primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} style={{ background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Submit Application <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
