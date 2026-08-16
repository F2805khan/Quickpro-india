import { useState, useEffect } from "react";
import { ArrowLeft, User, ShieldCheck, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Briefcase, Star, Clock, Activity, FileText } from "lucide-react";
import { toast } from "../../utils/notifications.js";
import { api } from "../../api/client.js";

const AgentDetail = ({ agentId, onBack }) => {
  const [agent, setAgent] = useState(null);
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [actionReason, setActionReason] = useState("");
  const [viewingDocUrl, setViewingDocUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  // File upload state
  const [uploadFiles, setUploadFiles] = useState({});
  const [uploadingType, setUploadingType] = useState(null);

  useEffect(() => {
    loadAgentData();
  }, [agentId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const data = await api.getAgentById(agentId);
      setAgent(data);
      setStats(data.stats || {});
      
      const docs = await api.getAgentDocuments(agentId);
      setDocuments(docs || []);
      
      const recentJobs = await api.getAgentJobs(agentId);
      setJobs(recentJobs || []);
    } catch (err) {
      toast.error("Failed to load agent details");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (['rejected', 'suspended', 'blocked'].includes(newStatus) && !actionReason.trim()) {
      toast.error("Please provide a reason for this action.");
      return;
    }
    
    try {
      await api.updateAgentStatus(agentId, { status: newStatus, reason: actionReason });
      toast.success(`Agent status updated to ${newStatus}`);
      setActionReason("");
      loadAgentData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleOnlineToggle = async () => {
    try {
      await api.updateAgent(agentId, { isOnline: !agent.isOnline });
      toast.success(`Agent marked as ${!agent.isOnline ? 'Online' : 'Offline'}`);
      loadAgentData();
    } catch (err) {
      toast.error("Failed to update online status");
    }
  };

  const handleVerification = async (newStatus) => {
    if (newStatus === 'rejected' && !actionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    
    try {
      await api.verifyAgent(agentId, { verificationStatus: newStatus, reason: actionReason });
      toast.success(`Agent KYC marked as ${newStatus}`);
      setActionReason("");
      loadAgentData();
    } catch (err) {
      toast.error("Failed to update KYC status");
    }
  };

  const viewDocument = async (fileId) => {
    try {
      const { signedUrl } = await api.viewAgentDocument(agentId, fileId);
      setViewingDocUrl(signedUrl);
    } catch (err) {
      toast.error("Failed to open document securely");
    }
  };

  const handleFileChange = (type, file) => {
    setUploadFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleFileUpload = async (type) => {
    const file = uploadFiles[type];
    if (!file) {
      toast.error(`Please select a file for ${type.replace('_', ' ')}`);
      return;
    }

    try {
      setUploadingType(type);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", type);

      await api.uploadAgentDocument(agentId, formData);
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      
      setUploadFiles(prev => ({ ...prev, [type]: null }));
      // Refresh documents
      const docs = await api.getAgentDocuments(agentId);
      setDocuments(docs || []);
    } catch (err) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploadingType(null);
    }
  };

  if (loading || !agent) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading agent profile...</div>;
  }

  // Calculate earnings
  const completedJobs = jobs.filter(j => j.bookingStatus === 'Completed' || j.status === 'Completed' || j.booking_status === 'Completed');
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (Number(job.amount) || 0), 0);
  const averageEarnings = completedJobs.length > 0 ? Math.round(totalEarnings / completedJobs.length) : 0;

  return (
    <div className="agent-detail animate-slide-up">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to Directory
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
        
        {/* Left Column: Profile Card & Danger Zone */}
        <div>
          <div className="card profile-card" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '20px' }}>
            <div className="avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 15px', position: 'relative', overflow: 'hidden' }}>
              {agent.photo ? <img src={agent.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Agent" /> : <User size={40} style={{ margin: '30px', color: '#999' }} />}
            </div>
            <h3 style={{ margin: '0 0 5px 0' }}>{agent.name}</h3>
            <p style={{ color: '#666', margin: '0 0 15px 0' }}>{agent.phone || agent.email}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
              <span className={`status-badge ${agent.status}`} style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', background: '#f8f9fa', border: '1px solid #ddd' }}>
                {agent.status}
              </span>
              <button 
                onClick={handleOnlineToggle}
                style={{ 
                  padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', 
                  background: agent.isOnline ? '#dcfce7' : '#fee2e2', 
                  color: agent.isOnline ? '#166534' : '#991b1b', 
                  border: `1px solid ${agent.isOnline ? '#86efac' : '#fca5a5'}`, cursor: 'pointer' 
                }}
              >
                {agent.isOnline ? 'Online' : 'Offline'}
              </button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#888' }}>
              Last seen: {agent.lastSeenAt ? new Date(agent.lastSeenAt).toLocaleString() : 'Never'}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>
              Joined: {new Date(agent.createdAt || agent.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="card action-card" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Status Control</h4>
            <textarea 
              placeholder="Reason (required for Reject/Suspend/Block)"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px', minHeight: '60px' }}
            />
            
            {agent.status === 'pending' && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button className="btn" style={{ flex: 1, background: '#22c55e', color: 'white' }} onClick={() => handleStatusChange('approved')}>Approve</button>
                <button className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }} onClick={() => handleStatusChange('rejected')}>Reject</button>
              </div>
            )}
            
            {agent.status === 'approved' && (
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button className="btn" style={{ background: '#f59e0b', color: 'white' }} onClick={() => handleStatusChange('suspended')}>Suspend Agent</button>
                <button className="btn" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleStatusChange('blocked')}>Block Permanently</button>
              </div>
            )}

            {(agent.status === 'suspended' || agent.status === 'blocked' || agent.status === 'rejected') && (
              <button className="btn" style={{ width: '100%', background: '#22c55e', color: 'white' }} onClick={() => handleStatusChange('approved')}>Re-activate Agent</button>
            )}
          </div>
        </div>

        {/* Right Column: Tabs (Docs, Stats, Jobs) */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
            <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'profile' ? '#fff' : 'transparent', fontWeight: activeTab === 'profile' ? 'bold' : 'normal', borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : 'none', cursor: 'pointer' }}>
              <ShieldCheck size={16} style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} /> KYC & Documents
            </button>
            <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'stats' ? '#fff' : 'transparent', fontWeight: activeTab === 'stats' ? 'bold' : 'normal', borderBottom: activeTab === 'stats' ? '2px solid #3b82f6' : 'none', cursor: 'pointer' }}>
              <Activity size={16} style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} /> Performance
            </button>
            <button className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'jobs' ? '#fff' : 'transparent', fontWeight: activeTab === 'jobs' ? 'bold' : 'normal', borderBottom: activeTab === 'jobs' ? '2px solid #3b82f6' : 'none', cursor: 'pointer' }}>
              <Briefcase size={16} style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} /> Job History
            </button>
          </div>

          <div style={{ padding: '30px' }}>
            {activeTab === 'profile' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>KYC Verification</h3>
                  <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem', background: agent.verificationStatus === 'verified' ? '#dcfce7' : '#fef9c3', color: agent.verificationStatus === 'verified' ? '#166534' : '#854d0e', fontWeight: 'bold' }}>
                    Status: {agent.verificationStatus?.toUpperCase() || 'NOT SUBMITTED'}
                  </span>
                </div>
                
                {agent.verificationStatus === 'verified' ? (
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '50%', color: '#16a34a' }}>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#166534' }}>KYC Verified</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#15803d' }}>
                        This agent's documents have been successfully verified. They are now eligible to accept and fulfill jobs.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: agent.verificationStatus === 'rejected' ? '#fef2f2' : '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: `1px solid ${agent.verificationStatus === 'rejected' ? '#fecaca' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px', color: agent.verificationStatus === 'rejected' ? '#b91c1c' : '#1e293b' }}>
                          {agent.verificationStatus === 'rejected' ? <AlertTriangle size={18} className="text-red" /> : <ShieldCheck size={18} className="text-gray" />} 
                          {agent.verificationStatus === 'rejected' ? 'KYC Rejected - Action Flagged' : 'KYC Action Required'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: agent.verificationStatus === 'rejected' ? '#991b1b' : '#64748b' }}>
                          {agent.verificationStatus === 'rejected' 
                            ? "This agent's KYC was rejected. Waiting for valid documents to be uploaded before you can verify them." 
                            : "Review the documents below before making a decision. This directly affects the agent's ability to accept jobs."}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
                      <button 
                        className="btn" 
                        style={{ 
                          flex: 1,
                          display: 'flex', 
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#22c55e', 
                          color: 'white', 
                          border: 'none',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.2), 0 2px 4px -1px rgba(34, 197, 94, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }} 
                        onClick={() => handleVerification('verified')} 
                      >
                        <CheckCircle size={18} /> Approve KYC
                      </button>
                      
                      {agent.verificationStatus !== 'rejected' && (
                        <button 
                          className="btn" 
                          style={{ 
                            flex: 1,
                            display: 'flex', 
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#fff', 
                            color: '#ef4444', 
                            border: '1px solid #fca5a5',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }} 
                          onClick={() => handleVerification('rejected')} 
                        >
                          <XCircle size={18} /> Reject KYC
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 15px 0' }}>Upload New Documents</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                    {[
                      { key: 'profile_photo', label: 'Profile Photo (Visible to Customer)' },
                      { key: 'aadhaar_front', label: 'Aadhaar Front' },
                      { key: 'aadhaar_back', label: 'Aadhaar Back' },
                      { key: 'pan_card', label: 'PAN Card' },
                      { key: 'driving_license', label: 'Driving License / Other' }
                    ].map((docType) => (
                      <div key={docType.key} style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: docType.key === 'profile_photo' ? '#2563eb' : '#374151' }}>
                          {docType.label}
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="file" 
                            onChange={(e) => handleFileChange(docType.key, e.target.files[0])}
                            style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', width: '100%' }}
                          />
                          <button 
                            className="btn btn-primary btn-small" 
                            disabled={uploadingType === docType.key || !uploadFiles[docType.key]} 
                            onClick={() => handleFileUpload(docType.key)}
                          >
                            {uploadingType === docType.key ? '...' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <h4>Uploaded Documents ({documents.length})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {documents.length === 0 ? <p className="text-muted">No documents uploaded</p> : null}
                  {documents.map(doc => (
                    <div key={doc.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={24} color="#3b82f6" />
                        <div>
                          <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>{doc.fileType?.replace('_', ' ')}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-small" onClick={() => viewDocument(doc.id)}>Secure View</button>
                    </div>
                  ))}
                </div>

                {viewingDocUrl && (
                  <div style={{ marginTop: '20px', border: '2px dashed #ccc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#ef4444' }}><ShieldAlert size={12}/> Time-limited secure view. Do not share.</span>
                      <button onClick={() => setViewingDocUrl(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><XCircle size={18}/></button>
                    </div>
                    <img src={viewingDocUrl} alt="Secure Document Preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 style={{ margin: '0 0 20px 0' }}>Performance Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{stats.totalJobs || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Assigned</div>
                  </div>
                  <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>{stats.completedJobs || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: '#166534' }}>Completed</div>
                  </div>
                  <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }}>{stats.rejectedJobs || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: '#991b1b' }}>Rejected (By Agent)</div>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                      {stats.totalJobs ? Math.round(((stats.completedJobs || 0) / stats.totalJobs) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#92400e' }}>Completion Rate</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #a7f3d0' }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>₹{totalEarnings.toLocaleString()}</div>
                      <div style={{ fontSize: '0.9rem', color: '#047857', fontWeight: '500' }}>Total Earnings (Completed Jobs)</div>
                    </div>
                    <WalletCards size={32} color="#10b981" opacity={0.5} />
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #bbf7d0' }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>₹{averageEarnings.toLocaleString()}</div>
                      <div style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: '500' }}>Average Earning per Job</div>
                    </div>
                    <Activity size={32} color="#22c55e" opacity={0.5} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {stats.avgRating || '0.00'} <Star size={20} fill="#f59e0b" color="#f59e0b" />
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Average Rating</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Last Job Completed:</div>
                    <div style={{ fontWeight: '500' }}>{stats.lastJobAt ? new Date(stats.lastJobAt).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div>
                <h3 style={{ margin: '0 0 20px 0' }}>Recent Bookings</h3>
                {jobs.length === 0 ? (
                  <p className="text-muted">No jobs assigned to this agent yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Booking ID</th>
                        <th style={{ padding: '10px' }}>Service</th>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.bookingId || job.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '10px', fontFamily: 'monospace' }}>{job.bookingId}</td>
                          <td style={{ padding: '10px' }}>{job.serviceName}</td>
                          <td style={{ padding: '10px' }}>{new Date(job.createdAt || job.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: job.bookingStatus === 'Completed' ? '#166534' : job.bookingStatus === 'Cancelled' ? '#991b1b' : '#3b82f6' }}>
                              {job.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
