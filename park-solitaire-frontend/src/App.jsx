import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, CalendarDays, Check, CheckCircle2, ChevronRight,
  CircleDollarSign, ClipboardList, Edit, FileWarning, Home, Lock,
  LogIn, LogOut, Menu, MessageSquare, MoreHorizontal, Plus, Search,
  Send, Settings, Users, X, Phone, Mail, MapPin, Building, Tag,
  UserCheck, ShieldAlert, Clock, FileText, Landmark, CreditCard,
  BarChart2, TrendingUp
} from 'lucide-react';
import { api, getServerUrl, setServerUrl } from './api';

function Logo({ light = false, large = false, full = false }) {
  if (full) {
    return (
      <div className={`logo logo-full ${light ? 'logo-light' : ''} ${large ? 'logo-lg' : ''}`}>
        <img
          src="/logo.png"
          alt="Park Solitaire Lifespaces LLP"
          className="brand-logo-img"
        />
      </div>
    );
  }

  return (
    <div className={`logo ${light ? 'logo-light' : ''} ${large ? 'logo-lg' : ''}`}>
      <div className="logo-emblem">
        <img
          src="/logo-emblem.png"
          alt="Park Solitaire Emblem"
          className="logo-emblem-img"
        />
      </div>
      <div className="brand-text-block">
        <strong className="brand-name">PARK SOLITAIRE</strong>
        <span className="brand-tagline">LIFESPACES LLP</span>
      </div>
    </div>
  );
}

const UserModalContext = React.createContext({
  openUserDetails: () => {}
});

function useUserModal() {
  return React.useContext(UserModalContext);
}

function triggerUserDetails(userData) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-user-details', { detail: userData }));
  }
}

