import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/notifications.js";
import { AlertCircle, CalendarDays, Mail, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { api } from "../api/client.js";
import { auth } from "../components/firebase.js";
import { logoutSession, onSessionChanged } from "../data/sessionStore.js";

const blankForm = {
  identifier: "",
  otp: ""
};

const isEmail = (value) => /\S+@\S+\.\S+/.test(value.trim());
const isPhoneLike = (value) => /^[+\d][\d\s-]{7,}$/.test(value.trim());
const fallbackPublicAuthMethods = [
  {
    id: "google",
    method: "Google",
    description: "Continue with Google (Gmail)",
    signupEnabled: true,
    loginEnabled: true
  },
  {
    id: "otp",
    method: "OTP",
    description: "Signup/login with a one-time email OTP",
    signupEnabled: true,
    loginEnabled: true
  }
];

const publicAuthMethodIds = new Set(["google", "otp"]);
const getAuthMethodId = (method) =>
  String(method?.id || method?.method || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const isAuthActionEnabled = (method, action) =>
  (action === "signup" ? method?.signupEnabled : method?.loginEnabled) !== false;
const isAuthMethodAvailable = (method) =>
  isAuthActionEnabled(method, "login") || isAuthActionEnabled(method, "signup");

function LoginSignup({ compact = false, onAuthenticated, onDismiss }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("choice");
  const [form, setForm] = useState(blankForm);
  const [otpPurpose, setOtpPurpose] = useState("login");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorPopup, setErrorPopup] = useState({ title: "", message: "" });
  const [authMethods, setAuthMethods] = useState([]);

  useEffect(() => {
    let active = true;
    api.getAuthMethods()
      .then((methods) => {
        if (active) setAuthMethods(methods);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

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

  const publicAuthMethods = useMemo(() => {
    const configuredAuthMethods = authMethods.length ? authMethods : fallbackPublicAuthMethods;
    return configuredAuthMethods.filter((method) => publicAuthMethodIds.has(getAuthMethodId(method)));
  }, [authMethods]);
  const getPublicAuthMethod = (id) =>
    publicAuthMethods.find((method) => getAuthMethodId(method) === id) ||
    fallbackPublicAuthMethods.find((method) => method.id === id);
  const googleMethod = getPublicAuthMethod("google");
  const otpMethod = getPublicAuthMethod("otp");
  const isGoogleAvailable = isAuthMethodAvailable(googleMethod);
  const isOtpAvailable = isAuthMethodAvailable(otpMethod);
  const isOtpLoginEnabled = isAuthActionEnabled(otpMethod, "login");
  const isOtpSignupEnabled = isAuthActionEnabled(otpMethod, "signup");
  const hasSignupEnabled = publicAuthMethods.some((method) => isAuthActionEnabled(method, "signup"));

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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

    if (!isOtpAvailable) {
      showError("Phone / Email OTP is coming soon.", "Coming soon");
      return;
    }

    if (!isOtpLoginEnabled && isOtpSignupEnabled && !isEmail(identifier)) {
      showError("Phone OTP login is coming soon. Use an email address to sign up with OTP.", "Email required");
      return;
    }

    setLoading(true);
    clearError();

    try {
      const firstPurpose = isOtpLoginEnabled ? "login" : "signup";
      const response = await api.requestOtp(
        firstPurpose === "signup"
          ? { email: identifier, purpose: "signup" }
          : { identifier, purpose: "login" }
      );
      setOtpPurpose(firstPurpose);
      setStep("otp");
      toast.success(response.message);
    } catch (error) {
      if (error.status === 404 && isEmail(identifier)) {
        if (!isOtpSignupEnabled) {
          showError("Account not found and signups are currently disabled.", "Account not found");
          return;
        }
        try {
          const response = await api.requestOtp({ email: identifier, purpose: "signup" });
          setOtpPurpose("signup");
          setStep("otp");
          toast.success(response.message);
        } catch (signupError) {
          showError(signupError.message || "Could not send OTP.", "OTP not sent");
        }
      } else if (error.status === 404 && isPhoneLike(identifier)) {
        showError("Phone login works for existing accounts only. Use your email or Gmail to create a new account.", "Account not found");
      } else if (error.status === 409 && !isOtpLoginEnabled) {
        showError("This account already exists, but OTP login is currently coming soon.", "OTP login unavailable");
      } else {
        showError(error.message || "Could not send OTP.", "OTP not sent");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    const identifier = form.identifier.trim();
    const otp = form.otp.trim();

    if (!otp) {
      showError("Enter the OTP sent to your email.", "OTP required");
      return;
    }

    setLoading(true);
    clearError();

    try {
      const payload = otpPurpose === "signup"
        ? { email: identifier, otp, purpose: "signup" }
        : { identifier, otp, purpose: "login" };
      const response = await api.verifyOtp(payload);
      api.saveSession(response);
      toast.success(otpPurpose === "signup" ? "Account created and logged in." : "Login complete.");
      accountDestination(response.user);
    } catch (error) {
      showError(error.message || "OTP not verified. Please try again.", "OTP not verified");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    if (!isGoogleAvailable) {
      showError("Gmail login is coming soon.", "Coming soon");
      return;
    }

    setLoading(true);
    clearError();

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const isSignupEnabled = isAuthActionEnabled(googleMethod, "signup");
      const response = await api.googleLogin({
        idToken: await firebaseUser.getIdToken(true),
        mode: isSignupEnabled ? "signup" : "login"
      });
      api.saveSession(response);
      toast.success(response.user ? "Gmail login complete." : "Logged in with Gmail.");
      accountDestination(response.user);
    } catch (error) {
      console.error("Google Login Catch Error details:", error);
      if (auth.currentUser && !api.hasToken()) await signOut(auth);
      if (error.code === "auth/unauthorized-domain") {
        showError(`Authorize ${window.location.hostname} in Firebase Authentication settings.`, "Firebase setup needed");
      } else if (error.code === "auth/popup-closed-by-user") {
        showError("Gmail login was cancelled.", "Gmail login cancelled");
      } else {
        showError(error.message || "Could not continue with Gmail.", "Gmail login issue");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("choice");
    setForm((current) => ({ ...current, otp: "" }));
    setOtpPurpose("login");
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
        <h1>{currentUser.displayName || currentUser.email || "Welcome!"}</h1>
        <p>Your account is active and ready for your next booking.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <button className="brave-theme-btn" onClick={() => accountDestination(currentUser)}>Continue</button>
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
      {compact && (
        <button className="icon-button" type="button" onClick={onDismiss} aria-label="Close login popup" style={{ position: 'absolute', right: '16px', top: '16px' }}>
          <X size={18} />
        </button>
      )}
        <div className="auth-form-panel">
            <div className="brave-icon-circle">
              <ShieldCheck size={32} />
            </div>
            <h1>{step === "otp" ? "Verify OTP" : (hasSignupEnabled ? "Ready to start?" : "Login")}</h1>
            <p>
                {step === "otp"
                  ? `Enter the OTP sent for ${form.identifier.trim()}.`
                  : step === "identity"
                    ? (isOtpSignupEnabled ? "Enter your phone number or email to receive an OTP. New users will be signed up automatically." : "Enter your phone number or email to receive an OTP to login.")
                    : "Connect your account or continue below"}
            </p>

            {step === "choice" ? (
              <div className="brave-theme-inner-card" style={{ padding: '8px' }}>
                <button
                  className={`brave-choice-btn ${!isGoogleAvailable ? "is-disabled" : ""}`}
                  type="button"
                  onClick={handleGoogleSuccess}
                  disabled={loading || !isGoogleAvailable}
                >
                  <div className="brave-choice-icon">
                    <span className="google-logo" style={{ fontSize: '20px', fontWeight: 'bold' }}>G</span>
                  </div>
                  <div className="brave-choice-content">
                    <strong>Continue with Google</strong>
                    <small>
                      {isGoogleAvailable ? "Login or sign up instantly" : "Coming Soon"}
                    </small>
                  </div>
                </button>
                <button
                  className={`brave-choice-btn ${!isOtpAvailable ? "is-disabled" : ""}`}
                  type="button"
                  onClick={() => {
                    if (isOtpAvailable) setStep("identity");
                  }}
                  disabled={loading || !isOtpAvailable}
                  style={{ marginBottom: '0' }}
                >
                  <div className="brave-choice-icon">
                    <Phone size={20} />
                  </div>
                  <div className="brave-choice-content">
                    <strong>Phone / Email OTP</strong>
                    <small>
                      {isOtpAvailable ? "Use verification code" : "Coming Soon"}
                    </small>
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
              <form className="auth-form" onSubmit={verifyOtp}>
                <div className="brave-theme-inner-card">
                  <div className="brave-input-group" style={{ marginBottom: 0 }}>
                    <label>OTP verification code</label>
                    <input
                      className="brave-input"
                      required
                      name="otp"
                      value={form.otp}
                      onChange={update}
                      placeholder="Enter 6-digit OTP"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '2px' }}
                    />
                  </div>
                </div>
                <button className="brave-theme-btn" style={{ width: '100%' }} type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify and login"}
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                  <button className="brave-theme-btn-ghost" style={{ width: '100%', marginTop: '0' }} type="button" onClick={requestOtp} disabled={loading}>
                    Resend OTP
                  </button>
                  <button className="brave-theme-btn-ghost" style={{ width: '100%', marginTop: '0' }} type="button" onClick={resetFlow}>
                    Change contact
                  </button>
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
