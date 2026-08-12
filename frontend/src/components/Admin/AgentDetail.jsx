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

  if (loading || !agent) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading agent profile...</div>;
  }

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
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
              <span className={`status-badge ${agent.status}`} style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', background: '#f8f9fa', border: '1px solid #ddd' }}>
                {agent.status}
              </span>
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
                
                {agent.verificationStatus === 'under_review' && (
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                    <button className="btn" style={{ background: '#22c55e', color: 'white' }} onClick={() => handleVerification('verified')}>Approve KYC</button>
                    <button className="btn" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleVerification('rejected')}>Reject KYC</button>
                  </div>
                )}

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
