import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export async function getDashboard(_req, res, next) {
  try {
    const [[{ totalPartners }]] = await pool.query(
      "SELECT COUNT(*) AS totalPartners FROM users WHERE role = 'partner'"
    );
    const [[{ totalClients }]] = await pool.query('SELECT COUNT(*) AS totalClients FROM clients');
    const [[{ totalVisits }]] = await pool.query('SELECT COUNT(*) AS totalVisits FROM visits');
    const [[{ openComplaints }]] = await pool.query(
      "SELECT COUNT(*) AS openComplaints FROM complaints WHERE status <> 'resolved'"
    );
    const [[{ pendingPayments, totalPaid }]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount END), 0) AS pendingPayments,
         COALESCE(SUM(CASE WHEN status = 'paid'    THEN amount END), 0) AS totalPaid
       FROM payments`
    );

    res.json({ totalPartners, totalClients, totalVisits, openComplaints, pendingPayments, totalPaid });
  } catch (err) {
    next(err);
  }
}

export async function getPartners(_req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, firm_name, email, phone, phone2, status, created_at FROM users WHERE role = 'partner' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createPartner(req, res, next) {
  try {
    const { name, firm_name, email, password, phone, phone2 } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, firm_name, email, password, phone, phone2, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, firm_name || null, email, hashed, phone || null, phone2 || null, 'partner']
    );

    res.status(201).json({ id: result.insertId, name, firm_name: firm_name || null, email, phone: phone || null, phone2: phone2 || null, role: 'partner', status: 'active' });
  } catch (err) {
    next(err);
  }
}

export async function updatePartnerStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: "status must be 'active' or 'inactive'" });
    }

    const [result] = await pool.query(
      "UPDATE users SET status = ? WHERE id = ? AND role = 'partner'",
      [status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Partner not found' });

    res.json({ message: 'Status updated', id: Number(req.params.id), status });
  } catch (err) {
    next(err);
  }
}
