import { supabase } from "../supabase.js";

// Utility to display user name or default
export const displayUserName = (user) => {
  const meta = user?.user_metadata || {};
  const name = meta.full_name || meta.name || user?.phone || user?.email || "";
  return name.toLowerCase() === "quickfix admin" ? "Quickpro India Control" : name || "Account";
};

// Normalize Supabase user to the expected frontend shape
const asBackendUser = (supabaseUser) => {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};
  return {
    ...supabaseUser,
    ...meta,
    uid: supabaseUser.id,
    _id: supabaseUser.id,
    displayName: displayUserName(supabaseUser),
    phoneNumber: supabaseUser.phone || meta.phone,
    name: meta.full_name || meta.name,
    backendSession: true
  };
};

export const isPrivilegedUser = (user) => ["admin", "owner"].includes(user?.role || user?.user_metadata?.role);

let currentSessionUser = null;
const sessionListeners = new Set();
const profileUpdatedEvent = "funservice:profile-updated";

// Initialize and listen to Supabase Auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  currentSessionUser = session?.user ? asBackendUser(session.user) : null;
  for (const callback of sessionListeners) {
    callback(currentSessionUser);
  }
});

// Fetch initial session on load
supabase.auth.getSession().then(({ data: { session } }) => {
  currentSessionUser = session?.user ? asBackendUser(session.user) : null;
  for (const callback of sessionListeners) {
    callback(currentSessionUser);
  }
});

export const getCurrentSessionUser = () => currentSessionUser;

export const onSessionChanged = (callback) => {
  sessionListeners.add(callback);
  callback(currentSessionUser);

  return () => {
    sessionListeners.delete(callback);
  };
};

export const onProfileUpdated = (callback) => {
  const handler = (event) => {
    const saved = event.detail;
    if (!saved) return;
    // We treat event.detail as the raw user metadata patch
    callback(asBackendUser({ ...currentSessionUser, user_metadata: saved }));
  };

  window.addEventListener(profileUpdatedEvent, handler);
  return () => window.removeEventListener(profileUpdatedEvent, handler);
};

export const logoutSession = async () => {
  await supabase.auth.signOut();
};
