import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

export default function ChatBox({ socket, bookingId, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      bookingId,
      senderId: userId,
      content: input
    };

    socket.emit("send_message", newMsg);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "20px" }}>
        {messages.length === 0 && <p style={{ textAlign: "center", color: "var(--muted)", margin: "auto" }}>No messages yet. Say hi!</p>}
        {messages.map((msg, index) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={index} style={{
              alignSelf: isMe ? "flex-end" : "flex-start",
              background: isMe ? "var(--primary)" : "var(--border)",
              color: isMe ? "white" : "var(--text)",
              padding: "10px 15px",
              borderRadius: "20px",
              maxWidth: "80%",
              wordBreak: "break-word"
            }}>
              {msg.content}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "15px" }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
          style={{ flex: 1, padding: "12px 15px", borderRadius: "30px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text)" }} 
        />
        <button type="submit" className="btn btn-primary" style={{ borderRadius: "50%", width: "45px", height: "45px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
