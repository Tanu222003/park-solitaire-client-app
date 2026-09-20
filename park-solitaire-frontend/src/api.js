export function getBaseUrl() {
  const saved = localStorage.getItem("server_api_url");
  if (saved && saved.trim()) return saved.replace(/\/$/, "");

  const env = import.meta.env.VITE_API_URL;
  if (env && env.trim()) return env.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:5001/api`;
    }
  }
  return "http://192.168.1.110:5001/api";
}

export function getServerUrl() {
  return getBaseUrl();
}

export function setServerUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem("server_api_url");
  } else {
    let clean = url.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `http://${clean}`;
    }
    if (!clean.endsWith("/api")) {
      clean = `${clean.replace(/\/$/, "")}/api`;
    }
    localStorage.setItem("server_api_url", clean);
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request("/auth/me"),

  getClients: () => request("/clients"),

  getClient: (id) => request(`/clients/${id}`),

  createClient: (data) =>
    request("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateClient: (id, data) =>
    request(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getVisits: () => request("/visits"),

  createVisit: (data) =>
    request("/visits", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateVisit: (id, data) =>
    request(`/visits/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getComplaints: () => request("/complaints"),

  createComplaint: (data) =>
    request("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateComplaint: (id, data) =>
    request(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getPayments: () => request("/payments"),

  createPayment: (data) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePayment: (id, data) =>
    request(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getAdminDashboard: () => request("/admin/dashboard"),

  getAdminPartners: () => request("/admin/partners"),

  getUserProfile: (id) => request(`/auth/user/${id}`),

  getAdminInfo: () => request("/auth/admin-info"),
};