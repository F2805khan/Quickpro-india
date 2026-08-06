import { useCallback, useEffect, useState } from "react";
import { Bot, MessageCircle, Radio, RefreshCcw, Send, Users } from "lucide-react";
import { toast } from "../utils/notifications.js";
import { api } from "../api/client.js";

const statusBadge = (value) =>
  value === "configured" ? (
    <span className="role-badge owner">Configured</span>
  ) : (
    <span className="role-badge customer">Not configured</span>
  );

function WhatsAppManager() {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [sendForm, setSendForm] = useState({ to: "", message: "" });
  const [sending, setSending] = useState(false);
  const [lastSendResult, setLastSendResult] = useState(null);

  const [broadcastForm, setBroadcastForm] = useState({ message: "", phones: "", limit: 50 });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const data = await api.getWhatsAppStatus();
      setStatus(data);
    } catch (error) {
      toast.error(error.message || "Could not load WhatsApp agent status.");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const submitSend = async (event) => {
    event.preventDefault();
    if (!sendForm.to.trim() || !sendForm.message.trim()) {
      toast.error("Phone number and message are required.");
      return;
    }

    setSending(true);
    setLastSendResult(null);
    try {
      const result = await api.sendWhatsAppMessage({ to: sendForm.to.trim(), message: sendForm.message });
      setLastSendResult(result);
      if (result.sent) {
        toast.success(`Message sent via ${result.provider}.`);
        setSendForm({ to: "", message: "" });
      } else if (result.whatsappUrl) {
        toast.error("WhatsApp API not configured — use the manual link below.");
      } else {
        toast.error(result.reason || "Message was not sent.");
      }
    } catch (error) {
      toast.error(error.message || "Send failed.");
    } finally {
      setSending(false);
    }
  };

  const submitBroadcast = async (event) => {
    event.preventDefault();
    if (!broadcastForm.message.trim()) {
      toast.error("Broadcast message is required.");
      return;
    }

    const phones = broadcastForm.phones
      .split(/[\n,;]+/)
      .map((phone) => phone.trim())
      .filter(Boolean);

    const audience = phones.length ? `${phones.length} listed numbers` : "ALL customers with a saved phone";
    if (!window.confirm(`Send this broadcast to ${audience} (max ${broadcastForm.limit})?`)) return;

    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const result = await api.broadcastWhatsAppMessage({
        message: broadcastForm.message,
        limit: Number(broadcastForm.limit) || 50,
        ...(phones.length ? { phones } : {})
      });
      setBroadcastResult(result);
      toast.success(`Broadcast finished — ${result.sent} sent, ${result.failed} failed.`);
    } catch (error) {
      toast.error(error.message || "Broadcast failed.");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="admin-whatsapp-tab animated-fade-in">
      {/* Agent status */}
      <section className="admin-panel">
        <div className="section-heading inline">
          <div>
            <h2><Bot size={16} /> Agent Status</h2>
            <p>Incoming auto-replies work once the Cloud API keys and webhook verify token are set in backend/.env.</p>
          </div>
          <button className="btn btn-soft compact" type="button" onClick={loadStatus} disabled={loadingStatus}>
            <RefreshCcw size={14} className={loadingStatus ? "spin-loop" : ""} /> Refresh
          </button>
        </div>

        {status && (
          <div className="admin-table-wrapper" style={{ marginTop: "12px" }}>
            <table className="admin-datatable">
              <tbody>
                <tr>
                  <td><strong>WhatsApp Cloud API (outgoing)</strong></td>
                  <td>{statusBadge(status.cloudApi)}</td>
                </tr>
                <tr>
                  <td><strong>Webhook fallback (outgoing)</strong></td>
                  <td>{statusBadge(status.webhookFallback)}</td>
                </tr>
                <tr>
                  <td><strong>Incoming webhook (auto-replies)</strong></td>
                  <td>{statusBadge(status.incomingWebhook)}</td>
                </tr>
                <tr>
                  <td><strong>AI replies (Claude)</strong></td>
                  <td>
                    {statusBadge(status.aiReplies)}{" "}
                    {status.aiModel && <small className="text-muted">({status.aiModel})</small>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Single message */}
      <section className="admin-panel" style={{ marginTop: "20px" }}>
        <div className="section-heading inline">
          <div>
            <h2><MessageCircle size={16} /> Send Message</h2>
            <p>Send a WhatsApp text to a single customer number.</p>
          </div>
        </div>
        <form onSubmit={submitSend} className="admin-form" style={{ marginTop: "10px" }}>
          <label>
            Phone number
            <input
              type="tel"
              value={sendForm.to}
              onChange={(event) => setSendForm((current) => ({ ...current, to: event.target.value }))}
              placeholder="9876543210 (10-digit numbers get +91 automatically)"
            />
          </label>
          <label>
            Message
            <textarea
              rows="4"
              value={sendForm.message}
              onChange={(event) => setSendForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Hi! Your fixOindia booking update..."
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={sending}>
            <Send size={15} /> {sending ? "Sending..." : "Send WhatsApp Message"}
          </button>
        </form>

        {lastSendResult?.whatsappUrl && !lastSendResult.sent && (
          <p style={{ marginTop: "10px" }}>
            Manual fallback:{" "}
            <a href={lastSendResult.whatsappUrl} target="_blank" rel="noreferrer">
              open chat in WhatsApp
            </a>
          </p>
        )}
      </section>

      {/* Broadcast */}
      <section className="admin-panel" style={{ marginTop: "20px" }}>
        <div className="section-heading inline">
          <div>
            <h2><Radio size={16} /> Broadcast</h2>
            <p>
              <Users size={13} /> Leave the numbers box empty to target all customers with a saved phone. Sends are
              throttled and capped by the limit.
            </p>
          </div>
        </div>
        <form onSubmit={submitBroadcast} className="admin-form" style={{ marginTop: "10px" }}>
          <label>
            Message
            <textarea
              rows="4"
              value={broadcastForm.message}
              onChange={(event) => setBroadcastForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Festive offer! Get 20% off on all cleaning services this week..."
            />
          </label>
          <label>
            Specific numbers (optional — one per line or comma separated)
            <textarea
              rows="3"
              value={broadcastForm.phones}
              onChange={(event) => setBroadcastForm((current) => ({ ...current, phones: event.target.value }))}
              placeholder={"9876543210\n9123456789"}
            />
          </label>
          <label>
            Max recipients
            <input
              type="number"
              min="1"
              max="500"
              value={broadcastForm.limit}
              onChange={(event) => setBroadcastForm((current) => ({ ...current, limit: event.target.value }))}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={broadcasting}>
            <Radio size={15} /> {broadcasting ? "Broadcasting..." : "Send Broadcast"}
          </button>
        </form>

        {broadcastResult && (
          <div className="admin-table-wrapper" style={{ marginTop: "12px" }}>
            <table className="admin-datatable">
              <tbody>
                <tr>
                  <td><strong>Requested</strong></td>
                  <td>{broadcastResult.requested}</td>
                </tr>
                <tr>
                  <td><strong>Attempted</strong></td>
                  <td>{broadcastResult.attempted}</td>
                </tr>
                <tr>
                  <td><strong>Sent</strong></td>
                  <td>{broadcastResult.sent}</td>
                </tr>
                <tr>
                  <td><strong>Failed</strong></td>
                  <td>
                    {broadcastResult.failed}
                    {broadcastResult.failures?.length > 0 && (
                      <small className="block text-muted">
                        {broadcastResult.failures.map((failure) => `${failure.phone}: ${failure.reason}`).join(" • ")}
                      </small>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default WhatsAppManager;
