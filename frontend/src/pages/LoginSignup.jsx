import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/notifications.js";
import { AlertCircle, ArrowLeft, CalendarDays, Mail, ShieldCheck, Sparkles, X } from "lucide-react";
import { supabase } from "../supabase.js";
import { logoutSession, onSessionChanged } from "../data/sessionStore.js";
import "../styles/otp-card.css";

const blankForm = {
  identifier: "",
  otp: ""
};

const isEmail = (value) => /\S+@\S+\.\S+/.test(value.trim());
const isPhoneLike = (value) => /^[+\d][\d\s-]{7,}$/.test(value.trim());

function LoginSignup({ compact = false, onAuthenticated, onDismiss }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("choice"); // "choice", "identity", "otp"
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorPopup, setErrorPopup] = useState({ title: "", message: "" });

  useEffect(() => onSessionChanged(setCurrentUser), []);

  const accountDestination = () => {
    if (onAuthenticated) {
      onAuthenticated();
      return;
    }
    navigate("/");
  };

  const showError = (message, title = "Login issue") => {
    setErrorPopup({ title, message });
  };

  const clearError = () => {
    setErrorPopup({ title: "", message: "" });
  };

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    let currentOtp = form.otp.split('');
    while (currentOtp.length < 6) currentOtp.push('');
    currentOtp[index] = value.slice(-1); 
    
    const newOtp = currentOtp.join('');
    setForm(current => ({ ...current, otp: newOtp }));
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-slot-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !form.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-slot-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        let currentOtp = form.otp.split('');
        currentOtp[index - 1] = '';
        setForm(current => ({ ...current, otp: currentOtp.join('') }));
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pastedData) {
      setForm(current => ({ ...current, otp: pastedData }));
      const nextIndex = Math.min(pastedData.length, 5);
      const nextInput = document.getElementById(`otp-slot-${nextIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    const identifier = form.identifier.trim();

    if (!identifier) {
      showError("Enter your email address or phone number first.", "Contact required");
      return;
    }

    if (!isEmail(identifier) && !isPhoneLike(identifier)) {
      showError("Please enter a valid email address or phone number.", "Check your contact");
      return;
    }

    setLoading(true);
    clearError();

    try {
      let error;
      if (isEmail(identifier)) {
        const { error: err } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            shouldCreateUser: true
          }
        });
        error = err;
      } else if (isPhoneLike(identifier)) {
        const { error: err } = await supabase.auth.signInWithOtp({
          phone: identifier.startsWith("+") ? identifier : `+91${identifier}`
        });
        error = err;
      }

      if (error) throw error;
      setStep("otp");
      toast.success("OTP sent successfully.");
    } catch (error) {
      showError(error.message || "Could not send OTP.", "OTP not sent");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    const identifier = form.identifier.trim();
    const otp = form.otp.trim();

    if (!otp || otp.length < 6) {
      showError("Enter the 6-digit OTP sent to you.", "OTP required");
      return;
    }

    setLoading(true);
    clearError();

    try {
      const type = isEmail(identifier) ? 'email' : 'phone';
      const formattedPhone = type === 'phone' && !identifier.startsWith("+") ? `+91${identifier}` : identifier;
      
      const { data, error } = await supabase.auth.verifyOtp({
        [type]: type === 'phone' ? formattedPhone : identifier,
        token: otp,
        type: type === 'email' ? 'email' : 'sms'
      });

      if (error) throw error;
      toast.success("Login complete.");
      accountDestination();
    } catch (error) {
      showError(error.message || "OTP not verified. Please try again.", "OTP not verified");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    setLoading(true);
    clearError();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      showError(error.message || "Could not continue with Google.", "Google login issue");
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("choice");
    setForm((current) => ({ ...current, otp: "" }));
    clearError();
  };

  const onLogout = async () => {
    try {
      await logoutSession();
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Could not log out.");
    }
  };

  if (currentUser) {
    const signedInCard = (
      <div className="brave-theme-card" style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        <div className="brave-icon-circle">
          <ShieldCheck size={32} />
        </div>
        <h1>{currentUser.email || currentUser.phone || "Welcome!"}</h1>
        <p>Your account is active and ready for your next booking.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <button className="brave-theme-btn" onClick={() => accountDestination()}>Continue</button>
          {!compact && <button className="brave-theme-btn-ghost" style={{ marginTop: '0' }} onClick={onLogout}>Logout</button>}
        </div>
      </div>
    );

    if (compact) {
      return (
        <div className="auth-popup-backdrop login-welcome-backdrop" role="dialog" aria-modal="true" aria-label="Login">
          <section className="login-welcome-popup">{signedInCard}</section>
        </div>
      );
    }

    return (
      <section className="auth-page shell">
        <div className="auth-stage auth-stage-signed">
          <AuthVisual />
          {signedInCard}
        </div>
      </section>
    );
  }

  const authCard = (
    <div className="brave-theme-card" style={{ width: '100%', maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
      {!compact && (
        <button className="icon-button" type="button" onClick={() => navigate("/")} aria-label="Go back" style={{ position: 'absolute', left: '16px', top: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
      )}
      {compact && (
        <button className="icon-button" type="button" onClick={onDismiss} aria-label="Close login popup" style={{ position: 'absolute', right: '16px', top: '16px' }}>
          <X size={18} />
        </button>
      )}
        <div className="auth-form-panel">
            <div className="brave-icon-circle">
              <ShieldCheck size={32} />
            </div>
            <h1>{step === "otp" ? "Verify OTP" : "Login or Signup"}</h1>
            <p>
                {step === "otp"
                  ? `Enter the OTP sent for ${form.identifier.trim()}.`
                  : step === "identity"
                    ? "Enter your phone number or email to receive an OTP. New users will be signed up automatically."
                    : "Connect your account or continue below"}
            </p>

            {step === "choice" ? (
              <div className="brave-theme-inner-card" style={{ padding: '8px' }}>
                <button
                  className="brave-choice-btn"
                  type="button"
                  onClick={handleGoogleSuccess}
                  disabled={loading}
                >
                  <div className="brave-choice-icon">
                    <span className="google-logo" style={{ fontSize: '20px', fontWeight: 'bold' }}>G</span>
                  </div>
                  <div className="brave-choice-content">
                    <strong>Continue with Google</strong>
                    <small>Login or sign up instantly</small>
                  </div>
                </button>
                <button
                  className="brave-choice-btn"
                  style={{ marginTop: '8px' }}
                  type="button"
                  onClick={() => setStep("identity")}
                  disabled={loading}
                >
                  <div className="brave-choice-icon">
                    <Mail size={18} />
                  </div>
                  <div className="brave-choice-content">
                    <strong>Continue with Email / Phone</strong>
                    <small>Get a magic OTP code</small>
                  </div>
                </button>
                {compact && (
                  <button className="brave-theme-btn-ghost" style={{ width: '100%', marginTop: '16px' }} type="button" onClick={onDismiss} disabled={loading}>
                    Browse without login
                  </button>
                )}
              </div>
            ) : step === "identity" ? (
              <form className="auth-form" onSubmit={requestOtp}>
                <div className="brave-theme-inner-card">
                  <div className="brave-input-group" style={{ marginBottom: 0 }}>
                    <label>Email or phone number</label>
                    <input
                      className="brave-input"
                      required
                      name="identifier"
                      value={form.identifier}
                      onChange={update}
                      placeholder="you@example.com or +91 98765..."
                      autoComplete="username"
                    />
                  </div>
                </div>
                <button className="brave-theme-btn" style={{ width: '100%' }} type="submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
                <button className="brave-theme-btn-ghost" style={{ width: '100%' }} type="button" onClick={() => setStep("choice")} disabled={loading}>
                  Back to login options
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="otp-card-container">
                  <div className="otp-card-title">Verify your contact</div>
                  <div className="otp-card-subtitle">
                    Enter the 6-digit code we sent to<br/>
                    <strong style={{ color: '#fff' }}>{form.identifier}</strong>
                  </div>

                  <div className="otp-slots-container" onPaste={handleOtpPaste}>
                    {[0, 1, 2, 3, 4, 5].map(index => (
                      <input
                        key={index}
                        id={`otp-slot-${index}`}
                        type="text"
                        inputMode="numeric"
                        className="otp-slot"
                        value={form.otp[index] || ''}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                      />
                    ))}
                  </div>

                  <div className="otp-message-bubble">
                    <div className="otp-message-icon">
                      <Mail size={18} />
                    </div>
                    <div className="otp-message-text">
                      MESSAGE - OTP<br/>
                      A verification code was sent to your {isPhoneLike(form.identifier) ? 'phone' : 'inbox'}.
                    </div>
                  </div>

                  <button className="otp-action-btn" type="submit" disabled={loading || form.otp.length < 6}>
                    {loading ? "Verifying..." : "Verify and login"}
                  </button>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <button type="button" className="otp-resend-link" onClick={requestOtp} disabled={loading}>
                      Resend code
                    </button>
                    <button type="button" className="otp-resend-link" onClick={resetFlow} disabled={loading}>
                      Change contact
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
  );

  if (compact) {
    return (
      <>
        <div className="auth-popup-backdrop login-welcome-backdrop" role="dialog" aria-modal="true" aria-label="Login">
          <section className="login-welcome-popup">{authCard}</section>
        </div>
        {errorPopup.message && (
          <div className="auth-popup-backdrop" role="dialog" aria-modal="true" aria-label="Login error">
            <section className="auth-error-popup">
              <button className="icon-button" type="button" onClick={clearError} aria-label="Close popup">
                <X size={18} />
              </button>
              <AlertCircle size={34} />
              <h2>{errorPopup.title}</h2>
              <p>{errorPopup.message}</p>
              <button className="btn btn-primary full" type="button" onClick={clearError}>
                Try again
              </button>
            </section>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="auth-page shell">
      <div className="auth-stage">
        <AuthVisual />
        {authCard}
      </div>

      {errorPopup.message && (
        <div className="auth-popup-backdrop" role="dialog" aria-modal="true" aria-label="Login error">
          <section className="auth-error-popup">
            <button className="icon-button" type="button" onClick={clearError} aria-label="Close popup">
              <X size={18} />
            </button>
            <AlertCircle size={34} />
            <h2>{errorPopup.title}</h2>
            <p>{errorPopup.message}</p>
            <button className="btn btn-primary full" type="button" onClick={clearError}>
              Try again
            </button>
          </section>
        </div>
      )}
    </section>
  );
}

function AuthVisual() {
  return (
    <aside className="auth-visual" aria-hidden="true">
      <div className="auth-visual-ring" />
      <div className="auth-static-visual">
        <div className="auth-static-card main">
          <span><ShieldCheck size={18} /> Secure Login</span>
          <strong>fixOindia</strong>
          <small>Email OTP, phone lookup and Gmail access</small>
        </div>
        <div className="auth-static-card mini card-one">
          <Mail size={18} />
          <span>Email OTP</span>
        </div>
        <div className="auth-static-card mini card-two">
          <CalendarDays size={18} />
          <span>Bookings ready</span>
        </div>
        <div className="auth-static-card mini card-three">
          <Sparkles size={18} />
          <span>Home care</span>
        </div>
      </div>
      <div className="auth-visual-copy">
        <span>Simple access</span>
        <strong>Login with OTP or Gmail. No passwords required.</strong>
      </div>
      <div className="auth-floating-chip chip-one">
        <ShieldCheck size={15} /> Verified booking
      </div>
      <div className="auth-floating-chip chip-two">
        <Mail size={15} /> Email OTP ready
      </div>
    </aside>
  );
}

export default LoginSignup;
