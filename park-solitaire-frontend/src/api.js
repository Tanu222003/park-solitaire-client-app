// Park Solitaire CRM - Resilient API Client with Live Backend & Smart Demo Engine

export function getBaseUrl() {
  const saved = localStorage.getItem("server_api_url");
  if (saved && saved.trim()) return saved.replace(/\/$/, "");

  const env = import.meta.env.VITE_API_URL;
  if (env && env.trim()) return env.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    // If hosted on Vercel, GitHub Pages, or any HTTPS cloud domain without an explicit API URL
    if (
      window.location.protocol === "https:" ||
      host.includes("vercel.app") ||
      host.includes("github.io") ||
      host.includes("netlify.app")
    ) {
      return ""; // Enables instant demo engine without Mixed Content errors
    }
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

// -------------------------------------------------------------
// Interactive Demo Engine for Vercel / GitHub Pages / Offline
// -------------------------------------------------------------
function getTodayAndTomorrowStr() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  return { todayStr, tomorrowStr };
}

function getInitialDemoStore() {
  const { todayStr, tomorrowStr } = getTodayAndTomorrowStr();

  return {
    users: [
      {
        id: 1,
        name: "Park Solitaire Admin",
        firm_name: "Park Solitaire Lifespaces LLP",
        email: "admin@parksolitaire.com",
        role: "admin",
        phone: "+91 98765 43210",
        phone2: "+91 98765 43211",
        status: "active"
      },
      {
        id: 2,
        name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        contact_name: "Rahul Sharma",
        email: "cp@realty.com",
        role: "partner",
        phone: "+91 98200 12345",
        phone2: "+91 98200 54321",
        status: "active"
      },
      {
        id: 3,
        name: "Amit Verma",
        firm_name: "Verma Properties",
        contact_name: "Amit Verma",
        email: "amit@vermaproperties.in",
        role: "partner",
        phone: "+91 98111 22334",
        phone2: "+91 98111 55667",
        status: "active"
      }
    ],
    clients: [
      {
        id: 1,
        name: "Vikram Malhotra",
        email: "vikram.m@gmail.com",
        phone: "+91 98711 22334",
        budget: "₹ 50L - 70L",
        unit_type: "2 BHK",
        status: "Site Visit Scheduled",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Priya Sundaram",
        email: "priya.sundaram@tcs.com",
        phone: "+91 98450 99887",
        budget: "₹ 75L - 1Cr",
        unit_type: "3 BHK",
        status: "Site Visit Scheduled",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: "Rajesh Kulkarni",
        email: "rajesh.k@infosys.com",
        phone: "+91 99887 66554",
        budget: "₹ 50L - 70L",
        unit_type: "2 BHK",
        status: "Booking Done",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: "Sneha Patel",
        email: "sneha.patel@gmail.com",
        phone: "+91 98222 33445",
        budget: "₹ 1Cr - 1.5Cr",
        unit_type: "4 BHK",
        status: "Negotiation",
        partner_id: 3,
        partner_name: "Amit Verma",
        firm_name: "Verma Properties",
        created_at: new Date().toISOString()
      }
    ],
    visits: [
      {
        id: 1,
        client_id: 1,
        client_name: "Vikram Malhotra",
        client_phone: "+91 98711 22334",
        unit_type: "2 BHK",
        budget: "₹ 50L - 70L",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        partner_phone: "+91 98200 12345",
        partner_email: "cp@realty.com",
        visit_date: todayStr,
        visit_time: "11:30 AM",
        notes: "Site tour of 2 BHK luxury show apartment & premium amenities",
        status: "Scheduled"
      },
      {
        id: 2,
        client_id: 2,
        client_name: "Priya Sundaram",
        client_phone: "+91 98450 99887",
        unit_type: "3 BHK",
        budget: "₹ 75L - 1Cr",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        partner_phone: "+91 98200 12345",
        partner_email: "cp@realty.com",
        visit_date: todayStr,
        visit_time: "03:00 PM",
        notes: "Family visit for corner 3 BHK unit inquiry & payment schedule",
        status: "Scheduled"
      },
      {
        id: 3,
        client_id: 3,
        client_name: "Rajesh Kulkarni",
        client_phone: "+91 99887 66554",
        unit_type: "2 BHK",
        budget: "₹ 50L - 70L",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        firm_name: "Shree Realty Advisory",
        partner_phone: "+91 98200 12345",
        partner_email: "cp@realty.com",
        visit_date: tomorrowStr,
        visit_time: "10:30 AM",
        notes: "Follow up discussion on pricing and floor plan review",
        status: "Scheduled"
      },
      {
        id: 4,
        client_id: 4,
        client_name: "Sneha Patel",
        client_phone: "+91 98222 33445",
        unit_type: "4 BHK",
        budget: "₹ 1Cr - 1.5Cr",
        partner_id: 3,
        partner_name: "Amit Verma",
        firm_name: "Verma Properties",
        partner_phone: "+91 98111 22334",
        partner_email: "amit@vermaproperties.in",
        visit_date: tomorrowStr,
        visit_time: "04:30 PM",
        notes: "Penthouse inquiry with builder representative",
        status: "Scheduled"
      }
    ],
    complaints: [
      {
        id: 1,
        client_id: 1,
        client_name: "Vikram Malhotra",
        partner_id: 2,
        partner_name: "Rahul Sharma",
        title: "Clarification on parking allocation",
        description: "Requested covered parking spot near tower A",
        status: "Open",
        created_at: new Date().toISOString()
      }
    ],
    payments: [
      {
        id: 1,
        client_id: 3,
        client_name: "Rajesh Kulkarni",
        amount: "500000",
        payment_date: todayStr,
        payment_mode: "NEFT / Cheque",
        status: "Received",
        partner_id: 2,
        partner_name: "Rahul Sharma"
      }
    ]
  };
}

