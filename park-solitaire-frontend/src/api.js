// Park Solitaire CRM - Resilient API Client with Live Backend & Smart Demo Engine

export function getBaseUrl() {
  if (typeof window !== "undefined" && window.location) {
    const isHttps = window.location.protocol === "https:";
    const host = window.location.hostname;
    const saved = localStorage.getItem("server_api_url");

    if (saved && saved.trim()) {
      // Mixed Content prevention: cannot query insecure HTTP backend from HTTPS Vercel domain
      if (isHttps && saved.trim().startsWith("http://")) {
        console.warn("Ignoring saved HTTP backend on HTTPS domain to avoid Mixed Content blocking");
      } else {
        return saved.trim().replace(/\/$/, "");
      }
    }

    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5001/api";
    }

    // Default to live Railway cloud backend (HTTPS)
    return "https://park-solitaire-backend-production.up.railway.app/api";
  }

  const env = import.meta.env.VITE_API_URL;
  if (env && env.trim()) return env.replace(/\/$/, "");

  return "https://park-solitaire-backend-production.up.railway.app/api";
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
        status: "Upcoming"
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
        status: "Visited"
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
        status: "FollowUp"
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
        status: "Revisited"
      },
      {
        id: 5,
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
        visit_date: todayStr,
        visit_time: "05:00 PM",
        notes: "Booking amount token verified. Unit 402 blocked.",
        status: "Booked"
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
    ],
    bills: [
      {
        id: 101,
        partner_id: 2,
        partner_name: "Rahul Sharma",
        partner_firm_name: "Shree Realty Advisory",
        partner_phone: "+91 98200 12345",
        partner_email: "cp@realty.com",
        client_id: 3,
        client_name: "Rajesh Kulkarni",
        purchase_details: "Flat 402, Tower B - 2 BHK Premium",
        agreement_value: 6500000,
        brokerage_percent: 2.0,
        total_bill: 130000,
        account_details: "HDFC Bank - Current A/C",
        account_holder_name: "Shree Realty Advisory",
        account_no: "502000123456",
        ifsc_code: "HDFC0001234",
        branch: "FC Road, Pune",
        status: "pending",
        paid_date: null,
        payment_reference: null,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 102,
        partner_id: 3,
        partner_name: "Amit Verma",
        partner_firm_name: "Verma Properties",
        partner_phone: "+91 98111 22334",
        partner_email: "amit@vermaproperties.in",
        client_id: 4,
        client_name: "Sneha Patel",
        purchase_details: "Penthouse Suite 1401 - 4 BHK Luxury",
        agreement_value: 12000000,
        brokerage_percent: 2.5,
        total_bill: 300000,
        account_details: "ICICI Bank - Current A/C",
        account_holder_name: "Verma Properties",
        account_no: "001105001234",
        ifsc_code: "ICIC0000011",
        branch: "Sector 18, Noida",
        status: "paid",
        paid_date: todayStr,
        payment_reference: "NEFT-CMS9988231",
        created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
      }
    ]
  };
}

