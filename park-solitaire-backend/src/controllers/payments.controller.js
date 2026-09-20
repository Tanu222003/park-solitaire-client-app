import pool from '../config/db.js';
import { broadcastEvent } from '../config/events.js';

export async function getPayments(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const sql = `
      SELECT p.*, c.name AS client_name, c.phone AS client_phone,
             u.name AS partner_name, u.firm_name AS partner_firm_name,
             u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM payments p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN users u ON u.id = p.partner_id
      ${isAdmin ? '' : 'WHERE p.partner_id = ?'}
      ORDER BY p.due_date DESC, p.id DESC
    `;
    const [rows] = await pool.query(sql, isAdmin ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req, res, next) {
  try {
    const { client_id, amount, due_date, paid_date, status } = req.body || {};
    if (!client_id || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'client_id and amount are required' });
    }

    const [clients] = await pool.query('SELECT partner_id FROM clients WHERE id = ?', [client_id]);
    if (clients.length === 0) return res.status(404).json({ message: 'Client not found' });
    if (req.user.role !== 'admin' && clients[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your client' });
    }

    const [result] = await pool.query(
      'INSERT INTO payments (client_id, partner_id, amount, due_date, paid_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, req.user.id, amount, due_date || null, paid_date || null, status || 'pending']
    );
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
    broadcastEvent('PAYMENT_CREATED', {
      payment: rows[0],
      message: `New payment of ₹${Number(amount).toLocaleString('en-IN')} recorded`
    });
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updatePayment(req, res, next) {
  try {
    const { amount, due_date, paid_date, status } = req.body || {};
    const [existing] = await pool.query('SELECT partner_id FROM payments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Payment not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your payment' });
    }

    await pool.query(
      `UPDATE payments SET
         amount    = COALESCE(?, amount),
         due_date  = COALESCE(?, due_date),
         paid_date = COALESCE(?, paid_date),
         status    = COALESCE(?, status)
       WHERE id = ?`,
      [amount ?? null, due_date ?? null, paid_date ?? null, status ?? null, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    broadcastEvent('PAYMENT_UPDATED', {
      payment: rows[0],
      message: `Payment status updated to ${status || rows[0]?.status}`
    });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deletePayment(req, res, next) {
  try {
    const [existing] = await pool.query('SELECT partner_id FROM payments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Payment not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your payment' });
    }

    await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id]);
    broadcastEvent('PAYMENT_DELETED', {
      paymentId: req.params.id,
      message: `Payment record #${req.params.id} deleted`
    });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
}
