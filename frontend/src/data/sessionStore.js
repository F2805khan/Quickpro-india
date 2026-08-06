import { onAuthStateChanged, signOut as signOutFirebase } from "firebase/auth";
import { api } from "../api/client.js";
import { auth } from "../components/firebase.js";

export const isPrivilegedUser = (user) => ["admin", "owner"].includes(user?.role);

export const displayUserName = (user) => {
  const name = user?.name || user?.displayName || user?.userId || "";
  return name.toLowerCase() === "quickfix admin" ? "Quickpro India Control" : name || "Account";
};

const asBackendUser = (user) =>
  user
    ? {
        ...user,
        uid: user._id || user.uid,
        displayName: displayUserName(user),
        phoneNumber: user.phone,
        backendSession: true
      }
    : null;

const getBackendUser = () => {
  const savedUser = api.getSavedUser();
  return api.hasToken() && savedUser ? asBackendUser(savedUser) : null;
};
const sessionChangedEvent = "funservice:session-changed";
const profileUpdatedEvent = "funservice:profile-updated";

export const getCurrentSessionUser = () => getBackendUser();

export const onSessionChanged = (callback) => {
  let sessionTimer;

  const emit = () => callback(getCurrentSessionUser());
  const onBackendSessionChanged = () => {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => emit(), 80);
  };
  const unsubscribeFirebase = onAuthStateChanged(auth, () => onBackendSessionChanged());

  emit();
  window.addEventListener(sessionChangedEvent, onBackendSessionChanged);

  return () => {
    clearTimeout(sessionTimer);
    unsubscribeFirebase();
    window.removeEventListener(sessionChangedEvent, onBackendSessionChanged);
  };
};

export const onProfileUpdated = (callback) => {
  const handler = (event) => {
    const saved = event.detail;
    if (!saved) return;
    callback(asBackendUser(saved));
  };

  window.addEventListener(profileUpdatedEvent, handler);
  return () => window.removeEventListener(profileUpdatedEvent, handler);
};

export const logoutSession = async () => {
  api.clearSession();
  if (auth.currentUser) await signOutFirebase(auth);
};
