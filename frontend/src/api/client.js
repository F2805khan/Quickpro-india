import { supabase } from "../supabase.js";
import { getCurrentSessionUser } from "../data/sessionStore.js";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const bookingPath = (id) => `/bookings/${encodeURIComponent(id)}`;
const paymentPath = (bookingId) => `/payment/${encodeURIComponent(bookingId)}`;
const supportMessagesPath = (userId) => `/support/messages/${encodeURIComponent(userId)}`;
const adminBookingPath = (id) => `/admin/bookings/${encodeURIComponent(id)}`;
const adminCouponPath = (id) => `/admin/coupons/${encodeURIComponent(id)}`;
const adminServicePath = (id) => `/admin/services/${encodeURIComponent(id)}`;
const adminBeautyArtistPath = (id) => `/admin/beauty-artists/${encodeURIComponent(id)}`;
const adminSupportPath = (id) => `/admin/support/${encodeURIComponent(id)}/reply`;
const adminUserPasswordPath = (id) => `/admin/users/${encodeURIComponent(id)}/password`;
const AUTH_METHODS_CACHE_MS = 60 * 1000;
const TOKEN_KEY = "funservice-token";
const LEGACY_TOKEN_KEY = "token";

const cacheAuthMethods = (data) => {
  if (data?.methods) {
    localStorage.setItem("funservice-auth-methods", JSON.stringify(data.methods));
    localStorage.setItem("funservice-auth-methods-time", Date.now().toString());
  }
  return data;
};

