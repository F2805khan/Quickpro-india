import React, { useState, useEffect } from "react";
import { Wallet, Calendar, CheckCircle, Clock, MapPin, Navigation, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";
import { api } from "../api/client";
import ChatBox from "../components/ChatBox";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [socket, setSocket] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [showChatForJob, setShowChatForJob] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Hardcoding providerId for mock purposes. In reality, get from context/session.
  const providerId = "00000000-0000-0000-0000-000000000000"; 

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/provider-dashboard/${providerId}/online-status`);
        if (res.ok) {
          const data = await res.json();
          setIsOnline(data.isOnline);
        }
      } catch (e) {
        console.error("Failed to fetch status", e);
      }
    };
    fetchStatus();
    
    return () => newSocket.disconnect();
  }, []);

  const toggleOnlineStatus = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      // Create api method or use fetch directly. We'll use fetch here if api method is missing.
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/provider-dashboard/${providerId}/online-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !isOnline })
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(data.isOnline);
      }
    } catch (e) {
      console.error("Failed to toggle status", e);
    } finally {
      setIsToggling(false);
    }
  };

  const simulateTracking = (jobId) => {
    if (!socket) return;
    setActiveJobId(jobId);
    socket.emit("join_booking", jobId);
    
    // Simulate moving towards destination
    let lat = 19.0760;
    let lng = 72.8777;
    
    const interval = setInterval(() => {
      lat += 0.001;
      lng += 0.001;
      socket.emit("location_update", {
        bookingId: jobId,
        providerId,
        latitude: lat,
        longitude: lng
      });
    }, 2000);

    // Stop after 20 seconds for demo
    setTimeout(() => {
      clearInterval(interval);
      setActiveJobId(null);
      alert("Arrived at destination!");
    }, 20000);
  };

  // Mock data since we just need UI
  const mockJobs = [
    { id: "1", serviceName: "Deep Home Cleaning", date: "2024-06-15", time: "10:00", address: "123 Main St, Apt 4B", status: "Pending", price: 2999 },
    { id: "2", serviceName: "AC Servicing", date: "2024-06-16", time: "14:00", address: "456 Park Ave", status: "Accepted", price: 899 }
  ];

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Provider Dashboard</h1>
        <button 
          onClick={toggleOnlineStatus}
          disabled={isToggling}
          style={{ 
            display: "flex", alignItems: "center", gap: "10px", 
            background: isOnline ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)", 
            padding: "10px 20px", borderRadius: "30px", border: "1px solid var(--border)",
            cursor: isToggling ? "not-allowed" : "pointer",
            transition: "all 0.3s"
          }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isOnline ? "#10b981" : "#64748b" }}></div>
          <span style={{ fontWeight: "600", color: isOnline ? "#10b981" : "#64748b" }}>
            {isOnline ? "Online & Accepting Jobs" : "Offline (Not Accepting Jobs)"}
          </span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        <div style={{ background: "var(--surface)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "15px", borderRadius: "50%" }}>
            <Wallet size={32} color="#10b981" />
          </div>
          <div>
            <p style={{ color: "var(--muted)", margin: 0 }}>This Week's Earnings</p>
            <h2 style={{ margin: "5px 0 0 0", fontSize: "2rem" }}>₹4,250</h2>
          </div>
        </div>
        <div style={{ background: "var(--surface)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "15px", borderRadius: "50%" }}>
            <Calendar size={32} color="#3b82f6" />
          </div>
          <div>
            <p style={{ color: "var(--muted)", margin: 0 }}>Completed Jobs</p>
            <h2 style={{ margin: "5px 0 0 0", fontSize: "2rem" }}>12</h2>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "15px", borderBottom: "1px solid var(--border)", marginBottom: "30px" }}>
        <button 
          onClick={() => setActiveTab("jobs")}
          style={{ background: "none", border: "none", padding: "10px 20px", borderBottom: activeTab === "jobs" ? "3px solid var(--primary)" : "3px solid transparent", fontWeight: "600", fontSize: "16px", cursor: "pointer", color: activeTab === "jobs" ? "var(--text)" : "var(--muted)" }}
        >
          Incoming Jobs
        </button>
        <button 
          onClick={() => setActiveTab("schedule")}
          style={{ background: "none", border: "none", padding: "10px 20px", borderBottom: activeTab === "schedule" ? "3px solid var(--primary)" : "3px solid transparent", fontWeight: "600", fontSize: "16px", cursor: "pointer", color: activeTab === "schedule" ? "var(--text)" : "var(--muted)" }}
        >
          My Schedule
        </button>
      </div>

      {activeTab === "jobs" && (
        <div style={{ display: "grid", gap: "20px" }}>
          {mockJobs.map(job => (
            <div key={job.id} style={{ background: "var(--surface)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 10px 0" }}>{job.serviceName}</h3>
                <div style={{ display: "flex", gap: "20px", color: "var(--muted)", fontSize: "14px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Calendar size={16} /> {job.date}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Clock size={16} /> {job.time}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><MapPin size={16} /> {job.address}</span>
                </div>
                <div style={{ marginTop: "15px", fontWeight: "600", color: "var(--primary)" }}>Estimated Earning: ₹{job.price}</div>
              </div>
              <div>
                {job.status === "Pending" ? (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-primary" style={{ padding: "8px 20px" }}>Accept</button>
                    <button className="btn btn-light" style={{ padding: "8px 20px" }}>Decline</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: "600" }}>
                      <CheckCircle size={20} /> Accepted
                    </div>
                    {activeJobId === job.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--primary)" }}>
                        <Navigation size={16} className="spin-slow" /> Broadcasting Location...
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button className="btn btn-primary" onClick={() => simulateTracking(job.id)} style={{ padding: "8px 20px", display: "flex", gap: "5px", alignItems: "center" }}>
                          <Navigation size={16} /> On the Way
                        </button>
                        <button className="btn btn-ghost" onClick={() => setShowChatForJob(job.id)} style={{ padding: "8px", borderRadius: "50%" }}>
                          <MessageCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "schedule" && (
        <div style={{ background: "var(--surface)", padding: "40px", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center", color: "var(--muted)" }}>
          <h3>Calendar View</h3>
          <p>This is where the dynamic scheduling calendar will go, allowing you to set unavailable times.</p>
        </div>
      )}

      {/* Chat Overlay for Provider */}
      {showChatForJob && socket && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", width: "350px", height: "450px", background: "var(--surface)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", zIndex: 100, border: "1px solid var(--border)" }}>
          <div style={{ padding: "15px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", background: "var(--primary)", color: "white", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>Chat with Customer</h3>
            <button onClick={() => setShowChatForJob(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "hidden", padding: "15px" }}>
            <ChatBox socket={socket} bookingId={showChatForJob} userId={providerId} />
          </div>
        </div>
      )}
    </div>
  );
}
