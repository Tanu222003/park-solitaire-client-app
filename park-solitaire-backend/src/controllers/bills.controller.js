import pool from '../config/db.js';
import { broadcastEvent } from '../config/events.js';

export async function getBills(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const sql = `
      SELECT b.*,
             u.name AS partner_name, u.firm_name AS partner_firm_name,
             u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM bills b
      LEFT JOIN users u ON u.id = b.partner_id
      ${isAdmin ? '' : 'WHERE b.partner_id = ?'}
      ORDER BY b.created_at DESC, b.id DESC
    `;
    const [rows] = await pool.query(sql, isAdmin ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createBill(req, res, next) {
  try {
    const {
      client_id,
      client_name,
      purchase_details,
      agreement_value,
      brokerage_percent,
      account_details,
      account_holder_name,
      account_no,
      ifsc_code,
      branch
    } = req.body || {};

    if (!client_name || !agreement_value || brokerage_percent === undefined) {
      return res.status(400).json({ message: 'Client name, agreement value, and brokerage percentage are required.' });
    }

    const sanitizedAcct = String(account_no || '').trim();
    if (!/^\d{10}$|^\d{12}$/.test(sanitizedAcct)) {
      return res.status(400).json({ message: 'Account Number must be exactly 10 or 12 digits.' });
    }

    const numericAgreement = Number(agreement_value);
    const numericBrokerage = Number(brokerage_percent);
    const totalBill = Number(((numericAgreement * numericBrokerage) / 100).toFixed(2));

    const [result] = await pool.query(
      `INSERT INTO bills (
        partner_id, client_id, client_name, purchase_details,
        agreement_value, brokerage_percent, total_bill,
        account_details, account_holder_name, account_no, ifsc_code, branch, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.id,
        client_id || null,
        client_name.trim(),
        purchase_details || null,
        numericAgreement,
        numericBrokerage,
        totalBill,
        account_details || null,
        account_holder_name || null,
        sanitizedAcct,
        ifsc_code ? ifsc_code.trim().toUpperCase() : null,
        branch || null
      ]
    );

    const [rows] = await pool.query(`
      SELECT b.*,
             u.name AS partner_name, u.firm_name AS partner_firm_name,
             u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM bills b
      LEFT JOIN users u ON u.id = b.partner_id
      WHERE b.id = ?
    `, [result.insertId]);

    const createdBill = rows[0];

    broadcastEvent('BILL_RAISED', {
      bill: createdBill,
      message: `C.P Bill #${createdBill.id} of ₹${Number(totalBill).toLocaleString('en-IN')} raised by ${createdBill.partner_name || 'Channel Partner'}`
    });

    res.status(201).json(createdBill);
  } catch (err) {
    next(err);
  }
}

export async function payBill(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin has authority to process payments.' });
    }

    const { paid_date, payment_reference, transaction_id, transactionId } = req.body || {};
    const [existing] = await pool.query('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const effectivePaidDate = paid_date || new Date().toISOString().slice(0, 10);
    const ref = payment_reference || transaction_id || transactionId || 'Online Bank Transfer';

    await pool.query(
      `UPDATE bills SET status = 'paid', paid_date = ?, payment_reference = ? WHERE id = ?`,
      [effectivePaidDate, ref, req.params.id]
    );

    const [rows] = await pool.query(`
      SELECT b.*,
             u.name AS partner_name, u.firm_name AS partner_firm_name,
             u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM bills b
      LEFT JOIN users u ON u.id = b.partner_id
      WHERE b.id = ?
    `, [req.params.id]);

    const updatedBill = rows[0];
    if (updatedBill) {
      updatedBill.transaction_id = updatedBill.payment_reference;
    }

    broadcastEvent('BILL_PAID', {
      bill: updatedBill,
      message: `C.P Bill #${updatedBill.id} marked as Paid (₹${Number(updatedBill.total_bill).toLocaleString('en-IN')})`
    });

    res.json(updatedBill);
  } catch (err) {
    next(err);
  }
}
