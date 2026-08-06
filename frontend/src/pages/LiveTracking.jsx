import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Navigation, Phone, MessageCircle, ArrowLeft, Star } from "lucide-react";
import { io } from "socket.io-client";
import ChatBox from "../components/ChatBox";
// We use a mock socket URL if backend is not provided, otherwise from env
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function LiveTracking() {
  const { bookingId } = useParams();
  const [providerLocation, setProviderLocation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_booking", bookingId);
    });

    newSocket.on("location_changed", (data) => {
      setProviderLocation({ lat: data.latitude, lng: data.longitude });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [bookingId]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      {/* Header */}
      <header style={{ padding: "20px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "15px" }}>
        <Link to="/profile?tab=history" style={{ color: "var(--text)" }}><ArrowLeft /></Link>
        <h2 style={{ margin: 0 }}>Live Tracking</h2>
      </header>

      {/* Map Area (Mock) */}
      <div style={{ flex: 1, position: "relative", background: "#e5e7eb", overflow: "hidden" }}>
        {/* Placeholder Map Pattern */}
        <div style={{ width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(var(--primary) 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
        
        {/* Provider Marker */}
        {providerLocation ? (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%)`, // Ideally mapped to lat/lng
            background: "var(--primary)",
            color: "white",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            animation: "pulse 2s infinite"
          }}>
            <Navigation size={24} />
          </div>
        ) : (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--muted)" }}>
            Waiting for provider's location...
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "20px", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", marginTop: "-20px", zIndex: 10, boxShadow: "0 -4px 15px rgba(0,0,0,0.05)" }}>
        <div style={{ width: "40px", height: "5px", background: "var(--border)", borderRadius: "5px", margin: "0 auto 20px" }}></div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Rajesh Kumar</h3>
            <div style={{ display: "flex", gap: "5px", color: "var(--muted)", fontSize: "14px", alignItems: "center" }}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" /> 4.9 • Deep Cleaning Expert
            </div>
          </div>
          <img src="https://i.pravatar.cc/150?u=rajesh" alt="Provider" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-light" style={{ flex: 1, display: "flex", gap: "10px", justifyContent: "center" }} onClick={() => alert("Calling +91 98*** ***10")}>
            <Phone size={18} /> Call
          </button>
          <button className="btn btn-primary" style={{ flex: 1, display: "flex", gap: "10px", justifyContent: "center" }} onClick={() => setShowChat(!showChat)}>
            <MessageCircle size={18} /> Chat
          </button>
        </div>
      </div>

      {/* Chat Overlay */}
      {showChat && socket && (
        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", top: "0", background: "rgba(0,0,0,0.5)", zIndex: 20 }}>
          <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "70%", background: "var(--surface)", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>Chat with Rajesh</h3>
              <button onClick={() => setShowChat(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <ChatBox socket={socket} bookingId={bookingId} userId="CUSTOMER_123" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