function loadDemoStore() {
  try {
    const raw = localStorage.getItem("ps_demo_store");
    if (raw) {
      const parsed = JSON.parse(raw);
      const init = getInitialDemoStore();
      if (!Array.isArray(parsed.users) || parsed.users.length === 0) parsed.users = init.users;
      if (!Array.isArray(parsed.clients) || parsed.clients.length === 0) parsed.clients = init.clients;
      if (!Array.isArray(parsed.visits) || parsed.visits.length === 0) parsed.visits = init.visits;
      if (!Array.isArray(parsed.complaints)) parsed.complaints = init.complaints;
      if (!Array.isArray(parsed.payments)) parsed.payments = init.payments;
      if (!Array.isArray(parsed.bills) || parsed.bills.length === 0) parsed.bills = init.bills;
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

  // POST /auth/login, /auth/admin/login, /auth/partner/login
  if (endpoint === "/auth/login" || endpoint === "/auth/admin/login" || endpoint === "/auth/partner/login") {
    const email = (body.email || "").trim().toLowerCase();
    const pw = (body.password || "").trim();
    const requestedRole = endpoint === "/auth/admin/login" ? "admin" : endpoint === "/auth/partner/login" ? "partner" : body.role;

    // Check admin credentials
    if (email === "admin@parksolitaire.com" || email === "admin") {
      if (requestedRole === "partner") {
        const error = new Error("Access denied: Admin accounts must log in through the Admin Portal (/admin/login).");
        error.status = 403;
        throw error;
      }
      const user = store.users.find((u) => u.role === "admin");
      return { token: "demo-jwt-token-admin", user };
    }

    // If requested role is admin, but user is not admin, reject
    if (requestedRole === "admin") {
      const error = new Error("Access denied: Channel Partner credentials cannot be used for Admin login.");
      error.status = 403;
      throw error;
    }

    // Check partners
    let user = store.users.find(
      (u) =>
        u.email.toLowerCase() === email ||
        (u.phone && u.phone.includes(email)) ||
        (u.firm_name && u.firm_name.toLowerCase().includes(email))
    );

    if (!user) {
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

  // Current authenticated user context
  let currentUser = { id: 2, name: 'Rahul Sharma', role: 'partner', firm_name: 'Shree Realty Advisory', phone: '+91 98200 12345', email: 'cp@realty.com' };
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) currentUser = JSON.parse(savedUser);
  } catch {}

  // GET /clients
  if (endpoint === "/clients" && method === "GET") {
    const isExplicitAdmin = currentUser.role === 'admin' || (typeof window !== "undefined" && window.location && window.location.pathname.startsWith("/admin"));
    if (!isExplicitAdmin && currentUser.role === 'partner') {
      return store.clients.filter(c => Number(c.partner_id) === Number(currentUser.id) || !c.partner_id);
    }
    return store.clients;
  }

  // POST /clients
  if (endpoint === "/clients" && method === "POST") {
    const partnerId = currentUser.role === 'partner' ? currentUser.id : (body.partner_id || 2);
    const partnerUser = store.users.find(u => Number(u.id) === Number(partnerId)) || currentUser;
    const clientStatus = body.status || 'Upcoming Visit';

    const newClient = {
      id: Date.now(),
      ...body,
      partner_id: partnerId,
      partner_name: partnerUser.name || 'Channel Partner',
      firm_name: partnerUser.firm_name || '',
      partner_email: partnerUser.email || '',
      partner_phone: partnerUser.phone || '',
      partner_phone2: partnerUser.phone2 || '',
      status: clientStatus,
      created_at: new Date().toISOString()
    };
    store.clients.unshift(newClient);

    // Automatically register an initial Upcoming visit for Today so it reflects in Admin Today's Visits and visits menu
    const { todayStr } = getTodayAndTomorrowStr();
    const targetVisitDate = body.visit_date || todayStr;
    const defaultNotes = body.visit_notes || `New client registered by ${partnerUser.name || 'Channel Partner'} (${newClient.unit_type || 'Unit'})`;

    const scheduledVisit = {
      id: Date.now() + 1,
      client_id: newClient.id,
      client_name: newClient.name,
      client_phone: newClient.phone,
      client_email: newClient.email,
      client_address: newClient.address,
      unit_type: newClient.unit_type,
      budget: newClient.budget,
      partner_id: partnerId,
      partner_name: partnerUser.name || 'Channel Partner',
      partner_firm_name: partnerUser.firm_name || '',
      partner_phone: partnerUser.phone || '',
      partner_phone2: partnerUser.phone2 || '',
      partner_email: partnerUser.email || '',
      visit_date: targetVisitDate,
      visit_time: body.visit_time || '11:00 AM',
      notes: defaultNotes,
      status: 'Upcoming',
      created_at: new Date().toISOString()
    };
    store.visits.unshift(scheduledVisit);

    saveDemoStore(store);
    return { ...newClient, scheduled_visit: scheduledVisit };
  }

  // GET /clients/:id
  if (endpoint.startsWith("/clients/") && method === "GET") {
    const id = parseInt(endpoint.split("/")[2]);
    const found = store.clients.find((c) => Number(c.id) === id);
    if (!found) return store.clients[0];
    const clientVisits = (store.visits || []).filter((v) => Number(v.client_id) === id);
    const clientComplaints = (store.complaints || []).filter((c) => Number(c.client_id) === id);
    const clientPayments = (store.payments || []).filter((p) => Number(p.client_id) === id);
    return {
      ...found,
      visits: clientVisits,
      complaints: clientComplaints,
      payments: clientPayments
    };
  }

  // PUT /clients/:id
  if (endpoint.startsWith("/clients/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = store.clients.findIndex((c) => Number(c.id) === id);
    if (idx !== -1) {
      store.clients[idx] = { ...store.clients[idx], ...body };
      saveDemoStore(store);
      return store.clients[idx];
    }
    return body;
  }

  // GET /visits
  if (endpoint === "/visits" && method === "GET") {
    const isExplicitAdmin = currentUser.role === 'admin' || (typeof window !== "undefined" && window.location && window.location.pathname.startsWith("/admin"));
    if (!isExplicitAdmin && currentUser.role === 'partner') {
      return store.visits.filter(v => Number(v.partner_id) === Number(currentUser.id) || !v.partner_id);
    }
    return store.visits;
  }

  // POST /visits
  if (endpoint === "/visits" && method === "POST") {
    const clientId = Number(body.client_id);
    const client = store.clients.find(c => Number(c.id) === clientId);
    const partnerId = client?.partner_id || (currentUser.role === 'partner' ? currentUser.id : 2);
    const partnerUser = store.users.find(u => Number(u.id) === Number(partnerId)) || currentUser;

    // If a visit already exists for this client, update it instead of adding multiple times
    const existingIdx = store.visits.findIndex(v => Number(v.client_id) === clientId);
    if (existingIdx !== -1) {
      const existing = store.visits[existingIdx];
      const combinedNotes = body.notes ? (existing.notes ? `${existing.notes} | ${body.notes}` : body.notes) : existing.notes;
      store.visits[existingIdx] = {
        ...existing,
        visit_date: body.visit_date,
        visit_time: body.visit_time || existing.visit_time || '11:00 AM',
        notes: combinedNotes,
        status: body.status || existing.status || 'Upcoming'
      };
      if (client && (client.status === 'Pending' || !client.status)) {
        client.status = 'Site Visit Planned';
      }
      saveDemoStore(store);
      return store.visits[existingIdx];
    }

    const newVisit = {
      id: Date.now(),
      client_id: clientId,
      client_name: client?.name || body.client_name || 'Client Visit',
      client_phone: client?.phone || body.client_phone || '',
      client_email: client?.email || body.client_email || '',
      client_address: client?.address || '',
      unit_type: client?.unit_type || body.unit_type || '',
      budget: client?.budget || body.budget || '',
      partner_id: partnerId,
      partner_name: client?.partner_name || partnerUser.name || 'Channel Partner',
      partner_firm_name: client?.firm_name || partnerUser.firm_name || '',
      partner_phone: client?.partner_phone || partnerUser.phone || '',
      partner_phone2: client?.partner_phone2 || partnerUser.phone2 || '',
      partner_email: client?.partner_email || partnerUser.email || '',
      visit_date: body.visit_date,
      visit_time: body.visit_time || '11:00 AM',
      notes: body.notes || '',
      status: body.status || 'Upcoming',
      created_at: new Date().toISOString()
    };
    store.visits.unshift(newVisit);

    // Update client status if needed
    if (client && (client.status === 'Pending' || !client.status)) {
      client.status = 'Site Visit Planned';
    }

    saveDemoStore(store);
    return newVisit;
  }

  // PUT /visits/:id
  if (endpoint.startsWith("/visits/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = store.visits.findIndex((v) => Number(v.id) === id);
    if (idx !== -1) {
      if (body.status) {
        const STAGE_ORDER = { upcoming: 0, scheduled: 0, visited: 1, completed: 1, followup: 2, revisited: 3, booked: 4, closed: 5 };
        const getWeight = (st) => STAGE_ORDER[String(st || '').toLowerCase().replace(/[\s-_]/g, '')] ?? 0;
        if (getWeight(body.status) < getWeight(store.visits[idx].status)) {
          const err = new Error(`Cannot revert visit status backwards in the flow from "${store.visits[idx].status}" to "${body.status}".`);
          err.status = 400;
          throw err;
        }
      }
      const updated = { ...store.visits[idx], ...body, updated_at: new Date().toISOString() };
      store.visits.splice(idx, 1);
      store.visits.unshift(updated);
      saveDemoStore(store);
      return updated;
    }
    return body;
  }

  // GET /complaints
  if (endpoint === "/complaints" && method === "GET") {
    if (currentUser.role === 'partner') {
      return store.complaints.filter(c => Number(c.partner_id) === Number(currentUser.id));
    }
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
    const idx = store.complaints.findIndex((c) => Number(c.id) === id);
    if (idx !== -1) {
      store.complaints[idx] = { ...store.complaints[idx], ...body };
      saveDemoStore(store);
      return store.complaints[idx];
    }
    return body;
  }

  // GET /payments
  if (endpoint === "/payments" && method === "GET") {
    if (currentUser.role === 'partner') {
      return store.payments.filter(p => Number(p.partner_id) === Number(currentUser.id));
    }
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
    const idx = store.payments.findIndex((p) => Number(p.id) === id);
    if (idx !== -1) {
      store.payments[idx] = { ...store.payments[idx], ...body };
      saveDemoStore(store);
      return store.payments[idx];
    }
    return body;
  }

  // GET /bills
  if (endpoint === "/bills" && method === "GET") {
    if (currentUser.role === 'partner') {
      return (store.bills || []).filter(b => Number(b.partner_id) === Number(currentUser.id));
    }
    return store.bills || [];
  }

  // POST /bills
  if (endpoint === "/bills" && method === "POST") {
    const agreement = Number(body.agreement_value) || 0;
    const brokerage = Number(body.brokerage_percent) || 0;
    const total = Number(((agreement * brokerage) / 100).toFixed(2));
    const newBill = {
      id: Date.now(),
      partner_id: currentUser.role === 'partner' ? currentUser.id : (body.partner_id || 2),
      partner_name: currentUser.name || "Channel Partner",
      partner_firm_name: currentUser.firm_name || "Realty Advisory",
      partner_phone: currentUser.phone || "+91 98200 12345",
      partner_email: currentUser.email || "cp@realty.com",
      client_id: body.client_id || null,
      client_name: body.client_name || "Client",
      purchase_details: body.purchase_details || "",
      agreement_value: agreement,
      brokerage_percent: brokerage,
      total_bill: total,
      account_details: body.account_details || "",
      account_holder_name: body.account_holder_name || currentUser.name,
      account_no: String(body.account_no || '').trim(),
      ifsc_code: String(body.ifsc_code || '').trim().toUpperCase(),
      branch: body.branch || "",
      status: "pending",
      paid_date: null,
      payment_reference: null,
      created_at: new Date().toISOString()
    };
    if (!store.bills) store.bills = [];
    store.bills.unshift(newBill);
    saveDemoStore(store);
    return newBill;
  }

  // PUT /bills/:id/pay
  if (endpoint.startsWith("/bills/") && endpoint.endsWith("/pay") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2]);
    const idx = (store.bills || []).findIndex(b => Number(b.id) === id);
    if (idx !== -1) {
      store.bills[idx] = {
        ...store.bills[idx],
        status: "paid",
        paid_date: body.paid_date || new Date().toISOString().slice(0, 10),
        payment_reference: body.payment_reference || "Online Payout"
      };
      saveDemoStore(store);
      return store.bills[idx];
    }
    return { status: "paid" };
  }

  // GET /admin/dashboard
  if (endpoint === "/admin/dashboard") {
    const scheduled = store.visits.filter((v) => (v.status || '').toLowerCase() === 'scheduled').length;
    return {
      totalPartners: store.users.filter((u) => u.role === "partner").length,
      totalClients: store.clients.length,
      totalVisits: store.visits.length,
      openComplaints: store.complaints.filter((c) => (c.status || '').toLowerCase() !== 'resolved').length,
      pendingPayments: 0,
      totalPaid: 0,
      stats: {
        totalPartners: store.users.filter((u) => u.role === "partner").length,
        totalClients: store.clients.length,
        totalVisits: store.visits.length,
        activeClients: store.clients.length,
        totalBookings: store.clients.filter((c) => c.status === "Booking Done").length,
        scheduledVisits: scheduled
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
// Core Request Handler (Strict Cloud Backend with Real Error Handling)
// -------------------------------------------------------------
async function request(endpoint, options = {}) {
  let token = localStorage.getItem("token");
  
  // Clean up any stale or mock tokens
  if (token && token.startsWith("demo-jwt-token-")) {
    console.warn("Purging legacy mock demo token to enforce live cloud API authentication");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ps_demo_store");
    token = null;
    if (typeof window !== "undefined" && window.location && !window.location.pathname.includes("/login")) {
      const isAdmin = window.location.pathname.startsWith("/admin");
      window.location.href = isAdmin ? "/admin/login?expired=1" : "/login?expired=1";
      return;
    }
  }

  // Check auth requirement for protected endpoints
  const isPublic = endpoint.startsWith("/auth/login") || endpoint.startsWith("/auth/register") || endpoint === "/health";
  if (!token && !isPublic) {
    if (typeof window !== "undefined" && window.location && !window.location.pathname.includes("/login")) {
      const isAdmin = window.location.pathname.startsWith("/admin");
      window.location.href = isAdmin ? "/admin/login?auth=required" : "/login?auth=required";
    }
    throw new Error("Authentication required. Please log in.");
  }

  const baseUrl = getBaseUrl();

  // If no base URL is defined (e.g. offline static preview without cloud backend):
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

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes("/auth/login")) {
        console.warn("Session token expired or invalid (401). Clearing session and redirecting.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("ps_demo_store");
        if (typeof window !== "undefined" && window.location && !window.location.pathname.includes("/login")) {
          const isAdmin = window.location.pathname.startsWith("/admin");
          window.location.href = isAdmin ? "/admin/login?expired=1" : "/login?expired=1";
        }
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    const method = (options.method || "GET").toUpperCase();
    if (method !== "GET") {
      console.log(`[Cloud MySQL API] ${method} ${endpoint} -> 200 OK`, data);
    }

    return data;
  } catch (err) {
    // Log failure and propagate genuine error without silently diverting to localStorage mock store
    console.warn(`API ${endpoint} failed against ${baseUrl}:`, err.message);
    throw err;
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

  getBills: () => request("/bills"),

  createBill: (data) =>
    request("/bills", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  payBill: (id, data) =>
    request(`/bills/${id}/pay`, {
      method: "PUT",
      body: JSON.stringify(data || {})
    }),

  getAdminDashboard: () => request("/admin/dashboard"),

  getAdminPartners: () => request("/admin/partners"),

  getUserProfile: (id) => request(`/auth/user/${id}`),

  getAdminInfo: () => request("/auth/admin-info")
};