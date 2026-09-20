import pool from '../config/db.js';
import { broadcastEvent } from '../config/events.js';

export async function getComplaints(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const sql = `
      SELECT co.*, c.name AS client_name, c.phone AS client_phone,
             u.name AS partner_name, u.firm_name AS partner_firm_name,
             u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM complaints co
      JOIN clients c ON c.id = co.client_id
      LEFT JOIN users u ON u.id = co.partner_id
      ${isAdmin ? '' : 'WHERE co.partner_id = ?'}
      ORDER BY co.created_at DESC
    `;
    const [rows] = await pool.query(sql, isAdmin ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createComplaint(req, res, next) {
  try {
    const { client_id, partner_id, subject, description, status } = req.body || {};
    if (!client_id || !subject) {
      return res.status(400).json({ message: 'client_id and subject are required' });
    }

    const [clients] = await pool.query('SELECT partner_id, name FROM clients WHERE id = ?', [client_id]);
    if (clients.length === 0) return res.status(404).json({ message: 'Client not found' });
    if (req.user.role !== 'admin' && clients[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your client' });
    }

    // Determine the Channel Partner:
    // If admin is creating the complaint, it is linked strictly to that client's assigned Channel Partner.
    // If a partner is creating it, it is their own partner id.
    const assignedPartnerId = (req.user.role === 'admin')
      ? (partner_id || clients[0].partner_id)
      : req.user.id;

    const [result] = await pool.query(
      'INSERT INTO complaints (client_id, partner_id, subject, description, status) VALUES (?, ?, ?, ?, ?)',
      [client_id, assignedPartnerId, subject, description || null, status || 'open']
    );
    const [rows] = await pool.query(`
      SELECT co.*, c.name AS client_name, c.phone AS client_phone, u.name AS partner_name
      FROM complaints co
      JOIN clients c ON c.id = co.client_id
      LEFT JOIN users u ON u.id = co.partner_id
      WHERE co.id = ?
    `, [result.insertId]);

    broadcastEvent('COMPLAINT_CREATED', {
      complaint: rows[0],
      author: req.user.name,
      role: req.user.role,
      targetPartnerId: assignedPartnerId, // Only this channel partner and admin!
      message: (req.user.role === 'admin')
        ? `Admin raised issue for ${rows[0].partner_name || 'Channel Partner'}: "${rows[0].subject}" (Client: ${rows[0].client_name})`
        : `${req.user.name} raised complaint: "${rows[0].subject}"`
    });

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { subject, description, status, admin_reply } = req.body || {};
    const [existing] = await pool.query('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Complaint not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your complaint' });
    }

    const resolvedAt = status === 'resolved' ? (existing[0].resolved_at || new Date()) : (status && status !== 'resolved' ? null : existing[0].resolved_at);
    const repliedAt = admin_reply !== undefined ? new Date() : existing[0].replied_at;

    await pool.query(
      `UPDATE complaints SET
         subject     = COALESCE(?, subject),
         description = COALESCE(?, description),
         status      = COALESCE(?, status),
         admin_reply = COALESCE(?, admin_reply),
         replied_at  = COALESCE(?, replied_at),
         resolved_at = ?
       WHERE id = ?`,
      [
        subject ?? null,
        description ?? null,
        status ?? null,
        admin_reply ?? null,
        repliedAt ?? null,
        resolvedAt ?? null,
        req.params.id
      ]
    );

    const [rows] = await pool.query(`
      SELECT co.*, c.name AS client_name, c.phone AS client_phone, u.name AS partner_name
      FROM complaints co
      JOIN clients c ON c.id = co.client_id
      LEFT JOIN users u ON u.id = co.partner_id
      WHERE co.id = ?
    `, [req.params.id]);

    broadcastEvent('COMPLAINT_UPDATED', {
      complaint: rows[0],
      author: req.user.name,
      role: req.user.role,
      targetPartnerId: rows[0].partner_id, // Only this channel partner and admin!
      message: admin_reply
        ? `Admin added a resolution reply for ${rows[0].partner_name || 'Partner'} on Ticket #C${String(rows[0].id).padStart(3, '0')}`
        : `${req.user.name} updated Complaint #C${String(rows[0].id).padStart(3, '0')} to "${rows[0].status}"`
    });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteComplaint(req, res, next) {
  try {
    const [existing] = await pool.query('SELECT partner_id FROM complaints WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Complaint not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your complaint' });
    }

    await pool.query('DELETE FROM complaints WHERE id = ?', [req.params.id]);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
}
