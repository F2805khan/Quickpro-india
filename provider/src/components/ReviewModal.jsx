import { useState } from "react";
import { X, Star } from "lucide-react";
import { toast } from "../utils/notifications.js";
import { api } from "../api/client.js";

function ReviewModal({ booking, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      toast.error("Please provide a rating and a comment.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createReview({
        bookingId: booking.id || booking._id,
        providerId: booking.providerId || null, // Assuming providerId exists if assigned
        serviceId: booking.serviceId || null,
        rating,
        comment
      });
      toast.success("Review submitted successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="status-modal-overlay active">
      <div className="status-modal-content" style={{ maxWidth: "450px" }}>
        <button className="status-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        
        <h2>Rate your service</h2>
        <p>How was your experience with <strong>{booking.serviceName}</strong>?</p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            {[1, 2, 3, 4, 5].map(r => (
              <button
                type="button"
                key={r}
                onClick={() => setRating(r)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: r <= rating ? "#fbbf24" : "var(--border)",
                  padding: "5px"
                }}
              >
                <Star size={36} fill={r <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600" }}>
            Share your thoughts
            <textarea 
              rows={4}
              placeholder="What did you like? How can we improve?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--background)",
                resize: "vertical"
              }}
            />
          </label>

          <button 
            className="btn btn-primary full" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
