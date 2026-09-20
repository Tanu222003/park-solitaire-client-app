import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bell, CalendarDays, Check, CheckCircle2, ChevronRight,
  CircleDollarSign, ClipboardList, Edit, FileWarning, Home, Lock,
  LogIn, LogOut, Menu, MessageSquare, MoreHorizontal, Plus, Search,
  Send, Settings, Users, X, Phone, Mail, MapPin, Building, Tag,
  UserCheck, ShieldAlert, Clock
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

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('partner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(getServerUrl());
  const [inputServerUrl, setInputServerUrl] = useState(getServerUrl());

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email/ID and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email: email.trim(), password });
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

  return (
    <Auth>
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={role === 'partner' ? 'on' : ''}
          onClick={() => { setRole('partner'); setError(''); }}
        >
          Channel Partner
        </button>
        <button
          type="button"
          className={role === 'admin' ? 'on' : ''}
          onClick={() => { setRole('admin'); setError(''); }}
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
          <button type="button" className="linkbtn" onClick={() => setRole('partner')}>
            Switch to Channel Partner Login
          </button>
        </div>
      )}

      {/* Mobile Backend IP Configuration */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowServerConfig(!showServerConfig)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7c77',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
          title="Change Backend Server IP for Phone / Local Network"
        >
          <Settings size={12} /> Server: <b>{currentServerUrl.replace(/^https?:\/\//, '')}</b>
        </button>
      </div>

      {showServerConfig && (
        <div style={{
          marginTop: '10px',
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          fontSize: '12px',
          textAlign: 'left'
        }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#163a33' }}>
            Backend API IP / URL:
          </label>
          <input
            type="text"
            value={inputServerUrl}
            onChange={(e) => setInputServerUrl(e.target.value)}
            placeholder="http://192.168.1.110:5001/api"
            style={{ width: '100%', marginBottom: '8px', fontSize: '12px', padding: '6px 8px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-sm"
              onClick={() => {
                setServerUrl('');
                setCurrentServerUrl(getServerUrl());
                setInputServerUrl(getServerUrl());
                setShowServerConfig(false);
              }}
              style={{ fontSize: '11px', padding: '4px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
            >
              Reset Default
            </button>
            <button
              type="button"
              className="btn-sm btn-primary"
              onClick={() => {
                setServerUrl(inputServerUrl);
                setCurrentServerUrl(getServerUrl());
                setShowServerConfig(false);
                alert(`Server IP saved: ${getServerUrl()}`);
              }}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Save IP
            </button>
          </div>
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

    if (!form.firm_name.trim() || !form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      setError('Firm Name, Primary Contact Number, Email ID, and Password are required.');
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

        <label>Primary Contact Number *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Enter phone number"
        />

        <label>Email ID *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Enter email address"
        />

        <label>Alternate Number <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '11.5px' }}>(Optional)</span></label>
        <input
          type="tel"
          value={form.phone2}
          onChange={(e) => setForm({ ...form, phone2: e.target.value })}
          placeholder="Enter alternate number"
        />

        <label>Password *</label>
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
          {loading ? 'Registering...' : 'Register as Channel Partner'}
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

  // Real-Time Server-Sent Events (SSE) stream listener + heartbeat fallback
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const eventsUrl = `${apiUrl}/events`;
    let eventSource = null;

    try {
      eventSource = new EventSource(eventsUrl);
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.type && payload.type !== 'CONNECTED') {
            const dataObj = payload.payload || payload.data || {};
            const targetPartnerId = dataObj.targetPartnerId;

            // Channel Partner targeting privacy:
            // If logged in as partner, and this event has a targeted partner ID,
            // ONLY display toast and refresh if current user matches targetPartnerId!
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

    // Fallback heartbeat polling interval (6s)
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('portal-refresh', { detail: { type: 'HEARTBEAT' } }));
    }, 6000);

    return () => {
      if (eventSource) eventSource.close();
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

  const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tmrw.getFullYear()}-${pad(tmrw.getMonth() + 1)}-${pad(tmrw.getDate())}`;

  const rawStr = String(visitDate).trim();
  const datePrefix = rawStr.slice(0, 10);

  if (datePrefix === todayStr) {
    return { isToday: true, isTomorrow: false, formattedDate: 'Today' };
  }
  if (datePrefix === tomorrowStr) {
    return { isToday: false, isTomorrow: true, formattedDate: 'Tomorrow' };
  }

  // Also check standard date parsing in local timezone
  const d = new Date(visitDate);
  if (!isNaN(d.getTime())) {
    const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (localStr === todayStr) return { isToday: true, isTomorrow: false, formattedDate: 'Today' };
    if (localStr === tomorrowStr) return { isToday: false, isTomorrow: true, formattedDate: 'Tomorrow' };
    return {
      isToday: false,
      isTomorrow: false,
      formattedDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    };
  }

  return { isToday: false, isTomorrow: false, formattedDate: '' };
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

  const todayVisits = visits.filter((v) => getVisitDayClassification(v.visit_date).isToday);
  const tomorrowVisits = visits.filter((v) => getVisitDayClassification(v.visit_date).isTomorrow);
  const currentList = activeTab === 'today' ? todayVisits : tomorrowVisits;

  const now = new Date();
  const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
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
              <strong>{todayVisits.length}</strong> Today ({todayDateFormatted}) • <strong>{tomorrowVisits.length}</strong> Tomorrow ({tomorrowDateFormatted})
            </span>
          </div>
          <h3 className="upcoming-visits-title">Today &amp; Tomorrow Client Visits</h3>
        </div>

        <div className="upcoming-visits-actions">
          <button
            type="button"
            className="btn-quick-schedule"
            onClick={() => onOpenSchedule(activeTab)}
            title="Schedule a visit for today or tomorrow"
          >
            <Plus size={15} />
            <span>Schedule Visit</span>
          </button>
          <Link to={`${prefix}/visits`} className="view-all-link">
            All Visits ({visits.length})
          </Link>
        </div>
      </div>

      {/* Tab toggle: Today vs Tomorrow */}
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
      </div>

      {/* Visits List */}
      <div className="upcoming-visits-list">
        {currentList.length === 0 ? (
          <div className="upcoming-visits-empty">
            <div className="empty-icon-circle">
              <CalendarDays size={26} />
            </div>
            <h4>No visits scheduled for {activeTab === 'today' ? `Today (${todayDateFormatted})` : `Tomorrow (${tomorrowDateFormatted})`}</h4>
            <p>
              {activeTab === 'today'
                ? 'No client visits are booked for today yet. Schedule site visits with interested buyers.'
                : 'No client visits booked for tomorrow yet. Lock in appointments in advance.'}
            </p>
            <button
              type="button"
              className="btn-primary-compact"
              onClick={() => onOpenSchedule(activeTab)}
            >
              <Plus size={14} /> Schedule {activeTab === 'today' ? "Today's" : "Tomorrow's"} Visit
            </button>
          </div>
        ) : (
          currentList.map((v) => {
            const cleanPhone = v.client_phone ? v.client_phone.replace(/[^0-9+]/g, '') : '';
            return (
              <div
                className={`visit-update-card ${v.status === 'completed' ? 'is-completed' : ''}`}
                key={v.id}
              >
                <div className="visit-card-top-row">
                  <div className="visit-time-chip">
                    <Clock size={13} />
                    <strong>{v.visit_time || '11:00 AM'}</strong>
                    <span className="visit-day-label">
                      {activeTab === 'today' ? 'Today' : 'Tomorrow'}
                    </span>
                  </div>

                  <div className="visit-status-controls">
                    <span className={`visit-status-pill status-${v.status || 'scheduled'}`}>
                      {v.status === 'completed' && <CheckCircle2 size={12} />}
                      {v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : 'Scheduled'}
                    </span>

                    {v.status !== 'completed' && (
                      <button
                        type="button"
                        className="btn-quick-complete"
                        onClick={() => onUpdateStatus(v.id, 'completed')}
                        title="Mark visit as completed in database"
                      >
                        <Check size={12} /> Mark Done
                      </button>
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
                      onClick={() => openUserDetails(v)}
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
    status: 'scheduled'
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
    return () => window.removeEventListener('portal-refresh', handleRefresh);
  }, [admin]);

  const handleUpdateVisitStatus = async (visitId, newStatus) => {
    try {
      await api.updateVisit(visitId, { status: newStatus });
      setToast(`Visit marked as ${newStatus}!`);
      setTimeout(() => setToast(''), 3500);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update visit status');
    }
  };

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;

  const openScheduleModal = (presetDay = 'today') => {
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
      status: 'scheduled'
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
        status: newVisit.status || 'scheduled'
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

      {showScheduleModal && (
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
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
              <small>Total Revenue</small>
              <div className="admin-stat-number">
                ₹ {stats?.totalPaid ? Number(stats.totalPaid).toLocaleString('en-IN') : '42,80,000'}
              </div>
              <span className="admin-stat-sub">Total Value</span>
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
            onOpenSchedule={openScheduleModal}
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
  const userStr = localStorage.getItem('user');
  let user = { role: 'partner' };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const isAdmin = user.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/partner';

  const [clients, setClients] = useState([]);
  const [q, setQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const initialClientForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    unit_type: '2 BHK',
    budget: '₹ 50L - 70L',
    source: 'Referral',
    status: 'Pending',
    visit_date: '',
    visit_time: '',
    visit_notes: ''
  };

  const [newClient, setNewClient] = useState(initialClientForm);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;
  const dayAfterObj = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const dayAfterStr = `${dayAfterObj.getFullYear()}-${pad(dayAfterObj.getMonth() + 1)}-${pad(dayAfterObj.getDate())}`;

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
    return () => window.removeEventListener('portal-refresh', handleRefresh);
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
        {['All', 'Visited', 'Pending', 'Booked'].map((st) => (
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
                    Register client profile & optionally schedule their property visit
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
                    <label>Unit Requirement</label>
                    <input
                      value={newClient.unit_type}
                      onChange={(e) => setNewClient({ ...newClient, unit_type: e.target.value })}
                      placeholder="e.g. 2 BHK, 3 BHK, Penthouse"
                    />
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
                    <label>Lead Source</label>
                    <select
                      value={newClient.source}
                      onChange={(e) => setNewClient({ ...newClient, source: e.target.value })}
                    >
                      <option value="Referral">Referral</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Website">Website</option>
                      <option value="Campaign">Marketing Campaign</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Pipeline Status</label>
                    <select
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Site Visit Planned">Site Visit Planned</option>
                      <option value="Visited">Visited</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="form-field full-col">
                    <label>Full Address / Location</label>
                    <textarea
                      rows={2}
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="e.g. Flat 402, Sector 21, Noida"
                    />
                  </div>
                </div>

                {/* Section 2: Optional Site Visit Scheduling */}
                <div className="client-visit-schedule-section">
                  <div className="visit-schedule-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarDays size={16} style={{ color: '#166534' }} />
                        <strong>Schedule Site Visit (Date & Time)</strong>
                      </div>
                      <span className="optional-tag">Optional</span>
                    </div>
                    <small>
                      Specify when this client will visit. If scheduled for tomorrow, it will alert Admin and appear on Tomorrow's Visit Radar instantly!
                    </small>
                  </div>

                  <div className="visit-date-quick-chips">
                    <button
                      type="button"
                      className={`chip ${newClient.visit_date === todayStr ? 'active' : ''}`}
                      onClick={() => setNewClient({ ...newClient, visit_date: todayStr, status: 'Site Visit Planned' })}
                    >
                      📅 Today
                    </button>
                    <button
                      type="button"
                      className={`chip ${newClient.visit_date === tomorrowStr ? 'active' : ''}`}
                      onClick={() => setNewClient({ ...newClient, visit_date: tomorrowStr, status: 'Site Visit Planned' })}
                    >
                      ⚡ Tomorrow
                    </button>
                    <button
                      type="button"
                      className={`chip ${newClient.visit_date === dayAfterStr ? 'active' : ''}`}
                      onClick={() => setNewClient({ ...newClient, visit_date: dayAfterStr, status: 'Site Visit Planned' })}
                    >
                      🗓️ In 2 Days
                    </button>
                    {newClient.visit_date && (
                      <button
                        type="button"
                        className="chip clear-chip"
                        onClick={() => setNewClient({ ...newClient, visit_date: '', visit_time: '', visit_notes: '' })}
                      >
                        ✕ Clear Visit
                      </button>
                    )}
                  </div>

                  <div className="form-grid-2" style={{ marginBottom: '10px' }}>
                    <div className="form-field">
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>Visit Date</label>
                      <input
                        type="date"
                        min={todayStr}
                        value={newClient.visit_date}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          visit_date: e.target.value,
                          status: e.target.value ? 'Site Visit Planned' : newClient.status
                        })}
                      />
                    </div>
                    <div className="form-field">
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>Visit Time</label>
                      <input
                        type="time"
                        value={newClient.visit_time}
                        onChange={(e) => setNewClient({ ...newClient, visit_time: e.target.value })}
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
                          🟢 <strong>Today's Live Radar:</strong> This visit will immediately appear under <strong>Today's Scheduled Visits</strong> with 1-click completion.
                        </span>
                      ) : (
                        <span>
                          🗓️ <strong>Scheduled Visit:</strong> Appointment recorded for <strong>{newClient.visit_date}</strong> {newClient.visit_time ? `at ${newClient.visit_time}` : ''}.
                        </span>
                      )}
                    </div>
                  )}

                  <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>Visit Notes / Remarks</label>
                    <input
                      value={newClient.visit_notes}
                      onChange={(e) => setNewClient({ ...newClient, visit_notes: e.target.value })}
                      placeholder="e.g. Interested in 3 BHK Sample Flat tour"
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

function Details() {
  const { openUserDetails } = useUserModal();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [toast, setToast] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  // Schedule Visit Modal inside details
  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [newVisitData, setNewVisitData] = useState({
    visit_date: '',
    visit_time: '11:00 AM',
    notes: '',
    status: 'scheduled'
  });

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

  const handleOpenScheduleVisit = () => {
    setNewVisitData({
      visit_date: todayStr,
      visit_time: '11:00 AM',
      notes: `Site tour of ${client?.unit_type || '2 BHK'} show flat and amenities inspection`,
      status: 'scheduled'
    });
    setShowScheduleVisitModal(true);
  };

  const handleCreateVisitForClient = async (e) => {
    e.preventDefault();
    if (!newVisitData.visit_date) {
      alert('Please select a visit date.');
      return;
    }
    setScheduleSubmitting(true);
    try {
      await api.createVisit({
        client_id: client.id,
        visit_date: newVisitData.visit_date,
        visit_time: newVisitData.visit_time || '11:00 AM',
        notes: newVisitData.notes || '',
        status: newVisitData.status || 'scheduled'
      });
      setShowScheduleVisitModal(false);
      setToast('Visit successfully scheduled & saved to MySQL!');
      setTimeout(() => setToast(''), 4000);
      setTab('visits');
      loadClient();
      window.dispatchEvent(new CustomEvent('portal-refresh'));
    } catch (err) {
      alert(err.message || 'Failed to schedule visit');
    } finally {
      setScheduleSubmitting(false);
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
        <button type="button" className="btn-sm" onClick={() => setShowEditModal(true)}>
          <Edit size={14} /> Edit Client
        </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <small style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Status in MySQL:</small>
          <select
            className="status-dropdown"
            style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }}
            value={client.status || 'Pending'}
            onChange={(e) => handleStatusChange(e.target.value)}
            title="Change client status in MySQL"
          >
            <option value="Pending">Pending</option>
            <option value="Visited">Visited</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Booked">Booked</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="subtabs">
        <button type="button" className={tab === 'details' ? 'on' : ''} onClick={() => setTab('details')}>
          Full Details
        </button>
        <button type="button" className={tab === 'visits' ? 'on' : ''} onClick={() => setTab('visits')}>
          Visits ({client.visits?.length || 0})
        </button>
        <button type="button" className={tab === 'payments' ? 'on' : ''} onClick={() => setTab('payments')}>
          Payments ({client.payments?.length || 0})
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
            ['Unit Type Requirement', client.unit_type || '2 BHK / 3 BHK'],
            ['Budget Range', client.budget || '₹ 50L - 70L'],
            ['Lead Source', client.source || 'Referral'],
            ['Status', client.status || 'Pending'],
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
              <h4 style={{ margin: 0, fontSize: '15px', color: '#163a33' }}>Site Visits History ({client.visits?.length || 0})</h4>
              <small style={{ color: '#6b7c77' }}>Scheduled tours and client walk-ins</small>
            </div>
            <button
              type="button"
              className="btn-sm btn-primary"
              onClick={handleOpenScheduleVisit}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12.5px' }}
            >
              <Plus size={14} /> + Schedule Visit
            </button>
          </div>
          {(!client.visits || client.visits.length === 0) ? (
            <div className="empty-msg" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ marginBottom: '8px' }}>No site visits recorded for this client yet.</div>
              <button
                type="button"
                className="btn-sm btn-primary"
                onClick={handleOpenScheduleVisit}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
              >
                <Plus size={14} /> Schedule First Visit
              </button>
            </div>
          ) : (
            <div className="timeline">
              {client.visits.map((v) => (
                <div className="visit" key={v.id}>
                  <span className="dot" />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small>{new Date(v.visit_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{v.visit_time ? ` • ⏰ ${v.visit_time}` : ''}</small>
                      <span className={`status-pill-figma ${(v.status || 'scheduled').toLowerCase()}`}>
                        {v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : 'Scheduled'}
                      </span>
                    </div>
                    <b>Site Visit — {v.status || 'Scheduled'}</b>
                    <p>{v.notes || 'No remarks provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="subtab-content">
          {(!client.payments || client.payments.length === 0) ? (
            <div className="empty-msg">No payments recorded for this client.</div>
          ) : (
            <div className="list">
              {client.payments.map((p) => (
                <div className="payment" key={p.id}>
                  <div>
                    <b>₹ {Number(p.amount).toLocaleString('en-IN')}</b>
                    <small>Due: {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A'} • Paid: {p.paid_date ? new Date(p.paid_date).toLocaleDateString() : 'Not paid'}</small>
                  </div>
                  <span className={`status ${(p.status || 'pending').toLowerCase()}`}>{p.status}</span>
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

      {/* Bottom Action Buttons (Figma Screen 7) */}
      <div className="details-bottom-bar-figma">
        <button type="button" className="btn-outline-figma" onClick={() => setShowEditModal(true)}>
          Edit Lead
        </button>
        <button type="button" className="btn-primary-figma" onClick={handleOpenScheduleVisit}>
          + Schedule Visit
        </button>
      </div>

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
                    <input
                      value={editData.unit_type || ''}
                      onChange={(e) => setEditData({ ...editData, unit_type: e.target.value })}
                    />
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
                      value={editData.status || 'Pending'}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Site Visit Planned">Site Visit Planned</option>
                      <option value="Visited">Visited</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Booked">Booked</option>
                      <option value="Closed">Closed</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Lead Source</label>
                    <input
                      value={editData.source || ''}
                      onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                    />
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

      {/* Schedule Client Visit Modal */}
      {showScheduleVisitModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleVisitModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} style={{ color: '#075c4d' }} />
                <h3 style={{ margin: 0 }}>Schedule Visit for {client.name}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowScheduleVisitModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVisitForClient}>
              <div className="modal-scroll-body">
                <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>{client.name}</div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '3px' }}>
                    {client.phone || 'No phone'} • {client.unit_type || '2 BHK'} {client.budget ? `• ${client.budget}` : ''}
                  </div>
                </div>

                {/* Quick Date Chips */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className={`time-preset-btn ${newVisitData.visit_date === todayStr ? 'active' : ''}`}
                    onClick={() => setNewVisitData({ ...newVisitData, visit_date: todayStr })}
                  >
                    📅 Today
                  </button>
                  <button
                    type="button"
                    className={`time-preset-btn ${newVisitData.visit_date === tomorrowStr ? 'active' : ''}`}
                    onClick={() => setNewVisitData({ ...newVisitData, visit_date: tomorrowStr })}
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
                      value={newVisitData.visit_date}
                      onChange={(e) => setNewVisitData({ ...newVisitData, visit_date: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Visit Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:30 AM"
                      value={newVisitData.visit_time}
                      onChange={(e) => setNewVisitData({ ...newVisitData, visit_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Visit Status</label>
                  <select
                    value={newVisitData.status}
                    onChange={(e) => setNewVisitData({ ...newVisitData, status: e.target.value })}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Remarks / Visit Agenda</label>
                  <textarea
                    rows={3}
                    value={newVisitData.notes}
                    onChange={(e) => setNewVisitData({ ...newVisitData, notes: e.target.value })}
                    placeholder="e.g. Site tour of 2 BHK show flat and review payment schedule"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowScheduleVisitModal(false)}>
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
    </Shell>
  );
}

function Visits() {
  const { openUserDetails } = useUserModal();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState('');
  const [newVisit, setNewVisit] = useState({ client_id: '', visit_date: '', visit_time: '11:00 AM', notes: '', status: 'scheduled' });

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${pad(tomorrowObj.getMonth() + 1)}-${pad(tomorrowObj.getDate())}`;

  const openNewVisitModal = () => {
    setNewVisit((prev) => ({
      client_id: prev.client_id || (clients[0]?.id ? String(clients[0].id) : ''),
      visit_date: prev.visit_date || todayStr,
      visit_time: prev.visit_time || '11:00 AM',
      notes: prev.notes || '',
      status: prev.status || 'scheduled'
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
    return () => window.removeEventListener('portal-refresh', handleRefresh);
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
    try {
      await api.createVisit({
        client_id: Number(newVisit.client_id),
        visit_date: newVisit.visit_date,
        visit_time: newVisit.visit_time || '11:00 AM',
        notes: newVisit.notes || '',
        status: newVisit.status || 'scheduled'
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
      await api.updateVisit(visitId, { status: newStatus });
      setToast(`Visit status updated to "${newStatus}" in MySQL!`);
      setTimeout(() => setToast(''), 4000);
      loadData(false);
    } catch (err) {
      alert(err.message || 'Failed to update visit status');
    }
  };

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
          <small>Client Activity & Follow-ups</small>
          <h2>Site Visit Records ({visits.length})</h2>
        </div>
        <button type="button" className="icon" onClick={openNewVisitModal} title="Add Visit">
          <Plus size={18} />
        </button>
      </div>

      {loading ? (
        <div className="empty-msg">Loading visits...</div>
      ) : visits.length === 0 ? (
        <div className="empty-msg">No visit updates recorded yet. Click + Add Update below.</div>
      ) : (
        <div className="timeline">
          {visits.map((v) => (
            <div className="visit" key={v.id}>
              <span className="dot" />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small>
                    {new Date(v.visit_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {v.visit_time ? ` • ⏰ ${v.visit_time}` : ''}
                  </small>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <small style={{ fontSize: '10px', color: '#6b7c77', fontWeight: '600' }}>STATUS:</small>
                    <select
                      className="status-dropdown"
                      value={v.status || 'scheduled'}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                      title="Update visit status in MySQL"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <b style={{ fontSize: '15px', marginTop: '4px' }}>{v.client_name || 'Client Visit'}</b>
                {v.partner_name && (
                  <button
                    type="button"
                    className="badge badge-partner badge-clickable"
                    style={{ margin: '4px 0', display: 'inline-flex' }}
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
                    👤 Partner: {v.partner_name}
                  </button>
                )}
                <p>{v.notes || 'No remarks provided.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="primary" style={{ marginTop: '14px' }} onClick={openNewVisitModal}>
        + Schedule Visit Update
      </button>

      {showModal && (
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
                    onChange={(e) => setNewVisit({ ...newVisit, client_id: e.target.value })}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name} ({c.phone || 'No phone'})</option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <p style={{ color: '#d97706', fontSize: '12px', margin: '4px 0 0' }}>
                      ⚠️ No clients registered yet. Please add a client first.
                    </p>
                  )}
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
                  <select
                    value={newVisit.status}
                    onChange={(e) => setNewVisit({ ...newVisit, status: e.target.value })}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [newPayment, setNewPayment] = useState({
    client_id: '',
    amount: '',
    due_date: '',
    status: 'pending'
  });

  const loadData = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    Promise.all([api.getPayments(), api.getClients()])
      .then(([p, c]) => {
        setPayments(Array.isArray(p) ? p : []);
        setClients(Array.isArray(c) ? c : []);
        if (Array.isArray(c) && c.length > 0) {
          setNewPayment((prev) => ({ ...prev, client_id: prev.client_id || c[0].id }));
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPayment.client_id || !newPayment.amount) return;
    try {
      await api.createPayment(newPayment);
      setShowModal(false);
      setNewPayment({ client_id: clients[0]?.id || '', amount: '', due_date: '', status: 'pending' });
      setToast('Payment record saved to MySQL!');
      setTimeout(() => setToast(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      const paidDate = newStatus === 'paid' ? new Date().toISOString().slice(0, 10) : null;
      await api.updatePayment(paymentId, { status: newStatus, paid_date: paidDate });
      setToast(`Payment marked as "${newStatus}" in MySQL!`);
      setTimeout(() => setToast(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const [filter, setFilter] = useState('all');

  const filtered = payments.filter((p) => {
    if (filter === 'all') return true;
    return (p.status || '').toLowerCase() === filter.toLowerCase();
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
          <small>Finance & Brokerage</small>
          <h2>Payment Status ({payments.length})</h2>
        </div>
        <button type="button" className="icon" onClick={() => setShowModal(true)} title="Record Payment">
          <Plus size={18} />
        </button>
      </div>

      <div className="filter-pills-row">
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
        <div className="empty-msg">Loading payments from MySQL...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-msg">No payment records found matching this filter. Click + to record one.</div>
      ) : (
        <div className="list">
          {filtered.map((p) => (
            <div className="payment payment-row" key={p.id}>
              <div className="payment-info">
                <span className="person">
                  {(p.client_name || 'P').charAt(0).toUpperCase()}
                </span>
                <div className="payment-details">
                  <b>
                    {p.client_name || 'Client'}
                    {p.partner_name && (
                      <button
                        type="button"
                        className="badge badge-partner badge-clickable"
                        onClick={() => openUserDetails({
                          id: p.partner_id,
                          name: p.partner_name,
                          firm_name: p.partner_firm_name,
                          email: p.partner_email,
                          phone: p.partner_phone,
                          phone2: p.partner_phone2,
                          role: 'partner'
                        })}
                        title="Click to view Channel Partner details (Mail, Mobile, Firm)"
                      >
                        👤 CP: {p.partner_name}
                      </button>
                    )}
                  </b>
                  <small>
                    {p.due_date && `Due: ${new Date(p.due_date).toLocaleDateString('en-GB')}`}
                    {p.paid_date && `Paid: ${new Date(p.paid_date).toLocaleDateString('en-GB')}`}
                    {!p.due_date && !p.paid_date && 'Transaction logged'}
                  </small>
                </div>
              </div>

              <div className="payment-actions" style={{ alignItems: 'flex-end' }}>
                <strong style={{ fontSize: '15px', color: '#111827' }}>
                  ₹ {Number(p.amount).toLocaleString('en-IN')}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`status-pill-figma ${(p.status || 'pending').toLowerCase()}`}>
                    {p.status}
                  </span>
                  <select
                    className="status-dropdown"
                    style={{ width: 'auto', padding: '3px 8px', fontSize: '11.5px' }}
                    value={p.status || 'pending'}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    title="Update payment status in MySQL"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Mark Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
        + Record Payment
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record New Payment</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-scroll-body">
                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Select Client *</label>
                  <select
                    value={newPayment.client_id}
                    onChange={(e) => setNewPayment({ ...newPayment, client_id: e.target.value })}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</option>
                    ))}
                  </select>
                </div>

                <div className="form-field" style={{ marginBottom: '12px' }}>
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="50000"
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={newPayment.due_date}
                      onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Status</label>
                    <select
                      value={newPayment.status}
                      onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save"><Check size={16} /> Save Payment</button>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