async function request(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const optionHeaders = options.headers || {};
  
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...optionHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const notifyServicesChanged = () => {
  localStorage.setItem("funservice-services-changed-at", new Date().toISOString());
  window.dispatchEvent(new Event("funservice:services-changed"));
};

const notifyBeautyChanged = () => {
  localStorage.setItem("funservice-beauty-changed-at", new Date().toISOString());
  window.dispatchEvent(new Event("funservice:beauty-changed"));
};

export const api = {
  login: async ({ identifier, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password
    });
    if (error) throw error;
    return {
      user: {
        ...data.user,
        ...(data.user?.user_metadata || {})
      }
    };
  },
  clearSession: async () => {
    await supabase.auth.signOut();
  },
  hasToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
  getSavedUser: getCurrentSessionUser,
  saveSession: (session) => {
    // Session is handled by Supabase, this is just for compatibility
  },
  getToken: () => {
    // Token is handled by Supabase session implicitly
    return null;
  },
  isAdmin: () => getCurrentSessionUser()?.role === "admin" || getCurrentSessionUser()?.role === "owner",
  isOwner: () => getCurrentSessionUser()?.role === "owner",
  health: () =>
    fetch(`${API_ORIGIN}/api/health`).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Health check failed");
      return data;
    }),
  getProfile: () => request("/users/profile"),
  updateProfile: (payload) =>
    request("/users/profile", { method: "PUT", body: JSON.stringify(payload) }),
  getServices: (query = "") => request(`/services${query}`),
  getServiceCategories: () => request("/services/categories"),
  getServiceById: (id) => request(`/services/${encodeURIComponent(id)}`),
  getAdminOverview: () => request("/admin/overview"),
  getAdminServices: () => request("/admin/services?includeDisabled=true"),
  createService: (payload) =>
    request("/admin/services", { method: "POST", body: JSON.stringify(payload) }).then((service) => {
      notifyServicesChanged();
      return service;
    }),
  updateService: (id, payload) =>
    request(adminServicePath(id), { method: "PUT", body: JSON.stringify(payload) }).then((service) => {
      notifyServicesChanged();
      return service;
    }),
  deleteService: (id) => request(adminServicePath(id), { method: "DELETE" }).then((response) => {
    notifyServicesChanged();
    return response;
  }),
  getAdminBeautyArtists: () => request("/admin/beauty-artists?includeDisabled=true"),
  createBeautyArtist: (payload) =>
    request("/admin/beauty-artists", { method: "POST", body: JSON.stringify(payload) }).then((artist) => {
      notifyBeautyChanged();
      return artist;
    }),
  updateBeautyArtist: (id, payload) =>
    request(adminBeautyArtistPath(id), { method: "PUT", body: JSON.stringify(payload) }).then((artist) => {
      notifyBeautyChanged();
      return artist;
    }),
  deleteBeautyArtist: (id) => request(adminBeautyArtistPath(id), { method: "DELETE" }).then((response) => {
    notifyBeautyChanged();
    return response;
  }),
  getAgents: (query = "") => request(`/admin/agents${query}`),
  getAgentById: (id) => request(`/admin/agents/${encodeURIComponent(id)}`),
  createAgent: (payload) =>
    request("/admin/agents", { method: "POST", body: JSON.stringify(payload) }),
  updateAgent: (id, payload) =>
    request(`/admin/agents/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) }),
  bulkUpdateAgents: (payload) =>
    request("/admin/agents/bulk", { method: "PUT", body: JSON.stringify(payload) }),
  updateAgentStatus: (id, payload) =>
    request(`/admin/agents/${encodeURIComponent(id)}/status`, { method: "POST", body: JSON.stringify(payload) }),
  verifyAgent: (id, payload) =>
    request(`/admin/agents/${encodeURIComponent(id)}/verify`, { method: "POST", body: JSON.stringify(payload) }),
  deleteAgent: (id) => request(`/admin/agents/${encodeURIComponent(id)}`, { method: "DELETE" }),
  uploadAgentDocument: async (id, payload) => {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/agents/${encodeURIComponent(id)}/documents`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}) 
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  },
  getAgentDocuments: (id) => request(`/admin/agents/${encodeURIComponent(id)}/documents`),
  viewAgentDocument: (id, fileId) => request(`/admin/agents/${encodeURIComponent(id)}/documents/${encodeURIComponent(fileId)}/view`),
  getAgentJobs: (id) => request(`/admin/agents/${encodeURIComponent(id)}/jobs`),
  getAgentStats: (id) => request(`/admin/agents/${encodeURIComponent(id)}/stats`),
  getAdminAlerts: () => request("/admin/alerts"),
  markAlertRead: (id) => request(`/admin/alerts/${encodeURIComponent(id)}/read`, { method: "PUT" }),
  getAuditLogs: () => request("/admin/audit-logs"),
  createBooking: (payload) =>
    request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  applyCoupon: (payload) =>
    request("/coupons/apply", { method: "POST", body: JSON.stringify(payload) }),
  getMyBookings: () => request("/bookings/me"),
  getUserBookings: (userId) => request(`/bookings/user/${encodeURIComponent(userId)}`),
  getBookingById: (id) => request(bookingPath(id)),
  updateBookingStatus: (id, payload) =>
    request(`${bookingPath(id)}/status`, { method: "PUT", body: JSON.stringify(payload) }),
  cancelBooking: (id) => request(`${bookingPath(id)}/cancel`, { method: "PUT" }),
  deleteBooking: (id) => request(bookingPath(id), { method: "DELETE" }),
  createPaymentOrder: (payload) =>
    request("/payment/create-order", { method: "POST", body: JSON.stringify(payload) }),
  getPaymentMethods: () => request("/payment/methods"),
  verifyPayment: (payload) =>
    request("/payment/verify", { method: "POST", body: JSON.stringify(payload) }),
  getPaymentByBookingId: (bookingId) => request(paymentPath(bookingId)),
  getAdminBookings: () => request("/admin/bookings"),
  updateAdminBookingStatus: (id, payload) =>
    request(`${adminBookingPath(id)}/status`, { method: "PUT", body: JSON.stringify(payload) }),
  assignProfessional: (id, payload) =>
    request(`${adminBookingPath(id)}/assign`, { method: "PUT", body: JSON.stringify(payload) }),
  cancelAdminBooking: (id) =>
    request(`${adminBookingPath(id)}/cancel`, { method: "PUT" }),
  getAdminUsers: () => request("/admin/users"),
  resetUserPassword: (id, payload) =>
    request(adminUserPasswordPath(id), { method: "PUT", body: JSON.stringify(payload) }),
  getAdminPayments: () => request("/admin/payments"),
  getAdminAuthMethods: () => request("/admin/auth-methods").then(cacheAuthMethods),
  updateAdminAuthMethods: (methods) =>
    request("/admin/auth-methods", { method: "PUT", body: JSON.stringify({ methods }) }).then(cacheAuthMethods),
  getAdminPaymentMethods: () => request("/admin/payment-methods"),
  updateAdminPaymentMethods: (methods) =>
    request("/admin/payment-methods", { method: "PUT", body: JSON.stringify({ methods }) }),
  getAdminCoupons: () => request("/admin/coupons"),
  createAdminCoupon: (payload) =>
    request("/admin/coupons", { method: "POST", body: JSON.stringify(payload) }),
  updateAdminCoupon: (id, payload) =>
    request(adminCouponPath(id), { method: "PUT", body: JSON.stringify(payload) }),
  deleteAdminCoupon: (id) => request(adminCouponPath(id), { method: "DELETE" }),
  getAdminSupport: () => request("/admin/support"),
  replyToSupportMessage: (id, payload) =>
    request(adminSupportPath(id), { method: "PUT", body: JSON.stringify(payload) }),
  createSupportMessage: (payload) =>
    request("/support/message", { method: "POST", body: JSON.stringify(payload) }),
  getSupportMessagesByUser: (userId) => request(supportMessagesPath(userId)),
  reverseGeocode: (latitude, longitude) =>
    request(`/location/reverse?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`),
  sendReviewConfirmation: (payload) =>
    request("/reviews/confirmation", { method: "POST", body: JSON.stringify(payload) }),
  createReview: (payload) =>
    request("/reviews", { method: "POST", body: JSON.stringify(payload) }),
  getReviews: (query = "") => request(`/reviews${query}`),
  getProviders: () => request("/providers"),
  getProviderById: (id) => request(`/providers/${encodeURIComponent(id)}`),
  generateImage: (payload) =>
    request("/images/generate", { method: "POST", body: JSON.stringify(payload) }),
  getDbStats: () => request("/admin/database/stats"),
  getDbTables: () => request("/admin/database/tables"),
  browseDbTable: (table, { page = 1, limit = 25, search = "", sort = "", dir = "desc" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    if (sort) {
      params.set("sort", sort);
      params.set("dir", dir);
    }
    return request(`/admin/database/tables/${encodeURIComponent(table)}?${params}`);
  },
  getDbTableColumns: (table) => request(`/admin/database/tables/${encodeURIComponent(table)}/columns`),
  createDbRow: (table, payload) =>
    request(`/admin/database/tables/${encodeURIComponent(table)}`, { method: "POST", body: JSON.stringify(payload) }),
  updateDbRow: (table, id, payload) =>
    request(`/admin/database/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteDbRow: (table, id) =>
    request(`/admin/database/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(id)}`, { method: "DELETE" }),
  verifyDbSchema: () => request("/admin/database/schema/verify"),
  downloadDbExport: async (table, format = "csv") => {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    const response = await fetch(
      `${API_URL}/admin/database/tables/${encodeURIComponent(table)}/export?format=${format}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Export failed");
    }
    return response.blob();
  },
  getWhatsAppStatus: () => request("/whatsapp/status"),
  sendWhatsAppMessage: (payload) =>
    request("/whatsapp/send", { method: "POST", body: JSON.stringify(payload) }),
  broadcastWhatsAppMessage: (payload) =>
    request("/whatsapp/broadcast", { method: "POST", body: JSON.stringify(payload) })
};