function UserDetailsModal({ user: initialUser, onClose }) {
  const [userData, setUserData] = useState(initialUser || {});
  const [copiedField, setCopiedField] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserData(initialUser || {});
    // If user has ID and contact fields are missing, fetch fresh record from API
    if (initialUser?.id && (!initialUser.email || !initialUser.phone || !initialUser.firm_name)) {
      setLoading(true);
      api.getUserProfile(initialUser.id)
        .then((fresh) => {
          if (fresh) setUserData((prev) => ({ ...prev, ...fresh }));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (
      (initialUser?.role === 'admin' || initialUser?.name?.toLowerCase().includes('admin')) &&
      (!initialUser?.phone || !initialUser?.email)
    ) {
      setLoading(true);
      api.getAdminInfo()
        .then((fresh) => {
          if (fresh) setUserData((prev) => ({ ...prev, ...fresh }));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialUser]);

  const copyToClipboard = (text, field) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const isCP = (userData.role === 'partner') || (!userData.role && !userData.name?.toLowerCase().includes('admin'));
  const roleLabel = isCP ? 'Channel Partner' : 'System Administrator';
  const displayName = userData.name || (isCP ? 'Channel Partner' : 'System Administrator');
  const avatarLetter = (displayName || 'U').charAt(0).toUpperCase();
  const rawPhone = (userData.phone || '').replace(/[^0-9+]/g, '');
  const waPhone = (userData.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box user-profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Banner */}
        <div className={`user-modal-banner ${isCP ? 'banner-cp' : 'banner-admin'}`}>
          <div className="user-modal-avatar-container">
            <span className={`user-modal-avatar-lg ${isCP ? 'av-cp' : 'av-admin'}`}>
              {avatarLetter}
            </span>
            <span className={`user-modal-status-badge ${isCP ? 'badge-partner-tag' : 'badge-admin-tag'}`}>
              {isCP ? '🏢 Channel Partner' : '🛡️ System Admin'}
            </span>
          </div>
          <button type="button" className="user-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="user-modal-content">
          <div className="user-modal-header-info">
            <h2 className="user-modal-title">{displayName}</h2>
            {isCP && userData.firm_name && (
              <div className="user-modal-firm-badge">
                <Building size={14} />
                <span>{userData.firm_name}</span>
              </div>
            )}
            <span className="user-modal-sub">
              {isCP ? 'Park Solitaire Authorized Channel Partner' : 'Park Solitaire Management & System Support'}
            </span>
          </div>

          <div className="user-info-cards-list">
            {/* Email / Mail ID */}
            <div className="user-info-card-item">
              <div className="user-info-card-icon icon-mail">
                <Mail size={17} />
              </div>
              <div className="user-info-card-text">
                <span className="info-label">Mail ID (Email)</span>
                {userData.email ? (
                  <a href={`mailto:${userData.email}`} className="info-val info-link">
                    {userData.email}
                  </a>
                ) : (
                  <span className="info-val text-muted">
                    {loading ? 'Loading mail ID...' : (isCP ? 'Not provided' : 'admin@parksolitaire.com')}
                  </span>
                )}
              </div>
              {(userData.email || (!isCP && !loading)) && (
                <button
                  type="button"
                  className="user-copy-action-btn"
                  onClick={() => copyToClipboard(userData.email || 'admin@parksolitaire.com', 'email')}
                  title="Copy Mail ID"
                >
                  {copiedField === 'email' ? (
                    <span className="copied-text"><Check size={13} /> Copied</span>
                  ) : (
                    <ClipboardList size={15} />
                  )}
                </button>
              )}
            </div>

            {/* Primary Mobile Number */}
            <div className="user-info-card-item">
              <div className="user-info-card-icon icon-phone">
                <Phone size={17} />
              </div>
              <div className="user-info-card-text">
                <span className="info-label">Mobile Number</span>
                {userData.phone ? (
                  <a href={`tel:${rawPhone}`} className="info-val info-link">
                    {userData.phone}
                  </a>
                ) : (
                  <span className="info-val text-muted">
                    {loading ? 'Loading phone...' : (isCP ? 'Not provided' : '+91 98200 12345')}
                  </span>
                )}
              </div>
              {(userData.phone || (!isCP && !loading)) && (
                <button
                  type="button"
                  className="user-copy-action-btn"
                  onClick={() => copyToClipboard(userData.phone || '+91 98200 12345', 'phone')}
                  title="Copy Mobile Number"
                >
                  {copiedField === 'phone' ? (
                    <span className="copied-text"><Check size={13} /> Copied</span>
                  ) : (
                    <ClipboardList size={15} />
                  )}
                </button>
              )}
            </div>

            {/* Alternate Mobile Number */}
            {userData.phone2 && (
              <div className="user-info-card-item">
                <div className="user-info-card-icon icon-phone-alt">
                  <Phone size={17} />
                </div>
                <div className="user-info-card-text">
                  <span className="info-label">Alternate Mobile Number</span>
                  <a href={`tel:${userData.phone2.replace(/[^0-9+]/g, '')}`} className="info-val info-link">
                    {userData.phone2}
                  </a>
                </div>
                <button
                  type="button"
                  className="user-copy-action-btn"
                  onClick={() => copyToClipboard(userData.phone2, 'phone2')}
                  title="Copy Alternate Mobile Number"
                >
                  {copiedField === 'phone2' ? (
                    <span className="copied-text"><Check size={13} /> Copied</span>
                  ) : (
                    <ClipboardList size={15} />
                  )}
                </button>
              </div>
            )}

            {/* Contact Person Name (if CP has separate contact person) */}
            {isCP && userData.contact_name && (
              <div className="user-info-card-item">
                <div className="user-info-card-icon icon-user">
                  <Users size={17} />
                </div>
                <div className="user-info-card-text">
                  <span className="info-label">Contact Person</span>
                  <span className="info-val">{userData.contact_name}</span>
                </div>
              </div>
            )}

            {/* Designation & Status */}
            <div className="user-info-card-item">
              <div className="user-info-card-icon icon-shield">
                <ShieldAlert size={17} />
              </div>
              <div className="user-info-card-text">
                <span className="info-label">Designation & Status</span>
                <span className="info-val">
                  {roleLabel} • <span className="status-badge-active">● Active Account</span>
                </span>
              </div>
            </div>

            {/* Registration Date */}
            {userData.created_at && (
              <div className="user-info-card-item">
                <div className="user-info-card-icon icon-clock">
                  <Clock size={17} />
                </div>
                <div className="user-info-card-text">
                  <span className="info-label">Registered Member Since</span>
                  <span className="info-val">
                    {new Date(userData.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Contact Actions: Call, WhatsApp, Email */}
          <div className="user-quick-contact-grid">
            {(userData.phone || !isCP) && (
              <a
                href={`tel:${rawPhone || '+919820012345'}`}
                className="btn-contact-action btn-call-action"
                title="Call via phone"
              >
                <Phone size={15} />
                <span>Call Now</span>
              </a>
            )}
            {(userData.phone || !isCP) && (
              <a
                href={`https://wa.me/${waPhone.length === 10 ? `91${waPhone}` : (waPhone || '919820012345')}`}
                target="_blank"
                rel="noreferrer"
                className="btn-contact-action btn-wa-action"
                title="Open WhatsApp Chat"
              >
                <MessageSquare size={15} />
                <span>WhatsApp</span>
              </a>
            )}
            {(userData.email || !isCP) && (
              <a
                href={`mailto:${userData.email || 'admin@parksolitaire.com'}`}
                className="btn-contact-action btn-email-action"
                title="Send Email"
              >
                <Mail size={15} />
                <span>Send Mail</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let target = '/login';
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        target = u.role === 'admin' ? '/admin/dashboard' : '/partner/dashboard';
      } catch {}
    }
    const t = setTimeout(() => navigate(target), 1400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-building-art">
        {Array.from({ length: 16 }).map((_, i) => (
          <div className="splash-window" key={i} />
        ))}
      </div>

      <div className="splash-content">
        <div className="splash-logo-card">
          <img
            src="/logo.png"
            alt="Park Solitaire Lifespaces LLP"
            className="splash-logo-img"
          />
        </div>
        <div className="splash-badge-sub">Channel Partner & Admin Portal</div>
      </div>
    </div>
  );
}

function Auth({ children }) {
  return (
    <div className="auth">
      <div className="authbox">
        <Logo full large />
        {children}
      </div>
    </div>
  );
}

function Login({ defaultRole = 'partner' }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === '1') {
      setError('Your previous session expired or was reset. Please log in to connect directly to Railway MySQL.');
    } else if (params.get('auth') === 'required') {
      setError('Please log in with your credentials to access and update database records.');
    } else {
      setError('');
    }
  }, [defaultRole]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(role === 'admin' ? 'Please enter Admin ID and password.' : 'Please enter both email/ID and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email: email.trim(), password, role });

      if (role === 'admin' && res.user.role !== 'admin') {
        setError('Access denied: Channel Partner credentials cannot be used for Admin login.');
        return;
      }
      if (role === 'partner' && res.user.role !== 'partner') {
        setError('Access denied: Admin accounts must log in via the Admin tab.');
        return;
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/partner/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTab = (newRole) => {
    setRole(newRole);
    setError('');
    navigate(newRole === 'admin' ? '/admin/login' : '/login', { replace: true });
  };

  return (
    <Auth>
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={role === 'partner' ? 'on' : ''}
          onClick={() => handleSwitchTab('partner')}
        >
          Channel Partner
        </button>
        <button
          type="button"
          className={role === 'admin' ? 'on' : ''}
          onClick={() => handleSwitchTab('admin')}
        >
          Admin
        </button>
      </div>

      {role === 'admin' ? (
        <>
          <div className="admin-login-badge">
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ textAlign: 'center', marginTop: '0', color: '#075c4d' }}>Admin Login</h1>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>
            Restricted portal for system administrators only
          </p>
        </>
      ) : (
        <>
          <h1 style={{ color: '#075c4d', marginTop: 0 }}>Welcome Back!</h1>
          <p style={{ marginBottom: '20px' }}>Log in to access your portal</p>
        </>
      )}

      {error && <div className="err-msg">{error}</div>}

      <form onSubmit={handleLogin}>
        <label>{role === 'admin' ? 'Admin ID' : 'Mobile No / C.P Firm Email'}</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={role === 'admin' ? 'admin@parksolitaire.com' : 'e.g. Enter your mobile number or email'}
        />

        <label>Password</label>
        <div className="pw">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={role === 'admin' ? 'Enter admin password' : 'Enter your password'}
          />
          <Lock size={15} />
        </div>

        {role === 'partner' && <div className="forgot">Forgot Password?</div>}

        <button type="submit" className="primary" disabled={loading} style={{ marginTop: role === 'admin' ? '20px' : '0' }}>
          <LogIn size={16} />
          {loading ? 'Verifying...' : role === 'admin' ? 'Verify & Continue' : 'Login'}
        </button>
      </form>

      {role === 'partner' ? (
        <div className="foot">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      ) : (
        <div className="foot">
          <button type="button" className="linkbtn" onClick={() => handleSwitchTab('partner')}>
            Switch to Channel Partner Login
          </button>
        </div>
      )}
    </Auth>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firm_name: '',
    name: '',
    phone: '',
    phone2: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!form.firm_name.trim() || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setError('Firm Name, C.P Name, Email, Contact no, and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(form);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth>
      <Link className="back" to="/login">
        <ArrowLeft size={15} /> Back
      </Link>
      <h1 style={{ color: '#075c4d', marginTop: 0 }}>Create Account</h1>
      <p style={{ marginBottom: '18px' }}>Join as a Channel Partner</p>

      {error && <div className="err-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Firm Name *</label>
        <input
          type="text"
          required
          value={form.firm_name}
          onChange={(e) => setForm({ ...form, firm_name: e.target.value })}
          placeholder="Enter agency / firm name"
        />

        <label>C.P Name *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter channel partner name"
        />

        <label>Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Enter email address"
        />

        <label>Contact no *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Enter contact number"
        />

        <label>Alternate number <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '11.5px' }}>(Optional)</span></label>
        <input
          type="tel"
          value={form.phone2}
          onChange={(e) => setForm({ ...form, phone2: e.target.value })}
          placeholder="Enter alternate number"
        />

        <label>Create Password *</label>
        <div className="pw">
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Create password"
          />
          <Lock size={15} />
        </div>

        <button type="submit" className="primary" style={{ marginTop: '16px' }} disabled={loading}>
          {loading ? 'Registering...' : 'Register Channel Partner'}
        </button>
      </form>

      <div className="foot">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </Auth>
  );
}

function Drawer({ isOpen, onClose, user, onLogout }) {
  const l = useLocation();
  const { openUserDetails } = useUserModal();
  const prefix = user.role === 'admin' ? '/admin' : '/partner';
  const items = [
    { path: `${prefix}/dashboard`, title: 'Dashboard', icon: Home, desc: 'Overview & key metrics' },
    { path: `${prefix}/clients`, title: user.role === 'admin' ? 'All Clients' : 'My Clients', icon: Users, desc: 'Client leads, bookings & details' },
    { path: `${prefix}/visits`, title: 'Site Visits', icon: CalendarDays, desc: 'Schedules & visit timeline' },
    { path: `${prefix}/complaints`, title: 'Complaints', icon: FileWarning, desc: 'Raise & track issues' },
    { path: `${prefix}/payments`, title: 'Payments & Payouts', icon: CircleDollarSign, desc: 'Commissions & transactions' },
  ];
  if (user.role === 'admin') {
    items.push({ path: `${prefix}/partners`, title: 'Channel Partners', icon: Building, desc: 'Registered partner network' });
  }

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <Logo />
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div
          className="drawer-user-card clickable-profile"
          onClick={() => {
            openUserDetails(user);
            onClose();
          }}
          title="Click to view your profile details (Mail, Mobile, Firm)"
          role="button"
          tabIndex={0}
        >
          <span className="drawer-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</span>
          <div className="drawer-user-details">
            <strong>{user.name}</strong>
            {user.firm_name && (
              <small style={{ color: '#075c4d', fontWeight: 600, display: 'block' }}>🏢 {user.firm_name}</small>
            )}
            <small>{user.email || (user.role === 'admin' ? 'admin@parksolitaire.com' : 'Partner Portal')}</small>
            <span className={`drawer-role-badge ${user.role === 'admin' ? 'role-admin' : 'role-partner'}`}>
              {user.role === 'admin' ? 'Administrator' : 'Channel Partner'}
            </span>
          </div>
          <ChevronRight size={16} className="drawer-nav-arrow" />
        </div>

        {user.role === 'partner' && (
          <button
            type="button"
            className="drawer-admin-contact-btn"
            onClick={() => {
              api.getAdminInfo()
                .then((admin) => {
                  openUserDetails(admin);
                  onClose();
                })
                .catch(() => {
                  openUserDetails({
                    name: 'System Administrator',
                    email: 'admin@parksolitaire.com',
                    phone: '+91 98200 12345',
                    role: 'admin'
                  });
                  onClose();
                });
            }}
            title="Click to view Administrator contact details"
          >
            <ShieldAlert size={15} />
            <span>Admin Contact & Support</span>
          </button>
        )}

        <div className="drawer-menu-section-title">PORTAL NAVIGATION</div>

        <nav className="drawer-nav-list">
          {items.map(({ path, title, icon: Icon, desc }) => {
            const isSel = l.pathname === path || (path !== `${prefix}/dashboard` && l.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`drawer-nav-link ${isSel ? 'sel' : ''}`}
                onClick={onClose}
              >
                <div className="drawer-nav-icon-wrap">
                  <Icon size={18} />
                </div>
                <div className="drawer-nav-link-text">
                  <span className="drawer-nav-title">{title}</span>
                  <span className="drawer-nav-desc">{desc}</span>
                </div>
                <ChevronRight size={16} className="drawer-nav-arrow" />
              </Link>
            );
          })}
        </nav>

        <div className="drawer-footer">
          <button type="button" className="drawer-logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function NavDesktop({ role = 'partner' }) {
  const l = useLocation();
  const prefix = role === 'admin' ? '/admin' : '/partner';
  const items = [
    { path: `${prefix}/dashboard`, label: 'Dashboard', icon: Home },
    { path: `${prefix}/clients`, label: role === 'admin' ? 'All Clients' : 'Clients', icon: Users },
    { path: `${prefix}/visits`, label: 'Visits', icon: CalendarDays },
    { path: `${prefix}/complaints`, label: 'Complaints', icon: FileWarning },
    { path: `${prefix}/payments`, label: 'Payments', icon: CircleDollarSign },
  ];
  if (role === 'admin') {
    items.push({ path: `${prefix}/partners`, label: 'Partners', icon: Building });
  }

  return (
    <nav className="nav-desktop">
      {items.map(({ path, label, icon: Icon }) => {
        const isSel = l.pathname === path || (path !== `${prefix}/dashboard` && l.pathname.startsWith(path));
        return (
          <Link
            className={`nav-desktop-item ${isSel ? 'active' : ''}`}
            to={path}
            key={path}
          >
            <Icon size={16} className="nav-item-icon" />
            <span className="nav-item-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function NavMobile({ role = 'partner', onOpenMore }) {
  const l = useLocation();
  const prefix = role === 'admin' ? '/admin' : '/partner';
  const items = [
    { path: `${prefix}/dashboard`, label: 'Home', icon: Home },
    { path: `${prefix}/clients`, label: 'Clients', icon: Users },
    { path: `${prefix}/visits`, label: 'Visits', icon: CalendarDays },
    { path: `${prefix}/complaints`, label: 'Complaints', icon: FileWarning },
  ];

  if (role === 'admin') {
    items.push({ path: `${prefix}/partners`, label: 'Partners', icon: Building });
  } else {
    items.push({ path: `${prefix}/payments`, label: 'Payments', icon: CircleDollarSign });
  }

  return (
    <nav className="nav-mobile-bottom-bar">
      {items.map(({ path, label, icon: Icon }) => {
        const isSel = l.pathname === path || (path !== `${prefix}/dashboard` && l.pathname.startsWith(path));
        return (
          <Link
            className={`nav-mobile-btn ${isSel ? 'active' : ''}`}
            to={path}
            key={path}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        className="nav-mobile-btn nav-mobile-menu-btn"
        onClick={onOpenMore}
        aria-label="Open menu drawer"
      >
        <Menu size={19} />
        <span>Menu</span>
      </button>
    </nav>
  );
}

function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openUserDetails } = useUserModal();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const userStr = localStorage.getItem('user');
  let user = { name: 'User', role: 'partner', email: '' };
  try {
    if (userStr) user = JSON.parse(userStr);
  } catch {}

  const handleLogout = () => {
    const wasAdmin = user?.role === 'admin';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate(wasAdmin ? '/admin/login' : '/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdminPath = location.pathname.startsWith('/admin');
    if (!token) {
      navigate(isAdminPath ? '/admin/login' : '/login', { replace: true });
      return;
    }
    if (isAdminPath && user.role !== 'admin') {
      navigate('/admin/login', { replace: true });
    }
  }, [location.pathname, user.role, navigate]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-Time Server-Sent Events (SSE) stream listener + cross-tab storage sync
  useEffect(() => {
    const apiUrl = getServerUrl();
    const eventsUrl = apiUrl ? `${apiUrl}/events` : '';
    let eventSource = null;

    if (eventsUrl) {
      try {
        eventSource = new EventSource(eventsUrl);
        eventSource.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload && payload.type && payload.type !== 'CONNECTED') {
              const dataObj = payload.payload || payload.data || {};
              const targetPartnerId = dataObj.targetPartnerId;

              // Channel Partner targeting privacy:
              if (user.role === 'partner' && targetPartnerId && Number(user.id) !== Number(targetPartnerId)) {
                return; // Do NOT reflect to other channel partners
              }

              const id = Date.now() + Math.random();
              let category = 'visit';
              if (payload.type.includes('CLIENT')) category = 'client';
              if (payload.type.includes('COMPLAINT')) category = 'complaint';
              if (payload.type.includes('PAYMENT')) category = 'payment';

              const newToast = {
                id,
                type: category,
                title: payload.type.replace(/_/g, ' '),
                message: payload.message || payload.data?.message || payload.payload?.message || 'Real-time update received from server',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };

              setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
              }, 6000);

              // Broadcast custom event so active views refresh immediately without page reload
              window.dispatchEvent(new CustomEvent('portal-refresh', { detail: payload }));
            }
          } catch (err) {}
        };
        eventSource.onerror = () => {
          // SSE natively auto-reconnects
        };
      } catch (err) {}
    }

    // Cross-tab synchronization (e.g. CP in one window schedules visit, Admin in another updates instantly)
    const handleStorageChange = (e) => {
      if (e.key === 'ps_demo_store' || e.key === 'token') {
        window.dispatchEvent(new CustomEvent('portal-refresh', { detail: { type: 'STORAGE_UPDATE' } }));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Fallback heartbeat polling interval (6s)
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('portal-refresh', { detail: { type: 'HEARTBEAT' } }));
    }, 6000);

    return () => {
      if (eventSource) eventSource.close();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const homeUrl = user.role === 'admin' ? '/admin/dashboard' : '/partner/dashboard';

  return (
    <div className="shell-layout">
      {/* Floating Real-Time Notifications */}
      <div className="floating-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`floating-toast toast-${t.type}`}>
            <div className="toast-icon">⚡</div>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              <div className="toast-desc">{t.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile / Tablet Drawer Menu */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Modern Top Header */}
      <header className="app-header">
        <div className="header-left">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Link to={homeUrl} className="logo-link">
            <Logo />
          </Link>
        </div>

        <NavDesktop role={user.role} />

        <div className="header-right">
          <div
            className="user-profile-badge clickable-profile"
            onClick={() => openUserDetails(user)}
            title="Click to view your profile details (Mail, Mobile, Firm)"
            role="button"
            tabIndex={0}
          >
            <span className="user-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</span>
            <div className="user-info-text">
              <span className="user-display-name">{user.name}</span>
              <span className={`user-role-tag ${user.role === 'admin' ? 'role-admin' : 'role-partner'}`}>
                {user.role === 'admin' ? 'ADMIN' : 'PARTNER'}
              </span>
            </div>
          </div>
          <button type="button" className="header-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={15} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="app-main-content">
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <NavMobile role={user.role} onOpenMore={() => setDrawerOpen(true)} />
    </div>
  );
}

function Stat({ title, value, Icon, link }) {
  const content = (
    <div className="stat">
      <div className="staticon"><Icon size={17} /></div>
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
        <em>Live Database</em>
      </div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

function formatTimeAgo(dateInput) {
  if (!dateInput) return 'Just now';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Recently';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getVisitDayClassification(visitDate) {
  if (!visitDate) return { isToday: false, isTomorrow: false, formattedDate: '' };

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const tmrw = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = `${tmrw.getFullYear()}-${pad(tmrw.getMonth() + 1)}-${pad(tmrw.getDate())}`;

  const rawStr = String(visitDate).trim();
  const datePrefix = rawStr.slice(0, 10);

  if (datePrefix === todayStr) {
    return { isToday: true, isTomorrow: false, formattedDate: 'Today' };
  }
  if (datePrefix === tomorrowStr) {
    return { isToday: false, isTomorrow: true, formattedDate: 'Tomorrow' };
  }

  // Parse via Date object in local and UTC timezones
  const d = new Date(visitDate);
  if (!isNaN(d.getTime())) {
    const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (localStr === todayStr) return { isToday: true, isTomorrow: false, formattedDate: 'Today' };
    if (localStr === tomorrowStr) return { isToday: false, isTomorrow: true, formattedDate: 'Tomorrow' };

    const utcStr = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    if (utcStr === todayStr) return { isToday: true, isTomorrow: false, formattedDate: 'Today' };
    if (utcStr === tomorrowStr) return { isToday: false, isTomorrow: true, formattedDate: 'Tomorrow' };

    return {
      isToday: false,
      isTomorrow: false,
      formattedDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    };
  }

  return { isToday: false, isTomorrow: false, formattedDate: datePrefix };
}

const VISIT_STAGES_FLOW = ['Upcoming', 'Visited', 'FollowUp', 'Revisited', 'Booked', 'Closed'];

function isVisitStatusLocked(status) {
  if (!status) return false;
  const clean = String(status).toLowerCase().replace(/[\s-_]/g, '');
  return clean === 'booked' || clean === 'closed';
}

function getStageWeight(st) {
  if (!st) return 0;
  const clean = String(st).toLowerCase().replace(/[\s-_]/g, '');
  if (clean === 'upcoming' || clean === 'scheduled' || clean === 'upcomingvisit') return 0;
  if (clean === 'visited' || clean === 'completed') return 1;
  if (clean === 'followup') return 2;
  if (clean === 'revisited') return 3;
  if (clean === 'booked') return 4;
  if (clean === 'closed') return 5;
  return 0;
}

function getForwardStages(currentStatus) {
  if (isVisitStatusLocked(currentStatus)) {
    return [currentStatus];
  }
  const currentWeight = getStageWeight(currentStatus);
  return VISIT_STAGES_FLOW.filter((st) => getStageWeight(st) >= currentWeight);
}

function ClientVisitsWidget({
  admin = false,
  visits = [],
  clientsList = [],
  prefix = '/partner',
  openUserDetails,
  onUpdateStatus,
  onOpenSchedule
}) {
  const [activeTab, setActiveTab] = useState('today');

  const sortByUpdated = (list) => [...list].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || a.visit_date || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || b.visit_date || 0).getTime();
    return timeB - timeA;
  });

  const sortedVisits = sortByUpdated(visits);
  const todayVisits = sortedVisits.filter((v) => getVisitDayClassification(v.visit_date).isToday);
  const tomorrowVisits = sortedVisits.filter((v) => getVisitDayClassification(v.visit_date).isTomorrow);
  const currentList = activeTab === 'today' ? todayVisits : (activeTab === 'tomorrow' ? tomorrowVisits : sortedVisits);

  const now = new Date();
  const tmrw = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayDateFormatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const tomorrowDateFormatted = tmrw.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="upcoming-visits-widget">
      {/* Header with live pulsing badge and quick summary */}
      <div className="upcoming-visits-header">
        <div className="upcoming-visits-title-col">
          <div className="visits-badge-pill-row">
            <span className="live-pulsing-badge">
              <span className="live-dot" /> Live Schedule
            </span>
            <span className="visits-summary-pill">
              <strong>{todayVisits.length}</strong> Today ({todayDateFormatted}) • <strong>{tomorrowVisits.length}</strong> Tomorrow ({tomorrowDateFormatted}) • <strong>{visits.length}</strong> Total Visits
            </span>
          </div>
          <h3 className="upcoming-visits-title">Site Visits Schedule &amp; Activity</h3>
        </div>

        <div className="upcoming-visits-actions">
          <Link to={`${prefix}/visits`} className="view-all-link">
            All Visits ({visits.length})
          </Link>
        </div>
      </div>

      {/* Tab toggle: Today vs Tomorrow vs All */}
      <div className="visit-tab-toggle-bar">
        <button
          type="button"
          className={`visit-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <CalendarDays size={15} />
          <span>Today's Visits ({todayDateFormatted})</span>
          <span className={`visit-tab-count ${todayVisits.length > 0 ? 'highlight-today' : ''}`}>
            {todayVisits.length}
          </span>
        </button>

        <button
          type="button"
          className={`visit-tab-btn ${activeTab === 'tomorrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('tomorrow')}
        >
          <Clock size={15} />
          <span>Tomorrow's Visits ({tomorrowDateFormatted})</span>
          <span className={`visit-tab-count ${tomorrowVisits.length > 0 ? 'highlight-tomorrow' : ''}`}>
            {tomorrowVisits.length}
          </span>
        </button>

        <button
          type="button"
          className={`visit-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <CalendarDays size={15} />
          <span>All Scheduled Visits</span>
          <span className="visit-tab-count">
            {visits.length}
          </span>
        </button>
      </div>

      {/* Visits List */}
      <div className="upcoming-visits-list">
        {currentList.length === 0 ? (
          <div className="upcoming-visits-empty">
            <div className="empty-icon-circle">
              <CalendarDays size={26} />
            </div>
            <h4>
              {activeTab === 'today'
                ? `No visits scheduled for Today (${todayDateFormatted})`
                : activeTab === 'tomorrow'
                ? `No visits scheduled for Tomorrow (${tomorrowDateFormatted})`
                : 'No visits scheduled yet in the system'}
            </h4>
            <p>
              {activeTab === 'today'
                ? 'No client visits are booked for today yet.'
                : activeTab === 'tomorrow'
                ? 'No client visits booked for tomorrow yet.'
                : 'No site visits recorded in the system yet.'}
            </p>
          </div>
        ) : (
          currentList.map((v) => {
            const cleanPhone = v.client_phone ? v.client_phone.replace(/[^0-9+]/g, '') : '';
            const dayClassification = getVisitDayClassification(v.visit_date);
            const displayDay = dayClassification.formattedDate || (activeTab === 'today' ? 'Today' : activeTab === 'tomorrow' ? 'Tomorrow' : 'Scheduled');

            return (
              <div
                className={`visit-update-card ${(v.status || '').toLowerCase() === 'booked' || (v.status || '').toLowerCase() === 'closed' ? 'is-completed' : ''}`}
                key={v.id}
              >
                <div className="visit-card-top-row">
                  <div className="visit-time-chip">
                    <Clock size={13} />
                    <strong>{v.visit_time || '11:00 AM'}</strong>
                    <span className="visit-day-label">
                      {displayDay}
                    </span>
                  </div>

                  <div className="visit-status-controls">
                    <span className={`visit-status-pill status-${(v.status || 'Upcoming').toLowerCase()}`}>
                      {isVisitStatusLocked(v.status) ? '🔒 ' : ''}{v.status || 'Upcoming'}
                    </span>

                    {onUpdateStatus && !isVisitStatusLocked(v.status) && (
                      <select
                        className="status-dropdown"
                        value={v.status || 'Upcoming'}
                        onChange={(e) => onUpdateStatus(v.id, e.target.value)}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#075c4d' }}
                        title="Update visit status in MySQL"
                      >
                        {getForwardStages(v.status).map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="visit-card-body">
                  <div className="visit-client-header">
                    <Link
                      to={`${prefix}/clients/${v.client_id}`}
                      className="visit-client-name"
                      title="View client profile"
                    >
                      {v.client_name || 'Client Visit'}
                    </Link>

                    {(v.unit_type || v.client_unit_type) && (
                      <span className="visit-spec-pill unit-pill">
                        {v.unit_type || v.client_unit_type}
                      </span>
                    )}

                    {(v.budget || v.client_budget) && (
                      <span className="visit-spec-pill budget-pill">
                        {v.budget || v.client_budget}
                      </span>
                    )}
                  </div>

                  {/* Channel Partner row for Admin view */}
                  {admin && (v.partner_name || v.partner_firm_name) && (
                    <div
                      className="visit-partner-row clickable"
                      onClick={() => openUserDetails({
                        id: v.partner_id,
                        name: v.partner_name,
                        firm_name: v.partner_firm_name,
                        email: v.partner_email,
                        phone: v.partner_phone,
                        phone2: v.partner_phone2,
                        role: 'partner'
                      })}
                      title="Click to view Channel Partner phone & details"
                    >
                      <Building size={13} />
                      <span>
                        CP: <strong>{v.partner_name}</strong>
                        {v.partner_firm_name ? ` (${v.partner_firm_name})` : ''}
                      </span>
                      <small className="tap-hint">Tap for info</small>
                    </div>
                  )}

                  {/* Visit Agenda / Notes */}
                  {v.notes && (
                    <div className="visit-agenda-text">
                      <strong>Notes:</strong> {v.notes}
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="visit-contact-actions">
                    {v.client_phone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="contact-action-btn btn-call-client"
                        title={`Call client ${v.client_name}`}
                      >
                        <Phone size={13} />
                        <span>Call {v.client_phone}</span>
                      </a>
                    )}

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-action-btn btn-wa-client"
                        title="Open WhatsApp chat with client"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {admin && v.partner_phone && (
                      <a
                        href={`tel:${v.partner_phone.replace(/[^0-9+]/g, '')}`}
                        className="contact-action-btn btn-call-cp"
                        title={`Call Channel Partner ${v.partner_name}`}
                      >
                        <Phone size={13} />
                        <span>Call CP</span>
                      </a>
                    )}

                    <Link
                      to={`${prefix}/clients/${v.client_id}`}
                      className="contact-action-btn btn-view-profile"
                    >
                      <span>View Profile</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Dashboard({ admin = false }) {
  const { openUserDetails } = useUserModal();
  const userStr = localStorage.getItem('user');
  let user = { name: admin ? 'Admin' : 'Partner', role: admin ? 'admin' : 'partner' };
  try {
    if (userStr) user = JSON.parse(userStr);
  } catch {}

  const [stats, setStats] = useState(null);
  const [visits, setVisits] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [toast, setToast] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [newVisit, setNewVisit] = useState({
    client_id: '',
    visit_date: '',
    visit_time: '11:00 AM',
    notes: '',
    status: 'Upcoming'
  });
  const prefix = admin ? '/admin' : '/partner';

  const loadDashboardData = () => {
    if (admin) {
      api.getAdminDashboard().then(setStats).catch(() => {});
    }
    api.getClients().then((res) => { if (Array.isArray(res)) setClientsList(res); }).catch(() => {});
    api.getVisits().then((v) => setVisits(Array.isArray(v) ? v : [])).catch(() => {});
    api.getPayments().then((p) => { if (Array.isArray(p)) setPaymentsList(p); }).catch(() => {});
    api.getComplaints().then((c) => {
      if (Array.isArray(c)) setComplaintsList(c);
    }).catch(() => {});
  };

  useEffect(() => {
    loadDashboardData();
    const handleRefresh = () => {
      loadDashboardData();
    };
    window.addEventListener('portal-refresh', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    return () => {
      window.removeEventListener('portal-refresh', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, [admin]);

  const handleUpdateVisitStatus = async (visitId, newStatus) => {
    try {
      const currentVisit = visits.find((v) => Number(v.id) === Number(visitId));
      if (currentVisit) {
        if (isVisitStatusLocked(currentVisit.status)) {
          alert(`Status is already marked as "${currentVisit.status}". Once Booked or Closed, no further status changes are permitted.`);
          return;
        }
        const curW = getStageWeight(currentVisit.status);
        const tgtW = getStageWeight(newStatus);
        if (tgtW < curW) {
          alert(`Cannot revert visit status backwards in the flow from "${currentVisit.status}" to "${newStatus}". Progression is strictly forward.`);
          return;
        }
      }

      const nowIso = new Date().toISOString();
      setVisits((prev) => {
        const target = prev.find((v) => Number(v.id) === Number(visitId));
        if (!target) return prev;
        const updated = { ...target, status: newStatus, updated_at: nowIso };
        const others = prev.filter((v) => Number(v.id) !== Number(visitId));
        return [updated, ...others];
      });

      await api.updateVisit(visitId, { status: newStatus });
      setToast(`Visit marked as ${newStatus}!`);
      setTimeout(() => setToast(''), 3500);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update visit status');
      loadDashboardData();
    }
  };

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;

  const openScheduleModal = (presetDay = 'today') => {
    if (!admin) return;
    const targetDate = presetDay === 'tomorrow' ? tomorrowStr : todayStr;

    // Refresh client list if empty
    api.getClients().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setClientsList(res);
        setNewVisit((prev) => ({
          ...prev,
          client_id: prev.client_id || String(res[0].id)
        }));
      }
    }).catch(() => {});

    const firstClientId = clientsList && clientsList.length > 0 ? String(clientsList[0].id) : '';

    setNewVisit({
      client_id: firstClientId,
      visit_date: targetDate,
      visit_time: '11:00 AM',
      notes: '',
      status: 'Upcoming'
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newVisit.client_id) {
      alert('Please select a client from the list.');
      return;
    }
    if (!newVisit.visit_date) {
      alert('Please select a visit date.');
      return;
    }
    setScheduleSubmitting(true);
    try {
      await api.createVisit({
        client_id: Number(newVisit.client_id),
        visit_date: newVisit.visit_date,
        visit_time: newVisit.visit_time || '11:00 AM',
        notes: newVisit.notes || '',
        status: newVisit.status || 'Upcoming'
      });
      setShowScheduleModal(false);
      setToast('Visit successfully scheduled & saved to MySQL!');
      setTimeout(() => setToast(''), 4000);
      loadDashboardData();
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to schedule visit');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const rawActivities = [];
  (clientsList || []).slice(0, 4).forEach((c) => {
    rawActivities.push({
      id: `c-${c.id}`,
      title: 'New Client Added',
      subtitle: `${c.name} • ${c.unit_type || '2 BHK'}`,
      time: formatTimeAgo(c.created_at),
      timestamp: new Date(c.created_at || Date.now()).getTime(),
      Icon: UserCheck,
      color: '#059669',
      bg: '#dcfce7'
    });
  });

  (visits || []).slice(0, 4).forEach((v) => {
    rawActivities.push({
      id: `v-${v.id}`,
      title: v.status === 'completed' ? 'Site Visit Completed' : 'Site Visit Scheduled',
      subtitle: `${v.client_name || 'Client Visit'}${v.visit_time ? ` (${v.visit_time})` : ''}`,
      time: formatTimeAgo(v.created_at || v.visit_date),
      timestamp: new Date(v.created_at || v.visit_date || Date.now()).getTime(),
      Icon: CalendarDays,
      color: '#d97706',
      bg: '#fef3c7'
    });
  });

  (paymentsList || []).slice(0, 3).forEach((p) => {
    rawActivities.push({
      id: `p-${p.id}`,
      title: p.status === 'paid' ? 'Payment Received' : 'Payment Update',
      subtitle: `${p.client_name || 'Client'} • ₹ ${Number(p.amount).toLocaleString('en-IN')}`,
      time: formatTimeAgo(p.paid_date || p.created_at),
      timestamp: new Date(p.paid_date || p.created_at || Date.now()).getTime(),
      Icon: CircleDollarSign,
      color: '#0284c7',
      bg: '#e0f2fe'
    });
  });

  rawActivities.sort((a, b) => b.timestamp - a.timestamp);
  const displayActivities = rawActivities.length > 0 ? rawActivities.slice(0, 4) : [
    { id: 'def-1', title: 'New Client Added', subtitle: 'Rajesh Kumar • 3 BHK', time: '10m ago', Icon: UserCheck, color: '#059669', bg: '#dcfce7' },
    { id: 'def-2', title: 'Site Visit Completed', subtitle: 'Anita Verma • 2 BHK', time: '1h ago', Icon: CalendarDays, color: '#d97706', bg: '#fef3c7' },
    { id: 'def-3', title: 'Payment Received', subtitle: 'Token Amount • ₹ 1,50,000', time: '3h ago', Icon: CircleDollarSign, color: '#0284c7', bg: '#e0f2fe' }
  ];

  return (
    <Shell>
      {toast && (
        <div className="toast-msg">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      {admin && showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} style={{ color: '#075c4d' }} />
                <h3 style={{ margin: 0 }}>Schedule Client Visit</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowScheduleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-scroll-body">
                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Select Client *</label>
                  {(!clientsList || clientsList.length === 0) ? (
                    <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '12.5px' }}>
                      No clients registered yet. <Link to={`${prefix}/clients`} style={{ textDecoration: 'underline', fontWeight: 600, color: '#075c4d' }}>+ Add a Client first</Link>
                    </div>
                  ) : (
                    <select
                      value={String(newVisit.client_id || '')}
                      onChange={(e) => setNewVisit({ ...newVisit, client_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Client --</option>
                      {clientsList.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name} ({c.phone || 'No phone'} • {c.unit_type || '2 BHK'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Quick Date Selection Chips */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className={`time-preset-btn ${newVisit.visit_date === todayStr ? 'active' : ''}`}
                    onClick={() => setNewVisit({ ...newVisit, visit_date: todayStr })}
                  >
                    📅 Today
                  </button>
                  <button
                    type="button"
                    className={`time-preset-btn ${newVisit.visit_date === tomorrowStr ? 'active' : ''}`}
                    onClick={() => setNewVisit({ ...newVisit, visit_date: tomorrowStr })}
                  >
                    ⚡ Tomorrow
                  </button>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Visit Date *</label>
                    <input
                      type="date"
                      required
                      value={newVisit.visit_date}
                      onChange={(e) => setNewVisit({ ...newVisit, visit_date: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Visit Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:30 AM"
                      value={newVisit.visit_time}
                      onChange={(e) => setNewVisit({ ...newVisit, visit_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Visit Status</label>
                  <select
                    value={newVisit.status}
                    onChange={(e) => setNewVisit({ ...newVisit, status: e.target.value })}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Visited">Visited</option>
                    <option value="FollowUp">FollowUp</option>
                    <option value="Revisited">Revisited</option>
                    <option value="Booked">Booked</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Remarks / Visit Agenda</label>
                  <textarea
                    rows={3}
                    value={newVisit.notes}
                    onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                    placeholder="e.g. Site tour of 2 BHK show flat and review pricing breakdown"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={scheduleSubmitting}>
                  <Check size={16} /> {scheduleSubmitting ? 'Scheduling...' : 'Save Visit to MySQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {admin ? (
        <>
          {/* Admin Dashboard Header (Figma Screen 12) */}
          <div
            className="dashboard-header-figma clickable-profile"
            onClick={() => openUserDetails(user)}
            title="Click to view Administrator contact details"
            role="button"
            tabIndex={0}
          >
            <div>
              <h2 className="dashboard-user-greeting">
                <span className="greeting-name-link">Admin Dashboard</span>
              </h2>
              <small style={{ color: '#075c4d', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldAlert size={12} /> Click to view Admin contact details
              </small>
            </div>
            <div className="admin-lock-badge" title="Administrator">
              <Lock size={16} />
            </div>
          </div>

          {/* 2 Large Top Stat Cards */}
          <div className="admin-stats-grid-2">
            <Link to={`${prefix}/partners`} className="admin-stat-card-large">
              <small>Total Partners</small>
              <div className="admin-stat-number">{stats?.totalPartners ?? '128'}</div>
              <span className="admin-stat-growth">+12% this month</span>
            </Link>
            <Link to={`${prefix}/payments`} className="admin-stat-card-large">
              <small>Total Payment Approval</small>
              <div className="admin-stat-number">
                ₹ {stats?.totalPaid ? Number(stats.totalPaid).toLocaleString('en-IN') : '42,80,000'}
              </div>
              <span className="admin-stat-sub">Total Approved</span>
            </Link>
          </div>

          {/* 2 Small Stat Cards Below */}
          <div className="admin-stats-grid-2" style={{ marginTop: '12px' }}>
            <Link to={`${prefix}/clients`} className="admin-stat-card-small">
              <small>Total Clients</small>
              <strong>{stats?.totalClients ?? clientsList.length ?? '7'}</strong>
            </Link>
            <Link to={`${prefix}/visits`} className="admin-stat-card-small">
              <small>Site Visits</small>
              <strong>{stats?.totalVisits ?? visits.length ?? '8'}</strong>
            </Link>
          </div>

          {/* 4 Pastel Quick Actions for Admin */}
          <div className="quick-actions-pastel" style={{ marginTop: '16px' }}>
            <Link to={`${prefix}/clients`} className="quick-action-card card-clients">
              <div className="quick-action-icon-circle icon-clients"><Users size={20} /></div>
              <span>All Clients</span>
            </Link>
            <Link to={`${prefix}/visits`} className="quick-action-card card-visits">
              <div className="quick-action-icon-circle icon-visits"><CalendarDays size={20} /></div>
              <span>Site Visits</span>
            </Link>
            <Link to={`${prefix}/partners`} className="quick-action-card card-complaints">
              <div className="quick-action-icon-circle icon-complaints"><Building size={20} /></div>
              <span>Partners</span>
            </Link>
            <Link to={`${prefix}/payments`} className="quick-action-card card-payments">
              <div className="quick-action-icon-circle icon-payments"><CircleDollarSign size={20} /></div>
              <span>Payments</span>
            </Link>
          </div>

          {/* ⭐ Today & Tomorrow Client Visits Update Widget for Admin */}
          <ClientVisitsWidget
            admin={true}
            visits={visits}
            clientsList={clientsList}
            prefix={prefix}
            openUserDetails={openUserDetails}
            onUpdateStatus={handleUpdateVisitStatus}
            onOpenSchedule={openScheduleModal}
          />

          {/* Recent Activity Log Section */}
          <div className="section-header-figma">
            <h3>Recent Activity Log</h3>
            <Link to={`${prefix}/clients`} className="view-all-link">View All</Link>
          </div>

          <div className="recent-activities-figma">
            {displayActivities.map((act) => (
              <div className="activity-item-figma" key={act.id}>
                <span className="activity-icon-figma" style={{ background: act.bg, color: act.color }}>
                  <act.Icon size={16} />
                </span>
                <div className="activity-details-figma">
                  <b>{act.title}</b>
                  <small>{act.subtitle}</small>
                </div>
                <time>{act.time}</time>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Partner Dashboard Header (Figma Screen 5) */}
          <div
            className="dashboard-header-figma clickable-profile"
            onClick={() => openUserDetails(user)}
            title="Click to view your profile details (Mail, Mobile, Firm)"
            role="button"
            tabIndex={0}
          >
            <div>
              <h2 className="dashboard-user-greeting">
                Hello, <span className="greeting-name-link">{user.name}</span> 👋
              </h2>
              <small style={{ color: '#075c4d', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Phone size={12} /> Click to view your profile &amp; contact details
              </small>
            </div>
            <div className="dashboard-user-avatar" title={user.name}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Hero Dark Green Stat Banner (Figma Screen 5) */}
          <div className="hero-stat-banner-figma">
            <div className="hero-stat-col">
              <span className="hero-stat-label">Total Clients</span>
              <span className="hero-stat-value">{clientsList.length || 12}</span>
              <span className="hero-stat-subtag">Active Clients</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-col">
              <span className="hero-stat-label">Total Commission</span>
              <span className="hero-stat-value">
                {stats?.totalPaid ? `₹ ${Number(stats.totalPaid).toLocaleString('en-IN')}` : '₹ 8,50,000'}
              </span>
              <span className="hero-stat-subtag">Total Visits: {visits.length || 18}</span>
            </div>
          </div>

          {/* 4 Pastel Quick Actions (Figma Screen 5) */}
          <div className="quick-actions-pastel">
            <Link to={`${prefix}/clients`} className="quick-action-card card-clients">
              <div className="quick-action-icon-circle icon-clients">
                <Users size={20} />
              </div>
              <span>Clients</span>
            </Link>
            <Link to={`${prefix}/visits`} className="quick-action-card card-visits">
              <div className="quick-action-icon-circle icon-visits">
                <CalendarDays size={20} />
              </div>
              <span>Visits</span>
            </Link>
            <Link to={`${prefix}/complaints`} className="quick-action-card card-complaints">
              <div className="quick-action-icon-circle icon-complaints">
                <FileWarning size={20} />
              </div>
              <span>Complaints</span>
            </Link>
            <Link to={`${prefix}/payments`} className="quick-action-card card-payments">
              <div className="quick-action-icon-circle icon-payments">
                <CircleDollarSign size={20} />
              </div>
              <span>Payments</span>
            </Link>
          </div>

          {/* ⭐ Today & Tomorrow Client Visits Update Widget for CP */}
          <ClientVisitsWidget
            admin={false}
            visits={visits}
            clientsList={clientsList}
            prefix={prefix}
            openUserDetails={openUserDetails}
            onUpdateStatus={handleUpdateVisitStatus}
            onOpenSchedule={undefined}
          />

          {/* Recent Activities Section (Figma Screen 5) */}
          <div className="section-header-figma">
            <h3>Recent Activities</h3>
            <Link to={`${prefix}/visits`} className="view-all-link">View All</Link>
          </div>

          <div className="recent-activities-figma">
            {displayActivities.map((act) => (
              <div className="activity-item-figma" key={act.id}>
                <span className="activity-icon-figma" style={{ background: act.bg, color: act.color }}>
                  <act.Icon size={16} />
                </span>
                <div className="activity-details-figma">
                  <b>{act.title}</b>
                  <small>{act.subtitle}</small>
                </div>
                <time>{act.time}</time>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

function Clients() {
  const { openUserDetails } = useUserModal();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  let user = { role: 'partner' };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const isAdmin = location.pathname.startsWith('/admin') || user.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/partner';

  const [clients, setClients] = useState([]);
  const [q, setQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;
  const dayAfterObj = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const dayAfterStr = `${dayAfterObj.getFullYear()}-${pad(dayAfterObj.getMonth() + 1)}-${pad(dayAfterObj.getDate())}`;

  const initialClientForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    unit_type: '1 BHK',
    budget: '₹ 50L - 70L',
    status: 'Upcoming Visit',
    visit_date: todayStr,
    visit_time: '11:00 AM',
    visit_notes: ''
  };

  const [newClient, setNewClient] = useState(initialClientForm);

  const loadClients = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    api.getClients()
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => { if (showSpinner) setLoading(false); });
  };

  useEffect(() => {
    loadClients(true);
    const handleRefresh = () => loadClients(false);
    window.addEventListener('portal-refresh', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    return () => {
      window.removeEventListener('portal-refresh', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    try {
      await api.createClient(newClient);
      setShowModal(false);
      setNewClient(initialClientForm);
      loadClients();
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Could not create client');
    }
  };

  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = clients.filter((c) => {
    const qMatches = `${c.name || ''} ${c.phone || ''} ${c.email || ''} ${c.partner_name || ''} ${c.unit_type || ''}`.toLowerCase().includes(q.toLowerCase());
    if (!qMatches) return false;
    if (statusFilter === 'All') return true;
    return (c.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <Shell>
      <div className="heading">
        <div>
          <small>{isAdmin ? 'Admin Master View' : 'Channel Partner'}</small>
          <h2>{isAdmin ? 'All Clients in System' : 'My Clients'} ({clients.length})</h2>
        </div>
        <button type="button" className="icon" onClick={() => setShowModal(true)} title="Add Client">
          <Plus size={18} />
        </button>
      </div>

      <div className="search">
        <Search size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={isAdmin ? "Search by client name, mobile, unit, or partner name..." : "Search clients..."}
        />
      </div>

      <div className="filter-pills-row">
        {['All', 'Upcoming Visit', 'Closed', 'Site Visit Planned'].map((st) => (
          <button
            key={st}
            type="button"
            className={`filter-pill-btn ${statusFilter === st ? 'active' : ''}`}
            onClick={() => setStatusFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-msg">Loading client details from MySQL...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-msg">No clients found matching your filter. Click + to add one.</div>
      ) : (
        <div className="list">
          {filtered.map((c) => (
            <Link className="client-card-figma" to={`${prefix}/clients/${c.id}`} key={c.id}>
              <span className="client-avatar-figma">
                {(c.name || 'C').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <div className="client-info" style={{ flex: 1 }}>
                <b>
                  {c.name}
                  {isAdmin && c.partner_name && (
                    <button
                      type="button"
                      className="badge badge-partner badge-clickable"
                      style={{ marginLeft: '6px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openUserDetails({
                          id: c.partner_id,
                          name: c.partner_name,
                          firm_name: c.partner_firm_name,
                          email: c.partner_email,
                          phone: c.partner_phone,
                          phone2: c.partner_phone2,
                          role: 'partner'
                        });
                      }}
                      title="Click to view Channel Partner details (Mail, Mobile)"
                    >
                      👤 CP: {c.partner_name}
                    </button>
                  )}
                </b>
                <small>
                  {c.phone || 'No phone'}{c.unit_type ? ` • ${c.unit_type}` : ''}
                </small>
              </div>
              <span className={`status-pill-figma ${(c.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                {c.status || 'Pending'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="person" style={{ width: '32px', height: '32px', fontSize: '13px', background: '#dcfce7', color: '#15803d' }}>
                  <Plus size={16} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px' }}>Add New Client</h3>
                  <small style={{ color: '#6b7c77', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                    Register client profile &amp; schedule their property visit
                  </small>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)} title="Close Modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-scroll-body">
                {/* Section 1: Client Information & Requirements */}
                <div className="form-section-title">
                  <UserCheck size={15} style={{ color: '#075c4d' }} />
                  <span>Client Information & Requirements</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-field full-col">
                    <label>Client Full Name *</label>
                    <input
                      required
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                    />
                  </div>

                  <div className="form-field">
                    <label>Mobile Number</label>
                    <input
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="client@example.com"
                    />
                  </div>

                  <div className="form-field">
                    <label>Unit Requirement *</label>
                    <select
                      required
                      value={newClient.unit_type}
                      onChange={(e) => setNewClient({ ...newClient, unit_type: e.target.value })}
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Budget Range</label>
                    <input
                      value={newClient.budget}
                      onChange={(e) => setNewClient({ ...newClient, budget: e.target.value })}
                      placeholder="e.g. ₹ 50L - 70L, ₹ 1 Cr - 1.5 Cr"
                    />
                  </div>

                  <div className="form-field">
                    <label>Pipeline Status</label>
                    <select
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                    >
                      <option value="Upcoming Visit">Upcoming Visit</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="form-field full-col">
                    <label>Address</label>
                    <textarea
                      rows={2}
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="e.g. Flat 402, Sector 21, Noida"
                    />
                  </div>
                </div>

                {/* Section 2: Site Visit Scheduling (When is the client visiting?) */}
                <div className="client-visit-schedule-section">
                  <div className="visit-schedule-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarDays size={16} style={{ color: '#166534' }} />
                        <strong>Schedule Site Visit (Date &amp; Time)</strong>
                      </div>
                      <span className="optional-tag">Visit Details</span>
                    </div>
                    <small>
                      Specify when this client is arriving for their property visit. Quick buttons for Today / Tomorrow or pick a date:
                    </small>
                  </div>

                  <div className="visit-date-quick-chips">
                    <button
                      type="button"
                      className={`chip ${newClient.visit_date === todayStr ? 'active' : ''}`}
                      onClick={() => setNewClient({
                        ...newClient,
                        visit_date: todayStr,
                        visit_time: newClient.visit_time || '11:00 AM'
                      })}
                    >
                      📅 Today
                    </button>
                    <button
                      type="button"
                      className={`chip ${newClient.visit_date === tomorrowStr ? 'active' : ''}`}
                      onClick={() => setNewClient({
                        ...newClient,
                        visit_date: tomorrowStr,
                        visit_time: newClient.visit_time || '11:00 AM'
                      })}
                    >
                      ⚡ Tomorrow
                    </button>
                    <button
                      type="button"
                      className={`chip ${newClient.visit_date === dayAfterStr ? 'active' : ''}`}
                      onClick={() => setNewClient({
                        ...newClient,
                        visit_date: dayAfterStr,
                        visit_time: newClient.visit_time || '11:00 AM'
                      })}
                    >
                      🗓️ In 2 Days
                    </button>
                    {newClient.visit_date && (
                      <button
                        type="button"
                        className="chip clear-chip"
                        onClick={() => setNewClient({
                          ...newClient,
                          visit_date: '',
                          visit_time: '',
                          visit_notes: ''
                        })}
                      >
                        ✕ Clear Visit
                      </button>
                    )}
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>Visit Date</label>
                      <input
                        type="date"
                        min={todayStr}
                        value={newClient.visit_date}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          visit_date: e.target.value
                        })}
                      />
                    </div>
                    <div className="form-field">
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>Visit Time</label>
                      <input
                        type="time"
                        value={newClient.visit_time}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          visit_time: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="time-presets-row">
                    <span className="time-preset-label">Quick Times:</span>
                    {['10:30', '11:30', '14:00', '16:00', '17:30'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`time-preset-btn ${newClient.visit_time === t ? 'active' : ''}`}
                        onClick={() => setNewClient({ ...newClient, visit_time: t })}
                      >
                        {t === '10:30' ? '10:30 AM' : t === '11:30' ? '11:30 AM' : t === '14:00' ? '02:00 PM' : t === '16:00' ? '04:00 PM' : '05:30 PM'}
                      </button>
                    ))}
                  </div>

                  {newClient.visit_date && (
                    <div className={`visit-scheduled-live-hint ${newClient.visit_date === tomorrowStr ? 'tomorrow' : ''}`}>
                      {newClient.visit_date === tomorrowStr ? (
                        <span>
                          📢 <strong>Tomorrow Radar Alert:</strong> This client will automatically appear on <strong>Tomorrow's Upcoming Visits</strong> radar with complete dossier and alert Admin in real time!
                        </span>
                      ) : newClient.visit_date === todayStr ? (
                        <span>
                          🟢 <strong>Today's Live Radar:</strong> This visit will immediately appear under <strong>Today's Scheduled Visits</strong> for Admin and C.P.
                        </span>
                      ) : (
                        <span>
                          🗓️ <strong>Scheduled Visit:</strong> Appointment recorded for <strong>{newClient.visit_date}</strong> {newClient.visit_time ? `at ${newClient.visit_time}` : ''}.
                        </span>
                      )}
                    </div>
                  )}

                  <div className="form-field" style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>Visit Notes / Remarks</label>
                    <input
                      value={newClient.visit_notes}
                      onChange={(e) => setNewClient({ ...newClient, visit_notes: e.target.value })}
                      placeholder="e.g. Interested in 2/3 BHK sample flat tour"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer with Actions */}
              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Check size={16} /> Save Client to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}

function ClientVisitJourneyChart({
  client,
  visits = [],
  onBack,
  isAdmin = false,
  onUpdateStatus,
  embedded = false
}) {
  const STAGES = [
    { key: 'Upcoming', title: 'Upcoming' },
    { key: 'Visited', title: 'Visited' },
    { key: 'FollowUp', title: 'FollowUp' },
    { key: 'Revisited', title: 'Revisited' },
    { key: 'Booked', title: 'Booked' },
    { key: 'Closed', title: 'Closed' }
  ];

  const getStageIndex = (st) => {
    if (!st) return 0;
    const clean = String(st).toLowerCase().replace(/[\s-_]/g, '');
    if (clean === 'upcoming' || clean === 'scheduled' || clean === 'upcomingvisit') return 0;
    if (clean === 'visited' || clean === 'completed') return 1;
    if (clean === 'followup') return 2;
    if (clean === 'revisited') return 3;
    if (clean === 'booked') return 4;
    if (clean === 'closed') return 5;
    return 0;
  };

  let currentStageIndex = 0;
  if (visits && visits.length > 0) {
    visits.forEach((v) => {
      const idx = getStageIndex(v.status);
      if (idx > currentStageIndex) currentStageIndex = idx;
    });
  } else if (client?.status) {
    currentStageIndex = getStageIndex(client.status);
  }

  const currentStageObj = STAGES[currentStageIndex];
  const isCurrentLocked = isVisitStatusLocked(currentStageObj.key);
  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  const visitsByStage = {};
  STAGES.forEach((s) => { visitsByStage[s.key] = []; });
  visits.forEach((v) => {
    const idx = getStageIndex(v.status);
    const key = STAGES[idx].key;
    visitsByStage[key].push(v);
  });

  return (
    <div className="client-visit-journey-container">
      {/* Header Bar */}
      <div className="journey-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {onBack && (
            <button
              type="button"
              className="journey-back-btn"
              onClick={onBack}
              title="Return to site visit records list"
            >
              <ArrowLeft size={15} /> <span>All Visits</span>
            </button>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#112d27', fontWeight: '700' }}>
                {client?.name || 'Client Visit Details'}
              </h3>
              <span className={`visit-status-pill status-${currentStageObj.key.toLowerCase()}`}>
                {isCurrentLocked ? '🔒 ' : '● '}{currentStageObj.title}
              </span>
            </div>
            <div style={{ color: '#6b7c77', fontSize: '12px', marginTop: '3px' }}>
              {client?.id ? `Client ID: #CL-${String(client.id).padStart(4, '0')} • ` : ''}
              Unit: <b>{client?.unit_type || '2 BHK'}</b>
              {client?.budget ? ` • Budget: ${client.budget}` : ''}
              {client?.phone ? ` • Mobile: ${client.phone}` : ''}
            </div>
          </div>
        </div>

        <div className="journey-progress-badge">
          <div className="progress-fraction">
            Stage <strong>{currentStageIndex + 1}</strong> of <strong>{STAGES.length}</strong>
          </div>
          <div className="progress-percentage-pill">{progressPercent}% Journey Progress</div>
        </div>
      </div>

      {/* Finalized Banner if Booked or Closed */}
      {isCurrentLocked && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          margin: '12px 0 6px 0',
          borderRadius: '8px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <Lock size={15} />
          <span>Visit Finalized: Status is marked as <strong>{currentStageObj.title}</strong>. No further status changes can be made.</span>
        </div>
      )}

      {/* Progress Track */}
      <div className="journey-progress-bar-track">
        <div
          className="journey-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Round Circular Flowchart for Admin and C.P */}
      <div className="journey-chart-flow-wrap">
        <div className="journey-chart-flow">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;
            const matchingVisits = visitsByStage[st.key] || [];

            return (
              <div
                key={st.key}
                className={`journey-step-node ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''} ${isPending ? 'step-pending' : ''}`}
                onClick={() => {
                  if (visits.length > 0 && onUpdateStatus) {
                    if (isCurrentLocked) {
                      alert(`Status is already finalized as "${currentStageObj.title}". Once a visit is Booked or Closed, no further status changes are permitted.`);
                      return;
                    }
                    if (idx < currentStageIndex) {
                      alert(`Cannot revert visit status backwards in the flow from "${currentStageObj.title}" to "${st.title}". Progression is strictly forward.`);
                      return;
                    }
                    onUpdateStatus(visits[0].id, st.key);
                  }
                }}
                style={{
                  cursor: visits.length > 0 && onUpdateStatus
                    ? (isCurrentLocked || idx < currentStageIndex ? 'not-allowed' : 'pointer')
                    : 'default',
                  opacity: isCurrentLocked && !isCurrent ? 0.6 : (idx < currentStageIndex ? 0.8 : 1)
                }}
                title={
                  isCurrentLocked
                    ? `Status is finalized as "${currentStageObj.title}" (locked - no further changes permitted)`
                    : (idx < currentStageIndex
                        ? `Stage "${st.title}" is already completed (flow is strictly forward-only)`
                        : `Click to update client visit stage to "${st.title}" in MySQL`)
                }
              >
                {idx < STAGES.length - 1 && (
                  <div className={`step-connector ${idx < currentStageIndex ? 'connector-done' : ''}`} />
                )}

                <div className="step-circle">
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : isCurrent ? (
                    <span className="step-pulse-dot" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="step-content">
                  <div className="step-title">
                    {st.title}
                    {isCurrent && <span className="round-active-badge">Active</span>}
                  </div>
                  {matchingVisits.length > 0 && (
                    <div className="step-event-chip">
                      📅 {new Date(matchingVisits[0].visit_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {matchingVisits[0].visit_time ? ` • ${matchingVisits[0].visit_time}` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Site Visits History Timeline for this Client */}
      {!embedded && (
        <div className="journey-visits-history">
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#163a33', fontWeight: '700' }}>
            Site Visit Activity for {client?.name} ({visits.length})
          </h4>

          {visits.length === 0 ? (
            <div className="empty-msg" style={{ padding: '16px', textAlign: 'center' }}>
              No visit appointments recorded yet for this client.
            </div>
          ) : (
            <div className="timeline">
              {[...visits].sort((a, b) => {
                const timeA = new Date(a.updated_at || a.created_at || a.visit_date || 0).getTime();
                const timeB = new Date(b.updated_at || b.created_at || b.visit_date || 0).getTime();
                return timeB - timeA;
              }).map((v) => {
                const dayClass = getVisitDayClassification(v.visit_date);
                const dateDisplay = dayClass.formattedDate || new Date(v.visit_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <div className="visit" key={v.id}>
                    <span className="dot" />
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <small style={{ fontWeight: '600', color: '#163a33' }}>
                          📅 {dateDisplay}
                          {v.visit_time ? ` • ⏰ ${v.visit_time}` : ''}
                        </small>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <small style={{ fontSize: '10px', color: '#6b7c77', fontWeight: '600' }}>STATUS:</small>
                          <span className={`visit-status-pill status-${(v.status || 'Upcoming').toLowerCase()}`}>
                            {isVisitStatusLocked(v.status) ? '🔒 ' : ''}{v.status || 'Upcoming'}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '13px', color: '#374151' }}>
                        <b>Remarks:</b> {v.notes || 'No remarks provided.'}
                      </div>

                      {(v.partner_name || v.partner_firm_name) && (
                        <div style={{ marginTop: '6px' }}>
                          <small style={{ color: '#075c4d', fontWeight: '600' }}>
                            👤 Registered CP: {v.partner_name}{v.partner_firm_name ? ` (${v.partner_firm_name})` : ''}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Details() {
  const { openUserDetails } = useUserModal();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [toast, setToast] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  // Reply Modal for complaints inside details
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('open');
  const [showReplyModal, setShowReplyModal] = useState(false);

  const userStr = localStorage.getItem('user');
  let user = { role: 'partner' };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const isAdmin = user.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/partner';

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;

  const handleVisitStatusChange = async (visitId, newStatus) => {
    try {
      const currentVisit = client?.visits?.find((v) => Number(v.id) === Number(visitId));
      if (currentVisit) {
        if (isVisitStatusLocked(currentVisit.status)) {
          alert(`Status is already marked as "${currentVisit.status}". Once Booked or Closed, no further status changes are permitted.`);
          return;
        }
        const curW = getStageWeight(currentVisit.status);
        const tgtW = getStageWeight(newStatus);
        if (tgtW < curW) {
          alert(`Cannot revert visit status backwards in the flow from "${currentVisit.status}" to "${newStatus}". Progression is strictly forward.`);
          return;
        }
      }

      const nowIso = new Date().toISOString();
      setClient((prev) => {
        if (!prev || !prev.visits) return prev;
        const target = prev.visits.find((v) => Number(v.id) === Number(visitId));
        if (!target) return prev;
        const updated = { ...target, status: newStatus, updated_at: nowIso };
        const others = prev.visits.filter((v) => Number(v.id) !== Number(visitId));
        return {
          ...prev,
          visits: [updated, ...others]
        };
      });

      await api.updateVisit(visitId, { status: newStatus });
      setToast(`Visit status updated to "${newStatus}" in MySQL!`);
      setTimeout(() => setToast(''), 4000);
      loadClient();
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to update visit status');
      loadClient();
    }
  };

  const loadClient = () => {
    if (id) {
      api.getClient(id)
        .then((data) => {
          setClient(data);
          setEditData(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  if (loading) return <Shell><div className="empty-msg">Loading all client details from MySQL...</div></Shell>;
  if (!client) return <Shell><div className="empty-msg">Client not found.</div></Shell>;

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await api.updateClient(client.id, { status: newStatus });
      setClient((prev) => ({ ...prev, status: updated.status, updated_at: updated.updated_at }));
      setToast(`Client status changed to "${newStatus}" in MySQL!`);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update client status');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateClient(client.id, {
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        unit_type: editData.unit_type,
        budget: editData.budget,
        source: editData.source,
        address: editData.address,
        status: editData.status
      });
      setClient((prev) => ({ ...prev, ...updated }));
      setShowEditModal(false);
      setToast('Client details updated successfully in MySQL!');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update client details');
    }
  };

  const handleReplyComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.updateComplaint(selectedComplaint.id, {
        status: replyStatus,
        admin_reply: replyText
      });
      setShowReplyModal(false);
      setToast('Complaint response & status saved to MySQL!');
      setTimeout(() => setToast(''), 4000);
      loadClient();
    } catch (err) {
      alert(err.message || 'Failed to save complaint reply');
    }
  };

  const initials = (client.name || 'PS').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Shell>
      {toast && (
        <div className="toast-msg">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="heading">
        <Link to={`${prefix}/clients`}><ArrowLeft size={19} /></Link>
        <div>
          <small>Client Master Record #{client.id}</small>
          <h2>{client.name}</h2>
        </div>
        {isAdmin && (
          <button type="button" className="btn-sm" onClick={() => setShowEditModal(true)}>
            <Edit size={14} /> Edit Client
          </button>
        )}
      </div>

      <div className="client-detail-hero-figma">
        <span className="client-detail-avatar-lg">{initials}</span>
        <b className="client-detail-name-lg">{client.name}</b>
        <span className={`status-pill-figma ${(client.status || 'pending').toLowerCase().replace(' ', '-')}`}>
          {client.status || 'Pending'}
        </span>
        {isAdmin && client.partner_name && (
          <button
            type="button"
            className="cp-details-pill-btn"
            onClick={() => openUserDetails({
              id: client.partner_id,
              name: client.partner_name,
              firm_name: client.partner_firm_name,
              email: client.partner_email,
              phone: client.partner_phone,
              phone2: client.partner_phone2,
              role: 'partner'
            })}
            title="Click to view Channel Partner details (Mail, Mobile, Firm)"
          >
            👤 Channel Partner: <b>{client.partner_name}</b>{client.partner_firm_name ? ` (${client.partner_firm_name})` : ''}
            <span className="view-details-hint">View Details →</span>
          </button>
        )}
      </div>

      <div className="subtabs">
        <button type="button" className={tab === 'details' ? 'on' : ''} onClick={() => setTab('details')}>
          Full Details
        </button>
        <button type="button" className={tab === 'visits' ? 'on' : ''} onClick={() => setTab('visits')}>
          Visits ({client.visits?.length || 0})
        </button>
        <button type="button" className={tab === 'complaints' ? 'on' : ''} onClick={() => setTab('complaints')}>
          Complaints ({client.complaints?.length || 0})
        </button>
      </div>

      {tab === 'details' && (
        <div className="details">
          {[
            ['Client ID', `#CL-${String(client.id).padStart(4, '0')}`],
            ['Full Name', client.name],
            ['Phone Number', client.phone || 'Not provided'],
            ['Email Address', client.email || 'Not provided'],
            ['Project Interest', 'Park Solitaire — Premium Residences'],
            ['Unit Type Requirement', client.unit_type || '1 BHK / 2 BHK / 3 BHK'],
            ['Budget Range', client.budget || '₹ 50L - 70L'],
            ['Status', client.status || 'Upcoming Visit'],
            ['Client Address', client.address || 'Not specified'],
            ['Registered By Partner', client.partner_name ? `${client.partner_name}${client.partner_firm_name ? ` (${client.partner_firm_name})` : ''}` : 'Direct / Admin'],
            ['Partner Phone', [client.partner_phone, client.partner_phone2].filter(Boolean).join(' / ') || 'N/A'],
            ['Registered Date', new Date(client.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
            ['Last Updated', new Date(client.updated_at || client.created_at || Date.now()).toLocaleString('en-GB')],
          ].map(([k, v]) => (
            <div key={k}>
              <small>{k}</small>
              <b>{v}</b>
            </div>
          ))}
        </div>
      )}

      {tab === 'visits' && (
        <div className="subtab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#163a33' }}>Site Visits History &amp; Milestone Journey ({client.visits?.length || 0})</h4>
              <small style={{ color: '#6b7c77' }}>Customer property visit pipeline &amp; inspection history</small>
            </div>
          </div>

          {/* Visual Visit Journey Flowchart */}
          <ClientVisitJourneyChart
            client={client}
            visits={client.visits || []}
            isAdmin={isAdmin}
            onUpdateStatus={handleVisitStatusChange}
            embedded={true}
          />

          {(!client.visits || client.visits.length === 0) ? (
            <div className="empty-msg" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div>No site visits recorded for this client yet.</div>
            </div>
          ) : (
            <div className="timeline">
              {[...client.visits].sort((a, b) => {
                const timeA = new Date(a.updated_at || a.created_at || a.visit_date || 0).getTime();
                const timeB = new Date(b.updated_at || b.created_at || b.visit_date || 0).getTime();
                return timeB - timeA;
              }).map((v) => (
                <div className="visit" key={v.id}>
                  <span className="dot" />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <small style={{ fontWeight: '600', color: '#163a33' }}>
                        📅 {new Date(v.visit_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{v.visit_time ? ` • ⏰ ${v.visit_time}` : ''}
                      </small>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <small style={{ fontSize: '10px', color: '#6b7c77', fontWeight: '600' }}>STATUS:</small>
                        <span className={`visit-status-pill status-${(v.status || 'Upcoming').toLowerCase()}`}>
                          {isVisitStatusLocked(v.status) ? '🔒 ' : ''}{v.status || 'Upcoming'}
                        </span>
                        {!isVisitStatusLocked(v.status) && (
                          <select
                            className="status-dropdown"
                            value={v.status || 'Upcoming'}
                            onChange={(e) => handleVisitStatusChange(v.id, e.target.value)}
                            style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#075c4d' }}
                            title="Update visit status in MySQL"
                          >
                            {getForwardStages(v.status).map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <b style={{ fontSize: '14px', marginTop: '4px', display: 'inline-block' }}>Site Visit — {v.status || 'Upcoming'}</b>
                    <p style={{ marginTop: '4px' }}>{v.notes || 'No remarks provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'complaints' && (
        <div className="subtab-content">
          {(!client.complaints || client.complaints.length === 0) ? (
            <div className="empty-msg">No complaints recorded for this client.</div>
          ) : (
            <div className="list">
              {client.complaints.map((co) => (
                <div className="complaint" key={co.id} style={{ display: 'block', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <small>#C{String(co.id).padStart(3, '0')}</small>
                    <span className={`status ${(co.status || 'open').toLowerCase().replace('_', '-')}`}>
                      {(co.status || 'open').replace('_', ' ')}
                    </span>
                  </div>
                  <b style={{ fontSize: '15px' }}>{co.subject}</b>
                  <p style={{ fontSize: '13px', color: '#4b5f59', margin: '6px 0 10px' }}>
                    {co.description || 'No description provided.'}
                  </p>

                  {co.admin_reply && (
                    <div className="admin-reply-box">
                      <div className="reply-header">
                        <ShieldAlert size={14} />
                        <span>Admin Response & Resolution</span>
                        {co.replied_at && <small>{new Date(co.replied_at).toLocaleString('en-GB')}</small>}
                      </div>
                      <p className="reply-content">{co.admin_reply}</p>
                    </div>
                  )}

                  <div className="action-row">
                    <button
                      type="button"
                      className="btn-sm btn-primary"
                      onClick={() => {
                        setSelectedComplaint(co);
                        setReplyText(co.admin_reply || '');
                        setReplyStatus(co.status || 'open');
                        setShowReplyModal(true);
                      }}
                    >
                      <MessageSquare size={13} />
                      {co.admin_reply ? 'Update Admin Reply / Status' : 'Reply & Update Status'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Buttons (Admin Only) */}
      {isAdmin && (
        <div className="details-bottom-bar-figma">
          <button type="button" className="btn-primary-figma" onClick={() => setShowEditModal(true)}>
            <Edit size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
            Edit Client Details
          </button>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={16} style={{ color: '#075c4d' }} />
                <h3 style={{ margin: 0 }}>Edit Client Master Record #{client.id}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-scroll-body">
                <div className="form-grid-2">
                  <div className="form-field full-col">
                    <label>Client Name *</label>
                    <input
                      required
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Mobile Number</label>
                    <input
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Email ID</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Unit Type Requirement</label>
                    <select
                      value={editData.unit_type || '1 BHK'}
                      onChange={(e) => setEditData({ ...editData, unit_type: e.target.value })}
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Budget Range</label>
                    <input
                      value={editData.budget || ''}
                      onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Pipeline Status</label>
                    <select
                      value={editData.status || 'Upcoming Visit'}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    >
                      <option value="Upcoming Visit">Upcoming Visit</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="form-field full-col">
                    <label>Address</label>
                    <textarea
                      rows={2}
                      value={editData.address || ''}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Check size={16} /> Save Changes to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Reply Modal */}
      {showReplyModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply & Update Complaint #{selectedComplaint.id}</h3>
              <button type="button" className="close-btn" onClick={() => setShowReplyModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleReplyComplaint}>
              <div style={{ background: '#f5f8f7', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <b style={{ fontSize: '13px', display: 'block', color: '#163a33' }}>{selectedComplaint.subject}</b>
                <p style={{ fontSize: '12px', color: '#6b7c77', marginTop: '4px' }}>
                  {selectedComplaint.description || 'No description'}
                </p>
              </div>

              <label>Update Ticket Status</label>
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
              >
                <option value="open">Open (Active)</option>
                <option value="in_progress">In Progress (Investigating)</option>
                <option value="resolved">Resolved (Action Completed)</option>
                <option value="closed">Closed (Ticket Closed)</option>
              </select>

              <label>Admin Resolution Response / Reply *</label>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type resolution explanation, assigned technician, or follow-up response here..."
              />

              <button type="submit" className="primary" style={{ marginTop: '18px' }}>
                Save Reply to MySQL
              </button>
            </form>
          </div>
        </div>
      )}

    </Shell>
  );
}

function Visits() {
  const { openUserDetails } = useUserModal();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  let user = { role: 'admin' };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const isAdmin = location.pathname.startsWith('/admin') || user.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/partner';

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newVisit, setNewVisit] = useState({ client_id: '', visit_date: '', visit_time: '11:00 AM', notes: '', status: 'Upcoming' });

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;

  const openNewVisitModal = () => {
    setNewVisit((prev) => ({
      client_id: prev.client_id || (clients[0]?.id ? String(clients[0].id) : ''),
      visit_date: prev.visit_date || todayStr,
      visit_time: prev.visit_time || '11:00 AM',
      notes: prev.notes || '',
      status: prev.status || 'Upcoming'
    }));
    setShowModal(true);
  };

  const loadData = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    Promise.all([api.getVisits(), api.getClients()])
      .then(([v, c]) => {
        setVisits(Array.isArray(v) ? v : []);
        setClients(Array.isArray(c) ? c : []);
        if (Array.isArray(c) && c.length > 0) {
          setNewVisit((prev) => ({ ...prev, client_id: prev.client_id || String(c[0].id) }));
        }
      })
      .catch(() => {})
      .finally(() => { if (showSpinner) setLoading(false); });
  };

  useEffect(() => {
    loadData(true);
    const handleRefresh = () => loadData(false);
    window.addEventListener('portal-refresh', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    return () => {
      window.removeEventListener('portal-refresh', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newVisit.client_id) {
      alert('Please select a client for the visit.');
      return;
    }
    if (!newVisit.visit_date) {
      alert('Please select a visit date.');
      return;
    }

    const existingClientVisit = visits.find((v) => Number(v.client_id) === Number(newVisit.client_id));
    const isLocked = existingClientVisit && isVisitStatusLocked(existingClientVisit.status);
    const visitStatusToSave = isLocked ? existingClientVisit.status : (newVisit.status || 'Upcoming');

    try {
      await api.createVisit({
        client_id: Number(newVisit.client_id),
        visit_date: newVisit.visit_date,
        visit_time: newVisit.visit_time || '11:00 AM',
        notes: newVisit.notes || '',
        status: visitStatusToSave
      });
      setShowModal(false);
      setToast('Visit scheduled & saved to MySQL!');
      setTimeout(() => setToast(''), 4000);
      loadData(false);
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to create visit update');
    }
  };

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      const currentVisit = visits.find((v) => Number(v.id) === Number(visitId));
      if (currentVisit) {
        if (isVisitStatusLocked(currentVisit.status)) {
          alert(`Status is already marked as "${currentVisit.status}". Once Booked or Closed, no further status changes are permitted.`);
          return;
        }
        const curW = getStageWeight(currentVisit.status);
        const tgtW = getStageWeight(newStatus);
        if (tgtW < curW) {
          alert(`Cannot revert visit status backwards in the flow from "${currentVisit.status}" to "${newStatus}". Progression is strictly forward.`);
          return;
        }
      }

      const nowIso = new Date().toISOString();
      setVisits((prev) => {
        const target = prev.find((v) => Number(v.id) === Number(visitId));
        if (!target) return prev;
        const updated = { ...target, status: newStatus, updated_at: nowIso };
        const others = prev.filter((v) => Number(v.id) !== Number(visitId));
        return [updated, ...others];
      });

      await api.updateVisit(visitId, { status: newStatus });
      setToast(`Visit status updated to "${newStatus}" in MySQL!`);
      setTimeout(() => setToast(''), 4000);
      loadData(false);
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to update visit status');
      loadData(false);
    }
  };

  const filteredVisits = visits.filter((v) => {
    const qMatches = `${v.client_name || ''} ${v.partner_name || ''} ${v.partner_firm_name || ''} ${v.client_phone || ''} ${v.unit_type || ''} ${v.notes || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!qMatches) return false;
    if (statusFilter === 'All') return true;
    return (v.status || 'Upcoming').toLowerCase() === statusFilter.toLowerCase();
  });

  // Sort visits so the latest updated visit is on the top of the stack
  const sortedFilteredVisits = [...filteredVisits].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || a.visit_date || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || b.visit_date || 0).getTime();
    return timeB - timeA;
  });

  // Deduplicate by client_id so that a single client is never displayed multiple times
  const displayedVisits = [];
  const seenClientIds = new Set();
  sortedFilteredVisits.forEach((v) => {
    const key = v.client_id ? Number(v.client_id) : `v-${v.id}`;
    if (!seenClientIds.has(key)) {
      seenClientIds.add(key);
      displayedVisits.push(v);
    }
  });

  return (
    <Shell>
      {toast && (
        <div className="toast-msg">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="heading">
        <div>
          <small>{isAdmin ? 'Admin Master View' : 'Channel Partner Dashboard'}</small>
          <h2>Site Visit Records ({displayedVisits.length})</h2>
        </div>
        {isAdmin && (
          <button type="button" className="icon" onClick={openNewVisitModal} title="Schedule Visit">
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* If a client is selected, render the ClientVisitJourneyChart */}
      {selectedClientId ? (
        <ClientVisitJourneyChart
          client={
            clients.find((c) => Number(c.id) === Number(selectedClientId)) || {
              id: selectedClientId,
              name: visits.find((v) => Number(v.client_id) === Number(selectedClientId))?.client_name || `Client #${selectedClientId}`,
              phone: visits.find((v) => Number(v.client_id) === Number(selectedClientId))?.client_phone,
              unit_type: visits.find((v) => Number(v.client_id) === Number(selectedClientId))?.unit_type || visits.find((v) => Number(v.client_id) === Number(selectedClientId))?.client_unit_type,
              budget: visits.find((v) => Number(v.client_id) === Number(selectedClientId))?.budget || visits.find((v) => Number(v.client_id) === Number(selectedClientId))?.client_budget
            }
          }
          visits={visits.filter((v) => Number(v.client_id) === Number(selectedClientId))}
          onBack={() => setSelectedClientId(null)}
          isAdmin={isAdmin}
          onUpdateStatus={handleStatusChange}
        />
      ) : (
        <>
          <div className="search">
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAdmin ? "Search by client name, partner, mobile, or unit..." : "Search your site visits..."}
            />
          </div>

          <div className="filter-pills-row">
            {['All', 'Upcoming', 'Visited', 'FollowUp', 'Revisited', 'Booked', 'Closed'].map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-pill-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-msg">Loading visits...</div>
          ) : displayedVisits.length === 0 ? (
            <div className="empty-msg">
              {searchQuery || statusFilter !== 'All'
                ? 'No visit updates match your filter.'
                : 'No visit updates recorded yet.'}
            </div>
          ) : (
        <div className="timeline">
          {displayedVisits.map((v) => {
            const dayClass = getVisitDayClassification(v.visit_date);
            const dateDisplay = dayClass.formattedDate || new Date(v.visit_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            return (
              <div className="visit" key={v.id}>
                <span className="dot" />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <small style={{ fontWeight: '600', color: '#163a33' }}>
                      📅 {dateDisplay}
                      {v.visit_time ? ` • ⏰ ${v.visit_time}` : ''}
                    </small>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <small style={{ fontSize: '10px', color: '#6b7c77', fontWeight: '600' }}>STATUS:</small>
                      <span className={`visit-status-pill status-${(v.status || 'Upcoming').toLowerCase()}`}>
                        {isVisitStatusLocked(v.status) ? '🔒 ' : ''}{v.status || 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {v.client_id ? (
                      <Link
                        to={`${prefix}/clients/${v.client_id}`}
                        style={{ fontSize: '16px', fontWeight: '700', color: '#075c4d', textDecoration: 'underline' }}
                        title="View Client Dossier Profile"
                      >
                        {v.client_name || `Client #${v.client_id}`}
                      </Link>
                    ) : (
                      <b style={{ fontSize: '16px' }}>{v.client_name || 'Client Visit'}</b>
                    )}

                    {(v.unit_type || v.client_unit_type) && (
                      <span className="visit-spec-pill unit-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {v.unit_type || v.client_unit_type}
                      </span>
                    )}

                    {(v.budget || v.client_budget) && (
                      <span className="visit-spec-pill budget-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {v.budget || v.client_budget}
                      </span>
                    )}
                  </div>

                  {/* Channel Partner info badge */}
                  {(v.partner_name || v.partner_firm_name) && (
                    <div style={{ margin: '6px 0' }}>
                      <button
                        type="button"
                        className="badge badge-partner badge-clickable"
                        style={{ display: 'inline-flex', padding: '4px 10px', fontSize: '11.5px' }}
                        onClick={() => openUserDetails({
                          id: v.partner_id,
                          name: v.partner_name,
                          firm_name: v.partner_firm_name,
                          email: v.partner_email,
                          phone: v.partner_phone,
                          phone2: v.partner_phone2,
                          role: 'partner'
                        })}
                        title="Click to view Channel Partner details (Mail, Mobile, Firm)"
                      >
                        👤 CP: {v.partner_name}{v.partner_firm_name ? ` (${v.partner_firm_name})` : ''}
                      </button>
                    </div>
                  )}

                  <p style={{ margin: '6px 0 0 0', color: '#4b5563', fontSize: '13px' }}>
                    {v.notes || 'No remarks provided.'}
                  </p>

                  {/* View Client Visit Journey Flowchart Button */}
                  {v.client_id && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        className="btn-view-client-chart"
                        onClick={() => setSelectedClientId(Number(v.client_id))}
                        title="View visual site visit journey flowchart for this client"
                      >
                        <BarChart2 size={13} />
                        <span>📊 View Visit Journey Chart</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {isAdmin && !selectedClientId && (
        <button type="button" className="primary" style={{ marginTop: '14px' }} onClick={openNewVisitModal}>
          + Schedule Visit Update
        </button>
      )}

      {isAdmin && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={16} style={{ color: '#075c4d' }} />
                <h3 style={{ margin: 0 }}>Schedule Visit Update</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-scroll-body">
                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Select Client *</label>
                  <select
                    value={newVisit.client_id}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const ex = visits.find((v) => Number(v.client_id) === Number(cId));
                      const isLocked = ex && isVisitStatusLocked(ex.status);
                      setNewVisit({
                        ...newVisit,
                        client_id: cId,
                        status: isLocked ? ex.status : (newVisit.status || 'Upcoming')
                      });
                    }}
                  >
                    {clients.map((c) => {
                      const ex = visits.find((v) => Number(v.client_id) === Number(c.id));
                      const lockedTag = ex && isVisitStatusLocked(ex.status) ? ` — 🔒 ${ex.status}` : '';
                      return (
                        <option key={c.id} value={String(c.id)}>
                          {c.name} ({c.phone || 'No phone'}){lockedTag}
                        </option>
                      );
                    })}
                  </select>
                  {clients.length === 0 && (
                    <p style={{ color: '#d97706', fontSize: '12px', margin: '4px 0 0' }}>
                      ⚠️ No clients registered yet. Please add a client first.
                    </p>
                  )}
                  {(() => {
                    const ex = visits.find((v) => Number(v.client_id) === Number(newVisit.client_id));
                    if (ex && isVisitStatusLocked(ex.status)) {
                      return (
                        <div style={{ color: '#065f46', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', marginTop: '6px', border: '1px solid #a7f3d0' }}>
                          🔒 Client visit is already marked as <strong>{ex.status}</strong>. Status is finalized and cannot be changed.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Visit Date *</label>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setNewVisit({ ...newVisit, visit_date: todayStr })}
                        style={{
                          padding: '3px 9px',
                          fontSize: '11px',
                          borderRadius: '12px',
                          border: newVisit.visit_date === todayStr ? '1px solid #075c4d' : '1px solid #d1d5db',
                          background: newVisit.visit_date === todayStr ? '#e6f4f1' : '#f9fafb',
                          color: newVisit.visit_date === todayStr ? '#075c4d' : '#4b5563',
                          fontWeight: newVisit.visit_date === todayStr ? '600' : 'normal',
                          cursor: 'pointer'
                        }}
                      >
                        📅 Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisit({ ...newVisit, visit_date: tomorrowStr })}
                        style={{
                          padding: '3px 9px',
                          fontSize: '11px',
                          borderRadius: '12px',
                          border: newVisit.visit_date === tomorrowStr ? '1px solid #075c4d' : '1px solid #d1d5db',
                          background: newVisit.visit_date === tomorrowStr ? '#e6f4f1' : '#f9fafb',
                          color: newVisit.visit_date === tomorrowStr ? '#075c4d' : '#4b5563',
                          fontWeight: newVisit.visit_date === tomorrowStr ? '600' : 'normal',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ Tomorrow
                      </button>
                    </div>
                    <input
                      type="date"
                      required
                      value={newVisit.visit_date}
                      onChange={(e) => setNewVisit({ ...newVisit, visit_date: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Visit Time</label>
                    <input
                      type="time"
                      value={newVisit.visit_time || ''}
                      onChange={(e) => setNewVisit({ ...newVisit, visit_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Visit Status</label>
                  {(() => {
                    const ex = visits.find((v) => Number(v.client_id) === Number(newVisit.client_id));
                    const isLocked = ex && isVisitStatusLocked(ex.status);
                    return (
                      <select
                        value={isLocked ? ex.status : newVisit.status}
                        disabled={isLocked}
                        onChange={(e) => setNewVisit({ ...newVisit, status: e.target.value })}
                        style={isLocked ? { background: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' } : {}}
                      >
                        {isLocked ? (
                          <option value={ex.status}>{ex.status} (Finalized - Locked)</option>
                        ) : (
                          ['Upcoming', 'Visited', 'FollowUp', 'Revisited', 'Booked', 'Closed'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))
                        )}
                      </select>
                    );
                  })()}
                </div>

                <div className="form-field">
                  <label>Remarks / Notes</label>
                  <textarea
                    rows={3}
                    value={newVisit.notes}
                    onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                    placeholder="e.g. Showed sample flat, client enquired about 2BHK pricing and payment plan"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Check size={16} /> Save Visit to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Complaints() {
  const { openUserDetails } = useUserModal();
  const userStr = localStorage.getItem('user');
  let user = { role: 'partner', id: null };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const isAdmin = user.role === 'admin';

  const [complaints, setComplaints] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  // Reply & Status modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('open');
  const [showReplyModal, setShowReplyModal] = useState(false);

  const [newComplaint, setNewComplaint] = useState({
    client_id: '',
    subject: '',
    description: '',
    status: 'open'
  });

  const loadData = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    Promise.all([api.getComplaints(), api.getClients()])
      .then(([co, cl]) => {
        setComplaints(Array.isArray(co) ? co : []);
        setClients(Array.isArray(cl) ? cl : []);
        if (Array.isArray(cl) && cl.length > 0) {
          setNewComplaint((prev) => ({ ...prev, client_id: prev.client_id || cl[0].id }));
        }
      })
      .catch(() => {})
      .finally(() => { if (showSpinner) setLoading(false); });
  };

  useEffect(() => {
    loadData(true);
    const handleRefresh = () => loadData(false);
    window.addEventListener('portal-refresh', handleRefresh);
    return () => window.removeEventListener('portal-refresh', handleRefresh);
  }, []);

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    if (!newComplaint.client_id || !newComplaint.subject.trim()) {
      alert('Please select a client and provide a complaint subject.');
      return;
    }

    const selectedClient = clients.find((c) => String(c.id) === String(newComplaint.client_id)) || clients[0];
    const targetPartnerId = selectedClient?.partner_id;

    try {
      await api.createComplaint({
        ...newComplaint,
        partner_id: targetPartnerId
      });
      setShowModal(false);
      setNewComplaint({ client_id: clients[0]?.id || '', subject: '', description: '', status: 'open' });
      setToast(
        isAdmin && selectedClient?.partner_name
          ? `Complaint raised specifically for Channel Partner "${selectedClient.partner_name}" in MySQL!`
          : 'Complaint raised and saved to MySQL!'
      );
      setTimeout(() => setToast(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to raise complaint');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.updateComplaint(selectedComplaint.id, {
        status: replyStatus,
        admin_reply: replyText
      });
      setShowReplyModal(false);
      setToast(`Ticket #C${String(selectedComplaint.id).padStart(3, '0')} response & status saved to MySQL!`);
      setTimeout(() => setToast(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update complaint');
    }
  };

  const handleQuickStatus = async (complaintId, newStatus) => {
    try {
      await api.updateComplaint(complaintId, { status: newStatus });
      setToast(`Ticket #C${String(complaintId).padStart(3, '0')} status updated to "${newStatus}" in MySQL!`);
      setTimeout(() => setToast(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filtered = complaints.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <Shell>
      {toast && (
        <div className="toast-msg">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="heading">
        <div>
          <small>{isAdmin ? 'Admin Master Support Console' : 'Channel Partner Support'}</small>
          <h2>{isAdmin ? `All Complaints in System (${complaints.length})` : `My Complaints & Tickets (${complaints.length})`}</h2>
        </div>
        <button
          type="button"
          className="float"
          onClick={() => setShowModal(true)}
          title="Raise Complaint"
          style={{ cursor: 'pointer' }}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="pill" style={{ marginBottom: '14px' }}>
        <button
          type="button"
          className={filter === 'all' ? 'on' : ''}
          onClick={() => setFilter('all')}
        >
          All ({complaints.length})
        </button>
        <button
          type="button"
          className={filter === 'open' ? 'on' : ''}
          onClick={() => setFilter('open')}
        >
          Open ({complaints.filter((c) => c.status === 'open').length})
        </button>
        <button
          type="button"
          className={filter === 'in_progress' ? 'on' : ''}
          onClick={() => setFilter('in_progress')}
        >
          In Progress ({complaints.filter((c) => c.status === 'in_progress').length})
        </button>
        <button
          type="button"
          className={filter === 'resolved' ? 'on' : ''}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({complaints.filter((c) => c.status === 'resolved').length})
        </button>
      </div>

      {loading ? (
        <div className="empty-msg">Loading complaints from MySQL...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-msg">
          No complaints found under this filter. Click <b>+ Raise Complaint</b> below to submit a new complaint.
        </div>
      ) : (
        <div className="list">
          {filtered.map((c) => (
            <div className="complaint" key={c.id} style={{ display: 'block', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <small style={{ fontWeight: '700', color: 'var(--g)' }}>#C{String(c.id).padStart(3, '0')}</small>
                <span className={`status ${(c.status || 'open').toLowerCase().replace('_', '-')}`}>
                  {(c.status || 'open').replace('_', ' ')}
                </span>
              </div>
              <b style={{ fontSize: '15px', color: '#163630' }}>{c.subject}</b>
              <p style={{ fontSize: '13px', color: '#4b5563', margin: '6px 0 10px', lineHeight: 1.45 }}>
                {c.description || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6b7c77', marginBottom: '8px' }}>
                <span>Client: <strong style={{ color: '#163a33' }}>{c.client_name || 'Client'}</strong> ({c.client_phone || 'No phone'})</span>
                {c.partner_name && (
                  <button
                    type="button"
                    className="badge-partner-click"
                    onClick={() => openUserDetails({
                      id: c.partner_id,
                      name: c.partner_name,
                      firm_name: c.partner_firm_name,
                      email: c.partner_email,
                      phone: c.partner_phone,
                      phone2: c.partner_phone2,
                      role: 'partner'
                    })}
                    title="Click to view Channel Partner details (Mail, Mobile, Firm)"
                  >
                    👤 {isAdmin ? `Assigned CP: ${c.partner_name}` : `Private to You (${c.partner_name})`}
                  </button>
                )}
                <span style={{ marginLeft: 'auto' }}>
                  Logged: {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {c.admin_reply && (
                <div className="admin-reply-box">
                  <div
                    className="reply-header clickable-admin-header"
                    onClick={() => {
                      api.getAdminInfo()
                        .then((admin) => openUserDetails(admin))
                        .catch(() => {
                          openUserDetails({
                            name: 'System Administrator',
                            email: 'admin@parksolitaire.com',
                            phone: '+91 98200 12345',
                            role: 'admin'
                          });
                        });
                    }}
                    title="Click to view Administrator contact details (Mail, Mobile)"
                    style={{ cursor: 'pointer' }}
                  >
                    <ShieldAlert size={14} />
                    <span>Admin Resolution Response</span>
                    {c.replied_at && <small>{new Date(c.replied_at).toLocaleString('en-GB')}</small>}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                      View Admin Details →
                    </span>
                  </div>
                  <p className="reply-content">{c.admin_reply}</p>
                </div>
              )}

              <div className="action-row">
                <button
                  type="button"
                  className="btn-sm btn-primary"
                  onClick={() => {
                    setSelectedComplaint(c);
                    setReplyText(c.admin_reply || '');
                    setReplyStatus(c.status || 'open');
                    setShowReplyModal(true);
                  }}
                >
                  <MessageSquare size={13} />
                  {c.admin_reply ? 'Update Reply / Status' : 'Reply & Update Status'}
                </button>

                {isAdmin && (
                  <div className="complaint-status-box">
                    <small style={{ fontSize: '11px', color: '#6b7c77', fontWeight: '600' }}>Change Status:</small>
                    <select
                      className="status-dropdown"
                      value={c.status || 'open'}
                      onChange={(e) => handleQuickStatus(c.id, e.target.value)}
                      title="Change ticket status in MySQL"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="primary"
        style={{ marginTop: '16px' }}
        onClick={() => setShowModal(true)}
      >
        <Plus size={16} /> Raise a New Complaint
      </button>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Raise a New Complaint</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRaiseComplaint}>
              <div className="modal-scroll-body">
                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Select Client *</label>
                  <select
                    required
                    value={newComplaint.client_id}
                    onChange={(e) => setNewComplaint({ ...newComplaint, client_id: e.target.value })}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'No phone'}) {c.partner_name ? `— Channel Partner: ${c.partner_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {isAdmin && (() => {
                  const targetClient = clients.find((c) => String(c.id) === String(newComplaint.client_id)) || clients[0];
                  return targetClient ? (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#1e40af', marginBottom: '14px', lineHeight: 1.4 }}>
                      🔒 <strong>Targeted Channel Partner:</strong> This complaint will reflect <strong>ONLY</strong> to Channel Partner <strong>"{targetClient.partner_name || 'Assigned Partner'}"</strong>. Other channel partners cannot see this ticket.
                    </div>
                  ) : null;
                })()}

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Complaint Subject / Issue *</label>
                  <input
                    required
                    value={newComplaint.subject}
                    onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
                    placeholder="e.g. Tower A - Water Leakage / Possession Delay"
                  />
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Initial Status</label>
                  <select
                    value={newComplaint.status}
                    onChange={(e) => setNewComplaint({ ...newComplaint, status: e.target.value })}
                  >
                    <option value="open">Open (Needs Attention)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Detailed Description of Complaint</label>
                  <textarea
                    rows={4}
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    placeholder="Describe the complaint in detail, including affected unit, dates, and client requirements..."
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save"><Check size={16} /> Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reply & Status Modal */}
      {showReplyModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply & Update Complaint #C{String(selectedComplaint.id).padStart(3, '0')}</h3>
              <button type="button" className="close-btn" onClick={() => setShowReplyModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReplySubmit}>
              <div className="modal-scroll-body">
                <div style={{ background: '#f5f8f7', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <b style={{ fontSize: '13px', display: 'block', color: '#163a33' }}>{selectedComplaint.subject}</b>
                  <p style={{ fontSize: '12px', color: '#6b7c77', marginTop: '4px' }}>
                    {selectedComplaint.description || 'No description provided.'}
                  </p>
                  <small style={{ color: '#075c4d', display: 'block', marginTop: '4px' }}>
                    Client: {selectedComplaint.client_name} ({selectedComplaint.client_phone || 'No phone'})
                  </small>
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Update Ticket Status</label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                  >
                    <option value="open">Open (Active)</option>
                    <option value="in_progress">In Progress (Investigating)</option>
                    <option value="resolved">Resolved (Action Completed)</option>
                    <option value="closed">Closed (Ticket Closed)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Admin Resolution Response / Reply *</label>
                  <textarea
                    required
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type resolution explanation, assigned technician, or follow-up response here..."
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowReplyModal(false)}>Cancel</button>
                <button type="submit" className="btn-save"><Check size={16} /> Save Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (Figma Screen 9) */}
      <button
        type="button"
        className="fab-figma"
        onClick={() => setShowModal(true)}
        title="Raise Complaint"
        aria-label="Raise Complaint"
      >
        <Plus size={22} />
      </button>
    </Shell>
  );
}

function Payments() {
  const { openUserDetails } = useUserModal();
  const userStr = localStorage.getItem('user');
  let currentUser = { role: 'partner', id: 2, name: 'Channel Partner', firm_name: '' };
  try { if (userStr) currentUser = JSON.parse(userStr); } catch {}
  const isAdmin = currentUser.role === 'admin';

  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  // Modals state
  const [showRaiseBillModal, setShowRaiseBillModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [payoutDate, setPayoutDate] = useState('');
  const [payoutRef, setPayoutRef] = useState('');

  // Raise a Bill form state (Channel Partner)
  const initialBillForm = {
    client_id: '',
    client_name: '',
    purchase_details: '',
    agreement_value: '',
    brokerage_percent: '2.0',
    account_details: 'HDFC Bank - Current Account',
    account_holder_name: currentUser.firm_name || currentUser.name || '',
    account_no: '',
    ifsc_code: '',
    branch: ''
  };
  const [billForm, setBillForm] = useState(initialBillForm);

  const loadData = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    Promise.all([
      api.getBills().catch(() => []),
      api.getClients().catch(() => [])
    ])
      .then(([b, c]) => {
        setBills(Array.isArray(b) ? b : []);
        const clientList = Array.isArray(c) ? c : [];
        setClients(clientList);

        if (clientList.length > 0) {
          setBillForm((prev) => ({
            ...prev,
            client_id: prev.client_id || clientList[0].id,
            client_name: prev.client_name || clientList[0].name
          }));
        }
      })
      .catch(() => {})
      .finally(() => { if (showSpinner) setLoading(false); });
  };

  useEffect(() => {
    loadData(true);
    const handleRefresh = () => loadData(false);
    window.addEventListener('portal-refresh', handleRefresh);
    return () => window.removeEventListener('portal-refresh', handleRefresh);
  }, []);

  // Live calculations for Raise a Bill
  const agreementNum = parseFloat(billForm.agreement_value) || 0;
  const brokerageNum = parseFloat(billForm.brokerage_percent) || 0;
  const totalBillCalculated = (agreementNum * brokerageNum) / 100;

  // Strict 10 or 12 digit Account Number validation
  const cleanAcct = String(billForm.account_no || '').trim();
  const isDigitsOnly = /^\d+$/.test(cleanAcct);
  const isExactLength = cleanAcct.length === 10 || cleanAcct.length === 12;
  const isAcctValid = isDigitsOnly && isExactLength;

  const handleClientSelect = (clientId) => {
    const found = clients.find((c) => String(c.id) === String(clientId));
    if (found) {
      setBillForm((prev) => ({
        ...prev,
        client_id: found.id,
        client_name: found.name,
        purchase_details: prev.purchase_details || (found.unit_type ? `${found.unit_type} Unit - Park Solitaire` : '')
      }));
    }
  };

  // Submit Raise a Bill (Channel Partner)
  const handleRaiseBillSubmit = async (e) => {
    e.preventDefault();
    if (!isAcctValid) {
      alert('Account number must be strictly 10 or 12 digits only.');
      return;
    }
    if (!billForm.client_name.trim()) {
      alert('Please specify a client name.');
      return;
    }
    if (agreementNum <= 0) {
      alert('Please enter a valid agreement value.');
      return;
    }

    try {
      await api.createBill({
        ...billForm,
        agreement_value: agreementNum,
        brokerage_percent: brokerageNum,
        total_bill: totalBillCalculated
      });
      setShowRaiseBillModal(false);
      setBillForm({
        ...initialBillForm,
        client_id: clients[0]?.id || '',
        client_name: clients[0]?.name || ''
      });
      setToast('Brokerage Bill raised successfully! Sent to Admin for payment.');
      setTimeout(() => setToast(''), 4500);
      loadData();
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to raise bill');
    }
  };

  // Admin Make Payment for a CP Bill
  const handleAdminPayoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    try {
      await api.payBill(selectedBillForPayment.id, {
        paid_date: payoutDate || new Date().toISOString().slice(0, 10),
        payment_reference: payoutRef || 'Online Bank Payout'
      });
      setShowPayoutModal(false);
      setSelectedBillForPayment(null);
      setToast(`Payment of ₹${Number(selectedBillForPayment.total_bill).toLocaleString('en-IN')} marked as Paid!`);
      setTimeout(() => setToast(''), 4500);
      loadData();
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to process payout');
    }
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    if (filter === 'all') return true;
    return (b.status || '').toLowerCase() === filter.toLowerCase();
  });

  return (
    <Shell>
      {toast && (
        <div className="toast-msg">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="heading">
        <div>
          <small>{isAdmin ? 'Finance & Brokerage Admin' : 'Brokerage Commission & Billing'}</small>
          <h2>{isAdmin ? 'CP Bills & Payment Approvals' : 'My Brokerage Bills & Payments'}</h2>
        </div>
        {!isAdmin && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowRaiseBillModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontWeight: '600' }}
            title="Raise a Bill for Brokerage Commission"
          >
            <Plus size={16} /> Raise a Bill
          </button>
        )}
      </div>

      <div className="filter-pills-row" style={{ marginTop: '4px', marginBottom: '16px' }}>
        {['All', 'Pending', 'Paid'].map((st) => (
          <button
            key={st}
            type="button"
            className={`filter-pill-btn ${filter === st.toLowerCase() ? 'active' : ''}`}
            onClick={() => setFilter(st.toLowerCase())}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-msg">Loading brokerage bills from MySQL...</div>
      ) : filteredBills.length === 0 ? (
        <div className="empty-msg">
          No bills found matching this filter.
          {!isAdmin && (
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn-sm btn-primary"
                onClick={() => setShowRaiseBillModal(true)}
              >
                <Plus size={14} /> Raise a Bill Now
              </button>
            </div>
          )}
        </div>
      ) : (
          <div className="list">
            {filteredBills.map((b) => (
              <div
                key={b.id}
                className="bill-card-figma"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  marginBottom: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: '#163630' }}>
                        Bill #{b.id} — {b.client_name}
                      </strong>
                      <span className={`status-pill-figma ${b.status === 'paid' ? 'paid' : 'pending'}`}>
                        {b.status === 'paid' ? 'Paid' : 'Pending Payment'}
                      </span>
                    </div>
                    <small style={{ color: '#6b7c77', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                      Raised on {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </small>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#6b7c77', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Brokerage Bill Amount
                    </div>
                    <strong style={{ fontSize: '18px', color: '#075c4d', fontWeight: '800' }}>
                      ₹ {Number(b.total_bill).toLocaleString('en-IN')}
                    </strong>
                    <div style={{ fontSize: '11.5px', color: '#6b7c77' }}>
                      {b.brokerage_percent}% of ₹{Number(b.agreement_value).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Purchase & CP Info */}
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Purchase Details: </span>
                    <strong style={{ color: '#1e293b' }}>{b.purchase_details || 'Unit Booking'}</strong>
                  </div>
                  {isAdmin && (
                    <div>
                      <span style={{ color: '#64748b' }}>Channel Partner: </span>
                      <strong style={{ color: '#1e293b' }}>
                        {b.partner_name}{b.partner_firm_name ? ` (${b.partner_firm_name})` : ''}
                      </strong>
                      {b.partner_phone && <span style={{ color: '#64748b' }}> • {b.partner_phone}</span>}
                    </div>
                  )}
                </div>

                {/* Bank Details Section */}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Landmark size={13} style={{ color: '#075c4d' }} />
                      <b>Bank:</b> {b.account_details || 'Bank Account'}
                    </span>
                    <span>
                      <b>A/C Holder:</b> {b.account_holder_name || b.partner_name}
                    </span>
                    <span>
                      <b>A/C No:</b> <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{b.account_no}</code>
                    </span>
                    <span>
                      <b>IFSC:</b> {b.ifsc_code}
                    </span>
                    {b.branch && (
                      <span>
                        <b>Branch:</b> {b.branch}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div>
                    {b.status === 'pending' ? (
                      isAdmin ? (
                        <button
                          type="button"
                          className="btn-sm btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12.5px' }}
                          onClick={() => {
                            setSelectedBillForPayment(b);
                            setPayoutDate(new Date().toISOString().slice(0, 10));
                            setPayoutRef('');
                            setShowPayoutModal(true);
                          }}
                        >
                          <CreditCard size={14} /> Make Payment
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '600' }}>
                          ⏳ Awaiting Admin Approval & Payout
                        </span>
                      )
                    ) : (
                      <div style={{ textAlign: 'right', fontSize: '12px', color: '#15803d' }}>
                        <b>✓ Paid on {new Date(b.paid_date || b.created_at).toLocaleDateString('en-GB')}</b>
                        {b.payment_reference && (
                          <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                            Ref: {b.payment_reference}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Bottom Button for CP */}
      {!isAdmin && (
        <button
          type="button"
          className="primary"
          style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={() => setShowRaiseBillModal(true)}
        >
          <Plus size={16} /> Raise a Bill
        </button>
      )}

      {/* MODAL 1: RAISE A BILL (Channel Partner Form) */}
      {showRaiseBillModal && (
        <div className="modal-overlay" onClick={() => setShowRaiseBillModal(false)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="person" style={{ width: '32px', height: '32px', fontSize: '13px', background: '#dcfce7', color: '#15803d' }}>
                  <Landmark size={16} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px' }}>Raise a Brokerage Bill</h3>
                  <small style={{ color: '#6b7c77', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                    Submit commission bill with purchase & bank details for Admin payout
                  </small>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowRaiseBillModal(false)} title="Close Modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRaiseBillSubmit}>
              <div className="modal-scroll-body">
                {/* SECTION 1: C.P DETAILS */}
                <div className="form-section-title">
                  <Building size={15} style={{ color: '#075c4d' }} />
                  <span>Channel Partner (C.P) Details</span>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '12.5px', color: '#166534', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#15803d', fontWeight: '500' }}>Partner Name: </span>
                    <b>{currentUser.name || 'Channel Partner'}</b>
                  </div>
                  <div>
                    <span style={{ color: '#15803d', fontWeight: '500' }}>Firm: </span>
                    <b>{currentUser.firm_name || 'Independent Real Estate CP'}</b>
                  </div>
                  <div>
                    <span style={{ color: '#15803d', fontWeight: '500' }}>Phone: </span>
                    <b>{currentUser.phone || '+91 98200 12345'}</b>
                  </div>
                  <div>
                    <span style={{ color: '#15803d', fontWeight: '500' }}>Email: </span>
                    <b>{currentUser.email || 'partner@example.com'}</b>
                  </div>
                </div>

                {/* SECTION 2: CLIENT & PURCHASE DETAILS */}
                <div className="form-section-title">
                  <UserCheck size={15} style={{ color: '#075c4d' }} />
                  <span>Client & Purchase Details</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-field full-col">
                    <label>Select Client *</label>
                    <select
                      value={billForm.client_id}
                      onChange={(e) => handleClientSelect(e.target.value)}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone || 'No phone'}) {c.unit_type ? `— ${c.unit_type}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field full-col">
                    <label>Client Name (As per Agreement) *</label>
                    <input
                      required
                      placeholder="e.g. Priya Sharma"
                      value={billForm.client_name}
                      onChange={(e) => setBillForm({ ...billForm, client_name: e.target.value })}
                    />
                  </div>

                  <div className="form-field full-col">
                    <label>Purchase Details (Unit / Flat / Tower) *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Flat 402, Tower B - 2 BHK Luxury, Park Solitaire"
                      value={billForm.purchase_details}
                      onChange={(e) => setBillForm({ ...billForm, purchase_details: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Agreement Value (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 6500000"
                      value={billForm.agreement_value}
                      onChange={(e) => setBillForm({ ...billForm, agreement_value: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Brokerage Charge in Percentage (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      max="100"
                      placeholder="e.g. 2.0"
                      value={billForm.brokerage_percent}
                      onChange={(e) => setBillForm({ ...billForm, brokerage_percent: e.target.value })}
                    />
                  </div>
                </div>

                {/* LIVE CALCULATION HIGHLIGHT */}
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px 16px', margin: '12px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                      Auto-Calculated Total C.P Bill
                    </div>
                    <small style={{ color: '#065f46', fontSize: '12px' }}>
                      {brokerageNum}% of ₹{agreementNum.toLocaleString('en-IN')}
                    </small>
                  </div>
                  <div style={{ fontSize: '22px', color: '#065f46', fontWeight: '800' }}>
                    ₹ {Number(totalBillCalculated.toFixed(2)).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* SECTION 3: C.P BANK DETAILS */}
                <div className="form-section-title">
                  <CreditCard size={15} style={{ color: '#075c4d' }} />
                  <span>C.P Bank Details (Payout Destination)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-field full-col">
                    <label>Account Details (Bank Name & Account Type) *</label>
                    <input
                      required
                      placeholder="e.g. HDFC Bank - Current Account"
                      value={billForm.account_details}
                      onChange={(e) => setBillForm({ ...billForm, account_details: e.target.value })}
                    />
                  </div>

                  <div className="form-field full-col">
                    <label>Account Holder Name *</label>
                    <input
                      required
                      placeholder="e.g. Rahul Sharma / Shree Realty Advisory"
                      value={billForm.account_holder_name}
                      onChange={(e) => setBillForm({ ...billForm, account_holder_name: e.target.value })}
                    />
                  </div>

                  <div className="form-field full-col">
                    <label>Account No (Strictly 10 or 12 Digits Only) *</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="Enter 10 or 12 digit bank account number"
                      value={billForm.account_no}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setBillForm({ ...billForm, account_no: val });
                      }}
                      style={{
                        borderColor: cleanAcct.length > 0 && !isAcctValid ? '#dc2626' : isAcctValid ? '#16a34a' : undefined
                      }}
                    />
                    {cleanAcct.length === 0 ? (
                      <small style={{ color: '#6b7c77', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                        Account number must be strictly 10 or 12 numeric digits.
                      </small>
                    ) : !isAcctValid ? (
                      <small style={{ color: '#dc2626', fontSize: '11px', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                        ⚠️ Account number must be strictly 10 or 12 digits (currently {cleanAcct.length} digits).
                      </small>
                    ) : (
                      <small style={{ color: '#16a34a', fontSize: '11px', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                        ✓ Valid {cleanAcct.length}-digit Bank Account Number
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label>IFSC Code *</label>
                    <input
                      required
                      placeholder="e.g. HDFC0001234"
                      value={billForm.ifsc_code}
                      onChange={(e) => setBillForm({ ...billForm, ifsc_code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Branch *</label>
                    <input
                      required
                      placeholder="e.g. FC Road Branch, Pune"
                      value={billForm.branch}
                      onChange={(e) => setBillForm({ ...billForm, branch: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRaiseBillModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={!isAcctValid || agreementNum <= 0}
                  style={{ opacity: !isAcctValid || agreementNum <= 0 ? 0.6 : 1 }}
                >
                  <Check size={16} /> Raise a Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN MAKE PAYMENT FOR CP BILL */}
      {showPayoutModal && selectedBillForPayment && (
        <div className="modal-overlay" onClick={() => setShowPayoutModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="person" style={{ width: '30px', height: '30px', background: '#dcfce7', color: '#15803d' }}>
                  <CreditCard size={15} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Make Payment to Channel Partner</h3>
                  <small style={{ color: '#6b7c77', fontSize: '11px' }}>Bill #{selectedBillForPayment.id} — Brokerage Payout</small>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowPayoutModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdminPayoutSubmit}>
              <div className="modal-scroll-body">
                {/* Payee Details */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px', fontSize: '12.5px' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Payee Partner: </span>
                    <strong style={{ color: '#1e293b' }}>{selectedBillForPayment.partner_name}</strong>
                    {selectedBillForPayment.partner_firm_name && ` (${selectedBillForPayment.partner_firm_name})`}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Client & Unit: </span>
                    <strong>{selectedBillForPayment.client_name}</strong> • {selectedBillForPayment.purchase_details || 'Unit Booking'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
                    <span style={{ color: '#64748b' }}>Payout Amount:</span>
                    <strong style={{ fontSize: '18px', color: '#075c4d' }}>
                      ₹ {Number(selectedBillForPayment.total_bill).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Bank Details of CP */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '12px', color: '#1e40af' }}>
                  <div style={{ fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Landmark size={14} /> Bank Account for Payout:
                  </div>
                  <div><b>Bank:</b> {selectedBillForPayment.account_details}</div>
                  <div><b>Holder:</b> {selectedBillForPayment.account_holder_name}</div>
                  <div><b>A/C No:</b> <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{selectedBillForPayment.account_no}</code></div>
                  <div><b>IFSC:</b> {selectedBillForPayment.ifsc_code}</div>
                  {selectedBillForPayment.branch && <div><b>Branch:</b> {selectedBillForPayment.branch}</div>}
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                  />
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Payment Reference / UTR Number / Transaction ID *</label>
                  <input
                    required
                    placeholder="e.g. UTR-9876543210 / NEFT-CMS8821"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" style={{ background: '#15803d' }}>
                  <Check size={16} /> Confirm Payment & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Shell>
  );
}

function Partners() {
  const { openUserDetails } = useUserModal();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPartners = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    api.getAdminPartners()
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => { if (showSpinner) setLoading(false); });
  };

  useEffect(() => {
    loadPartners(true);
    const handleRefresh = () => loadPartners(false);
    window.addEventListener('portal-refresh', handleRefresh);
    return () => window.removeEventListener('portal-refresh', handleRefresh);
  }, []);

  return (
    <Shell>
      <div className="heading">
        <Link to="/admin/dashboard"><ArrowLeft size={19} /></Link>
        <div>
          <small>Administration</small>
          <h2>Registered Channel Partners ({partners.length})</h2>
        </div>
      </div>

      {loading ? (
        <div className="empty-msg">Loading channel partners...</div>
      ) : partners.length === 0 ? (
        <div className="empty-msg">No channel partners found.</div>
      ) : (
        <div className="list">
          {partners.map((p) => (
            <div
              className="client client-clickable"
              key={p.id}
              onClick={() => openUserDetails(p)}
              title="Click to view Channel Partner details (Mail, Mobile, Firm)"
              role="button"
              tabIndex={0}
            >
              <span className="person">
                {(p.name || 'P').charAt(0).toUpperCase()}
              </span>
              <div className="client-info">
                <b>
                  <span className="partner-name-link">{p.name}</span>
                  {p.firm_name && (
                    <span className="badge badge-partner" style={{ marginLeft: '6px' }}>
                      🏢 {p.firm_name}
                    </span>
                  )}
                </b>
                <small>
                  ✉️ {p.email}
                  {(p.phone || p.phone2) && (
                    <> • 📞 {[p.phone, p.phone2].filter(Boolean).join(' / ')}</>
                  )}
                </small>
                <small style={{ color: '#9ca3af' }}>
                  Registered: {new Date(p.created_at).toLocaleDateString()}
                </small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status ${p.status === 'active' ? 'visited' : 'open'}`}>
                  {p.status}
                </span>
                <ChevronRight size={16} color="#9ca3af" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function App() {
  const [modalUser, setModalUser] = useState(null);

  const openUserDetails = (targetUser) => {
    if (!targetUser) return;
    setModalUser(targetUser);
  };

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail) setModalUser(e.detail);
    };
    window.addEventListener('open-user-details', handleOpen);
    return () => window.removeEventListener('open-user-details', handleOpen);
  }, []);

  return (
    <UserModalContext.Provider value={{ openUserDetails }}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login defaultRole="partner" />} />
        <Route path="/partner/login" element={<Login defaultRole="partner" />} />
        <Route path="/admin/login" element={<Login defaultRole="admin" />} />
        <Route path="/admin-login" element={<Login defaultRole="admin" />} />
        <Route path="/register" element={<Register />} />

        {/* Direct Shortcuts / Aliases */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/partner" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="/visits" element={<Navigate to="/login" replace />} />
        <Route path="/clients" element={<Navigate to="/login" replace />} />
        <Route path="/payments" element={<Navigate to="/login" replace />} />

        {/* Partner routes */}
        <Route path="/partner/dashboard" element={<Dashboard />} />
        <Route path="/partner/clients" element={<Clients />} />
        <Route path="/partner/clients/:id" element={<Details />} />
        <Route path="/partner/visits" element={<Visits />} />
        <Route path="/partner/complaints" element={<Complaints />} />
        <Route path="/partner/payments" element={<Payments />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<Dashboard admin />} />
        <Route path="/admin/clients" element={<Clients />} />
        <Route path="/admin/clients/:id" element={<Details />} />
        <Route path="/admin/visits" element={<Visits />} />
        <Route path="/admin/complaints" element={<Complaints />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/partners" element={<Partners />} />

        {/* Catch-all route to prevent blank screens on invalid URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {modalUser && (
        <UserDetailsModal
          user={modalUser}
          onClose={() => setModalUser(null)}
        />
      )}
    </UserModalContext.Provider>
  );
}

export default App;
