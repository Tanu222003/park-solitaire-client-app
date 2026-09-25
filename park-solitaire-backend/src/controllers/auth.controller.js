import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, firm_name: user.firm_name || null, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function register(req, res, next) {
  try {
    const { name, firm_name, contact_name, email, password, phone, phone2 } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'C.P Name, C.P Email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, firm_name, contact_name, email, password, phone, phone2, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, firm_name || null, contact_name || null, email, hashed, phone || null, phone2 || null, 'partner']
    );

    const user = {
      id: result.insertId,
      name,
      firm_name: firm_name || null,
      email,
      role: 'partner',
      phone: phone || null,
      phone2: phone2 || null
    };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role: requestedRole } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanIdentifier = String(email).trim();
    const digitsOnly = cleanIdentifier.replace(/\D/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Allow login by email OR mobile phone / alternate phone (any formatting)
    let [rows] = await pool.query(
      `SELECT * FROM users 
       WHERE email = ? 
          OR phone = ? 
          OR phone2 = ? 
          OR REPLACE(phone, ' ', '') = ? 
          OR (LENGTH(?) >= 10 AND RIGHT(REPLACE(REPLACE(phone, ' ', ''), '+91', ''), 10) = ?)
          OR (LENGTH(?) >= 10 AND RIGHT(REPLACE(REPLACE(phone2, ' ', ''), '+91', ''), 10) = ?)`,
      [cleanIdentifier, cleanIdentifier, cleanIdentifier, cleanIdentifier.replace(/\s+/g, ''), last10, last10, last10, last10]
    );

    if (rows.length === 0 && cleanIdentifier.toLowerCase() === 'admin') {
      [rows] = await pool.query("SELECT * FROM users WHERE email = 'admin@parksolitaire.com'");
    }

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email/mobile or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    // Strict portal role enforcement
    if (requestedRole) {
      if (requestedRole === 'admin' && user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied: Channel Partner credentials cannot be used for Admin login. Please use the Channel Partner login portal.'
        });
      }
      if (requestedRole === 'partner' && user.role !== 'partner') {
        return res.status(403).json({
          message: 'Access denied: Admin accounts must log in through the Admin Portal (/admin/login).'
        });
      }
    }

    res.json({
      token: signToken(user),
      user: {
        id: user.id,
        name: user.name,
        firm_name: user.firm_name || null,
        email: user.email,
        role: user.role,
        phone: user.phone,
        phone2: user.phone2
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, firm_name, contact_name, email, role, phone, phone2, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getUserProfile(req, res, next) {
  try {
    const targetId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, name, firm_name, contact_name, email, role, phone, phone2, status, created_at FROM users WHERE id = ?',
      [targetId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getAdminInfo(_req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, firm_name, contact_name, email, role, phone, phone2, status, created_at FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}
