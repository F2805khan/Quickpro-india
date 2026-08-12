import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Download, CheckCircle, XCircle, AlertTriangle, Eye, ShieldAlert, User, Activity } from "lucide-react";
import { toast } from "../../utils/notifications.js";
import { api } from "../../api/client.js";
import AgentDetail from "./AgentDetail.jsx";

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [onlineFilter, setOnlineFilter] = useState("All");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    loadAgents();
  }, [statusFilter, verificationFilter, onlineFilter, searchTerm]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== "All") queryParams.append("status", statusFilter);
      if (verificationFilter !== "All") queryParams.append("verificationStatus", verificationFilter);
      if (onlineFilter !== "All") queryParams.append("isOnline", onlineFilter === "Online" ? "true" : "false");
      if (searchTerm) queryParams.append("search", searchTerm);
      
      const data = await api.getAgents(`?${queryParams.toString()}`);
      setAgents(data || []);
    } catch (err) {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(agents.map(a => a._id || a.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Approve ${selectedRows.length} selected agents?`)) return;
    
    try {
      await api.bulkUpdateAgents({ ids: selectedRows, updates: { status: 'approved', verificationStatus: 'verified' } });
      toast.success("Agents approved successfully");
      loadAgents();
      setSelectedRows([]);
    } catch (err) {
      toast.error("Bulk update failed");
    }
  };

  const handleExportCsv = () => {
    if (!agents.length) return;
    const headers = ["Name", "Phone", "Status", "Verification", "Jobs Completed"];
    const rows = agents.map(a => [
      a.name, 
      a.phone || "", 
      a.status, 
      a.verificationStatus || a.verification_status, 
      a.completedJobsCount || a.completed_jobs_count || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agents_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedAgentId) {
    return <AgentDetail agentId={selectedAgentId} onBack={() => { setSelectedAgentId(null); loadAgents(); }} />;
  }

  return (
    <div className="agent-management animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Agent Directory</h2>
          <p className="text-muted">Manage workforce agents, verifications, and monitor performance.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={handleExportCsv}>
            <Download size={16} style={{ marginRight: '5px' }} /> Export CSV
          </button>
          {selectedRows.length > 0 && (
            <button className="btn btn-primary" onClick={handleBulkApprove}>
              <CheckCircle size={16} style={{ marginRight: '5px' }} /> Bulk Approve
            </button>
          )}
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#666' }} />
          <input 
            type="text" 
            placeholder="Search agents by name or phone..." 
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '35px', width: '100%' }}
          />
        </div>
        
        <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>

        <select className="input-field" value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)}>
          <option value="All">All Verification</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <select className="input-field" value={onlineFilter} onChange={(e) => setOnlineFilter(e.target.value)}>
          <option value="All">All Presence</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      <div className="table-responsive" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}><input type="checkbox" onChange={handleSelectAll} checked={agents.length > 0 && selectedRows.length === agents.length} /></th>
              <th style={{ padding: '15px' }}>Agent</th>
              <th style={{ padding: '15px' }}>Contact</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>KYC</th>
              <th style={{ padding: '15px' }}>Jobs</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading agents...</td></tr>
            ) : agents.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No agents found matching criteria.</td></tr>
            ) : (
              agents.map(agent => (
                <tr key={agent._id || agent.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s', cursor: 'pointer' }} onClick={(e) => {
                  if (e.target.type !== 'checkbox' && e.target.tagName !== 'BUTTON') {
                    setSelectedAgentId(agent._id || agent.id);
                  }
                }} className="hover-row">
                  <td style={{ padding: '15px' }}>
                    <input type="checkbox" checked={selectedRows.includes(agent._id || agent.id)} onChange={() => handleRowSelect(agent._id || agent.id)} />
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden', position: 'relative' }}>
                        {agent.photo ? <img src={agent.photo} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} style={{ margin: '10px', color: '#999' }} />}
                        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: agent.isOnline ? '#22c55e' : '#ccc', border: '2px solid white' }} title={agent.isOnline ? 'Online' : 'Offline'}></div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{agent.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Joined {new Date(agent.createdAt || agent.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', color: '#555' }}>{agent.phone || agent.email || "N/A"}</td>
                  <td style={{ padding: '15px' }}>
                    <span className={`status-badge ${agent.status}`} style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                      background: agent.status === 'approved' ? '#dcfce7' : agent.status === 'pending' ? '#fef9c3' : agent.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                      color: agent.status === 'approved' ? '#166534' : agent.status === 'pending' ? '#854d0e' : agent.status === 'rejected' ? '#991b1b' : '#334155'
                    }}>
                      {agent.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', color: agent.verificationStatus === 'verified' ? '#166534' : '#854d0e' }}>
                      {agent.verificationStatus === 'verified' ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                      {agent.verificationStatus?.replace('_', ' ').toUpperCase() || 'NOT SUBMITTED'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '0.9rem' }}><b>{agent.completedJobsCount || agent.completed_jobs_count || 0}</b> done</div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-small" onClick={(e) => { e.stopPropagation(); setSelectedAgentId(agent._id || agent.id); }}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentManagement;