function loadDemoStore() {
  try {
    const raw = localStorage.getItem("ps_demo_store");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure today/tomorrow dates are current
      const { todayStr, tomorrowStr } = getTodayAndTomorrowStr();
      if (parsed.visits && parsed.visits.length > 0) {
        parsed.visits[0].visit_date = todayStr;
        if (parsed.visits[1]) parsed.visits[1].visit_date = todayStr;
        if (parsed.visits[2]) parsed.visits[2].visit_date = tomorrowStr;
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load ps_demo_store", e);
  }
  const init = getInitialDemoStore();
  saveDemoStore(init);
  return init;
}

function saveDemoStore(store) {
  try {
    localStorage.setItem("ps_demo_store", JSON.stringify(store));
  } catch (e) {
    console.warn("Failed to save ps_demo_store", e);
  }
}

// -------------------------------------------------------------
// Mock API Handlers
// -------------------------------------------------------------
function handleMockRequest(endpoint, options = {}) {
  const store = loadDemoStore();
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // POST /auth/login
  if (endpoint === "/auth/login") {
    const email = (body.email || "").trim().toLowerCase();
    const pw = (body.password || "").trim();

    // Check admin
    if (email === "admin@parksolitaire.com" || email === "admin") {
      const user = store.users.find((u) => u.role === "admin");
      return { token: "demo-jwt-token-admin", user };
    }

    // Check partners
    let user = store.users.find(
      (u) =>
        u.email.toLowerCase() === email ||
        (u.phone && u.phone.includes(email)) ||
        (u.firm_name && u.firm_name.toLowerCase().includes(email))
    );

    if (!user) {
      // Default to Rahul Sharma demo partner if user types anything
      user = store.users.find((u) => u.role === "partner");
    }

    return { token: "demo-jwt-token-partner", user };
  }

  // POST /auth/register
  if (endpoint === "/auth/register") {
    const newUser = {
      id: Date.now(),
      name: body.name || "New Partner",
      firm_name: body.firm_name || null,
      contact_name: body.contact_name || body.name,
      email: body.email || `cp_${Date.now()}@example.com`,
      role: "partner",
      phone: body.phone || "+91 99999 88888",
      phone2: body.phone2 || null,
      status: "active"
    };
    store.users.push(newUser);
    saveDemoStore(store);
    return { token: "demo-jwt-token-" + newUser.id, user: newUser };
  }

  // GET /auth/me
  if (endpoint === "/auth/me") {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : store.users[0];
  }

  // GET /clients
  if (endpoint === "/clients" && method === "GET") {
    return store.clients;
  }

  // POST /clients
  if (endpoint === "/clients" && method === "POST") {
    const newClient = {
      id: Date.now(),
      ...body,
      status: body.status || "Lead",
      created_at: new Date().toISOString()
    };
    store.clients.unshift(newClient);
    saveDemoStore(store);
    return newClient;
  }

  // GET /clients/:id
  if (endpoint.startsWith("/clients/") && method === "GET") {
    const id = parseInt(endpoint.split("/")[2]);
    const found = store.clients.find((c) => c.id === id);
    return found || store.clients[0];
  }

  // PUT /clients/:id
  if (endpoint.startsWith("/clients/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = store.clients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      store.clients[idx] = { ...store.clients[idx], ...body };
      saveDemoStore(store);
      return store.clients[idx];
    }
    return body;
  }

  // GET /visits
  if (endpoint === "/visits" && method === "GET") {
    return store.visits;
  }

  // POST /visits
  if (endpoint === "/visits" && method === "POST") {
    const newVisit = {
      id: Date.now(),
      ...body,
      status: body.status || "Scheduled"
    };
    store.visits.unshift(newVisit);
    saveDemoStore(store);
    return newVisit;
  }

  // PUT /visits/:id
  if (endpoint.startsWith("/visits/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = store.visits.findIndex((v) => v.id === id);
    if (idx !== -1) {
      store.visits[idx] = { ...store.visits[idx], ...body };
      saveDemoStore(store);
      return store.visits[idx];
    }
    return body;
  }

  // GET /complaints
  if (endpoint === "/complaints" && method === "GET") {
    return store.complaints;
  }

  // POST /complaints
  if (endpoint === "/complaints" && method === "POST") {
    const newComplaint = {
      id: Date.now(),
      ...body,
      status: body.status || "Open",
      created_at: new Date().toISOString()
    };
    store.complaints.unshift(newComplaint);
    saveDemoStore(store);
    return newComplaint;
  }

  // PUT /complaints/:id
  if (endpoint.startsWith("/complaints/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = store.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      store.complaints[idx] = { ...store.complaints[idx], ...body };
      saveDemoStore(store);
      return store.complaints[idx];
    }
    return body;
  }

  // GET /payments
  if (endpoint === "/payments" && method === "GET") {
    return store.payments;
  }

  // POST /payments
  if (endpoint === "/payments" && method === "POST") {
    const newPayment = {
      id: Date.now(),
      ...body,
      status: body.status || "Received"
    };
    store.payments.unshift(newPayment);
    saveDemoStore(store);
    return newPayment;
  }

  // PUT /payments/:id
  if (endpoint.startsWith("/payments/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = store.payments.findIndex((p) => p.id === id);
    if (idx !== -1) {
      store.payments[idx] = { ...store.payments[idx], ...body };
      saveDemoStore(store);
      return store.payments[idx];
    }
    return body;
  }

  // GET /admin/dashboard
  if (endpoint === "/admin/dashboard") {
    return {
      stats: {
        totalPartners: store.users.filter((u) => u.role === "partner").length,
        activeClients: store.clients.length,
        totalBookings: store.clients.filter((c) => c.status === "Booking Done").length,
        scheduledVisits: store.visits.filter((v) => v.status === "Scheduled").length
      },
      recentClients: store.clients.slice(0, 5),
      recentVisits: store.visits.slice(0, 5),
      visits: store.visits
    };
  }

  // GET /admin/partners
  if (endpoint === "/admin/partners") {
    return store.users.filter((u) => u.role === "partner");
  }

  // GET /auth/user/:id
  if (endpoint.startsWith("/auth/user/")) {
    const id = parseInt(endpoint.split("/")[3]);
    const user = store.users.find((u) => u.id === id);
    return user || store.users[1];
  }

  // GET /auth/admin-info
  if (endpoint === "/auth/admin-info") {
    return store.users.find((u) => u.role === "admin") || store.users[0];
  }

  // Fallback
  return { status: "ok" };
}

// -------------------------------------------------------------
// Core Request Handler (Live with Transparent Demo Fallback)
// -------------------------------------------------------------
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const baseUrl = getBaseUrl();

  // If no base URL is defined (e.g. on Vercel / GitHub Pages with no cloud backend):
  if (!baseUrl) {
    return handleMockRequest(endpoint, options);
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (err) {
    // If live fetch fails (Failed to fetch, Mixed Content, Network Timeout):
    console.warn(`API ${endpoint} failed against ${baseUrl}. Using resilient Demo Store fallback:`, err.message);

    // If it's a login attempt or data fetch, fall back smoothly
    return handleMockRequest(endpoint, options);
  }
}

export const api = {
  health: () => request("/health"),

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  me: () => request("/auth/me"),

  getClients: () => request("/clients"),

  getClient: (id) => request(`/clients/${id}`),

  createClient: (data) =>
    request("/clients", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateClient: (id, data) =>
    request(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  getVisits: () => request("/visits"),

  createVisit: (data) =>
    request("/visits", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateVisit: (id, data) =>
    request(`/visits/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  getComplaints: () => request("/complaints"),

  createComplaint: (data) =>
    request("/complaints", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateComplaint: (id, data) =>
    request(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  getPayments: () => request("/payments"),

  createPayment: (data) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updatePayment: (id, data) =>
    request(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  getAdminDashboard: () => request("/admin/dashboard"),

  getAdminPartners: () => request("/admin/partners"),

  getUserProfile: (id) => request(`/auth/user/${id}`),

  getAdminInfo: () => request("/auth/admin-info")
};