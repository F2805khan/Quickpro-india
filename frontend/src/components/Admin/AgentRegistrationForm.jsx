import React, { useState } from 'react';
import { User, ShieldCheck, Briefcase, MapPin, CreditCard, Car, FileText, Phone, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '../../utils/notifications.js';

const AgentRegistrationForm = ({ initialData, onSave, onCancel, saving }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [form, setForm] = useState({
    name: "", phone: "", email: "", dob: "", gender: "Male",
    address: "", pincode: "", photo: "",
    aadhaar_number: "", aadhaar_front: null, aadhaar_back: null,
    pan_number: "", pan_image: null, second_id: null,
    service_category: "Plumber", sub_services: "", experience_years: 0,
    languages: "English, Hindi", skills: "",
    service_area_pincodes: "", availability: "Full-time", job_radius_km: 10,
    bank_account: "", ifsc_code: "", account_holder_name: "",
    upi_id: "", cancelled_cheque: null,
    vehicle_type: "None", vehicle_number: "", driving_license: null,
    accept_terms: false, consent_background_check: false,
    emergency_contact_name: "", emergency_contact_phone: "",
    status: "offline", kyc_required: true,
    ...initialData
  });

  const sections = [
    { id: 'personal', title: 'Personal Details', icon: <User size={18} /> },
    { id: 'kyc', title: 'KYC & Identity', icon: <ShieldCheck size={18} /> },
    { id: 'professional', title: 'Professional Info', icon: <Briefcase size={18} /> },
    { id: 'work', title: 'Work Preferences', icon: <MapPin size={18} /> },
    { id: 'bank', title: 'Payout Details', icon: <CreditCard size={18} /> },
    { id: 'vehicle', title: 'Vehicle', icon: <Car size={18} /> },
    { id: 'legal', title: 'Legal', icon: <FileText size={18} /> },
    { id: 'emergency', title: 'Emergency', icon: <Phone size={18} /> }
  ];

  const handleInput = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: files[0] });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    if (!form.aadhaar_front || !form.aadhaar_back || !form.pan_image) {
      if (!initialData) {
        toast.error("Aadhaar and PAN documents are mandatory for KYC.");
        setActiveSection('kyc');
        return;
      }
    }
    if (!form.accept_terms || !form.consent_background_check) {
      toast.error("You must accept terms and consent to background check.");
      setActiveSection('legal');
      return;
    }
    onSave(form);
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
        <div style={{ width: '250px', background: '#f8fafc', padding: '20px 0', borderRight: '1px solid #eee' }}>
          <h3 style={{ margin: '0 20px 20px', fontSize: '1.2rem', color: '#1e293b' }}>Agent Profile</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sections.map(sec => (
              <li key={sec.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    width: '100%', padding: '12px 20px', border: 'none', background: activeSection === sec.id ? '#eff6ff' : 'transparent',
                    color: activeSection === sec.id ? '#2563eb' : '#64748b', textAlign: 'left', fontWeight: activeSection === sec.id ? '600' : '500',
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRight: activeSection === sec.id ? '3px solid #2563eb' : '3px solid transparent'
                  }}
                >
                  {sec.icon} {sec.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div style={{ flex: 1, padding: '30px' }}>
          <form onSubmit={validateAndSubmit} id="agent-registration-form">
            
            {activeSection === 'personal' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>1. Personal Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block' }}>Full Name *
                    <input required name="name" value={form.name} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Phone Number *
                    <input required name="phone" value={form.phone} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Email Address
                    <input type="email" name="email" value={form.email} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Date of Birth
                    <input type="date" name="dob" value={form.dob} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Gender
                    <select name="gender" value={form.gender} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </label>
                  <label style={{ display: 'block' }}>Profile Photo (Upload)
                    <input type="file" name="photo" accept="image/*" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </label>
                  <label style={{ display: 'block', gridColumn: 'span 2' }}>Residential Address
                    <input name="address" value={form.address} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Pincode
                    <input name="pincode" value={form.pincode} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'kyc' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>2. Identity Verification (KYC)</h3>
                <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5', display: 'flex', gap: '10px', color: '#991b1b' }}>
                  <ShieldCheck size={20} /> Aadhaar and PAN documents are mandatory for verification.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block' }}>Aadhaar Number *
                    <input required name="aadhaar_number" value={form.aadhaar_number} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <label style={{ display: 'block' }}>Aadhaar Front Image *
                      <input type="file" name="aadhaar_front" accept="image/*,application/pdf" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </label>
                    <label style={{ display: 'block' }}>Aadhaar Back Image *
                      <input type="file" name="aadhaar_back" accept="image/*,application/pdf" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </label>
                  </div>
                  <label style={{ display: 'block', marginTop: '20px' }}>PAN Card Number *
                    <input required name="pan_number" value={form.pan_number} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block', marginTop: '20px' }}>PAN Card Image *
                    <input type="file" name="pan_image" accept="image/*,application/pdf" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </label>
                  <label style={{ display: 'block', gridColumn: 'span 2' }}>Second ID Proof (Optional: Driving License/Voter ID)
                    <input type="file" name="second_id" accept="image/*,application/pdf" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'professional' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>3. Professional / Service Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block' }}>Service Category
                    <select name="service_category" value={form.service_category} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>Plumber</option><option>Electrician</option><option>Cleaner</option><option>Salon / Beauty</option><option>Carpenter</option>
                    </select>
                  </label>
                  <label style={{ display: 'block' }}>Sub-services (comma separated)
                    <input name="sub_services" value={form.sub_services} placeholder="Wiring, Appliance Repair" onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Years of Experience
                    <input type="number" name="experience_years" value={form.experience_years} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Languages Spoken
                    <input name="languages" value={form.languages} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block', gridColumn: 'span 2' }}>Skills / Certifications
                    <input name="skills" value={form.skills} placeholder="Any specific certifications" onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'work' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>4. Work Preferences</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block', gridColumn: 'span 2' }}>Service Area / Pincodes Covered (comma separated)
                    <input name="service_area_pincodes" value={form.service_area_pincodes} placeholder="110001, 110002" onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Availability
                    <select name="availability" value={form.availability} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>Full-time (All days)</option><option>Weekends Only</option><option>Part-time</option>
                    </select>
                  </label>
                  <label style={{ display: 'block' }}>Preferred Job Radius (km)
                    <input type="number" name="job_radius_km" value={form.job_radius_km} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'bank' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>5. Bank / Payout Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block' }}>Account Holder Name
                    <input name="account_holder_name" value={form.account_holder_name} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Bank Account Number
                    <input name="bank_account" value={form.bank_account} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>IFSC Code
                    <input name="ifsc_code" value={form.ifsc_code} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>UPI ID (Optional)
                    <input name="upi_id" value={form.upi_id} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block', gridColumn: 'span 2' }}>Cancelled Cheque / Passbook Photo
                    <input type="file" name="cancelled_cheque" accept="image/*,application/pdf" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'vehicle' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>6. Vehicle Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block' }}>Vehicle Type
                    <select name="vehicle_type" value={form.vehicle_type} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option>None</option><option>Bike / Scooter</option><option>Car / Van</option><option>Truck</option>
                    </select>
                  </label>
                  <label style={{ display: 'block' }}>Vehicle Number
                    <input name="vehicle_number" value={form.vehicle_number} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block', gridColumn: 'span 2' }}>Driving License Upload
                    <input type="file" name="driving_license" accept="image/*,application/pdf" onChange={handleInput} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'legal' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>7. Legal & Consent</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <input type="checkbox" name="accept_terms" checked={form.accept_terms} onChange={handleInput} style={{ width: '20px', height: '20px' }} />
                    <span>I accept the <strong>Terms & Conditions</strong> of the platform. *</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <input type="checkbox" name="consent_background_check" checked={form.consent_background_check} onChange={handleInput} style={{ width: '20px', height: '20px' }} />
                    <span>I consent to a <strong>Background Verification Check</strong>. *</span>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'emergency' && (
              <div className="animate-fade-in">
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>8. Emergency Contact</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'block' }}>Emergency Contact Name
                    <input name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                  <label style={{ display: 'block' }}>Emergency Contact Phone
                    <input name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleInput} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ padding: '10px 25px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {saving ? "Saving Profile..." : "Save Agent Profile"}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentRegistrationForm;
