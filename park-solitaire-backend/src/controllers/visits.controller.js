import pool from '../config/db.js';
import { broadcastEvent } from '../config/events.js';

export async function getVisits(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const sql = `
      SELECT v.*,
             c.name AS client_name,
             c.phone AS client_phone,
             c.email AS client_email,
             c.address AS client_address,
             c.unit_type AS unit_type,
             c.unit_type AS client_unit_type,
             c.budget AS budget,
             c.budget AS client_budget,
             c.source AS client_source,
             c.status AS client_status,
             u.name AS partner_name,
             u.firm_name AS partner_firm_name,
             u.phone AS partner_phone,
             u.phone2 AS partner_phone2,
             u.email AS partner_email
      FROM visits v
      LEFT JOIN clients c ON c.id = v.client_id
      LEFT JOIN users u ON u.id = v.partner_id
      ${isAdmin ? '' : 'WHERE v.partner_id = ?'}
      ORDER BY v.visit_date DESC, v.id DESC
    `;
    const [rows] = await pool.query(sql, isAdmin ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export function getVisitAlertMessage(visit, authorName, action = 'scheduled') {
  const visitDateStr = visit.visit_date ? String(visit.visit_date).slice(0, 10) : '';
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

  const clientName = visit.client_name || 'Client';
  const partnerName = visit.partner_name || authorName || 'Channel Partner';

  if (visitDateStr === tomorrowStr) {
    return `${clientName} will visit tomorrow by Channel Partner ${partnerName}`;
  } else if (visitDateStr === todayStr) {
    return `${clientName} is visiting today with Channel Partner ${partnerName}`;
  } else {
    return `${partnerName} ${action} a visit for ${clientName} on ${visitDateStr}`;
  }
}

export async function createVisit(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Channel Partners cannot schedule visits. Only Admin can schedule visits.' });
    }

    const { client_id, visit_date, visit_time, notes, status } = req.body || {};
    if (!client_id || !visit_date) {
      return res.status(400).json({ message: 'client_id and visit_date are required' });
    }

    const [clients] = await pool.query('SELECT name, partner_id FROM clients WHERE id = ?', [client_id]);
    if (clients.length === 0) return res.status(404).json({ message: 'Client not found' });
    if (req.user.role !== 'admin' && Number(clients[0].partner_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not your client' });
    }

    const partnerId = req.user.role === 'admin' ? clients[0].partner_id : req.user.id;

    // If visit already exists for this client, update it instead of adding multiple times
    const [existingVisits] = await pool.query('SELECT id, notes FROM visits WHERE client_id = ? ORDER BY id DESC LIMIT 1', [client_id]);
    let visitId;
    if (existingVisits.length > 0) {
      visitId = existingVisits[0].id;
      const combinedNotes = notes ? (existingVisits[0].notes ? `${existingVisits[0].notes} | ${notes}` : notes) : existingVisits[0].notes;
      await pool.query(
        'UPDATE visits SET visit_date = ?, visit_time = ?, notes = ?, status = ? WHERE id = ?',
        [visit_date, visit_time || '11:00 AM', combinedNotes || null, status || 'Upcoming', visitId]
      );
    } else {
      const [result] = await pool.query(
        'INSERT INTO visits (client_id, partner_id, visit_date, visit_time, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
        [client_id, partnerId, visit_date, visit_time || null, notes || null, status || 'Upcoming']
      );
      visitId = result.insertId;
    }

    const [rows] = await pool.query(`
      SELECT v.*,
             c.name AS client_name,
             c.phone AS client_phone,
             c.email AS client_email,
             c.address AS client_address,
             c.unit_type AS unit_type,
             c.unit_type AS client_unit_type,
             c.budget AS budget,
             c.budget AS client_budget,
             c.source AS client_source,
             c.status AS client_status,
             u.name AS partner_name,
             u.firm_name AS partner_firm_name,
             u.phone AS partner_phone,
             u.phone2 AS partner_phone2,
             u.email AS partner_email
      FROM visits v
      LEFT JOIN clients c ON c.id = v.client_id
      LEFT JOIN users u ON u.id = v.partner_id
      WHERE v.id = ?
    `, [visitId]);

    broadcastEvent('VISIT_CREATED', {
      visit: rows[0],
      author: req.user.name,
      role: req.user.role,
      message: getVisitAlertMessage(rows[0], req.user.name, 'scheduled')
    });

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateVisit(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin has authority to update visit status.' });
    }

    const { visit_date, visit_time, notes, status } = req.body || {};
    const [existing] = await pool.query('SELECT partner_id FROM visits WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Visit not found' });

    await pool.query(
      `UPDATE visits SET
         visit_date = COALESCE(?, visit_date),
         visit_time = COALESCE(?, visit_time),
         notes      = COALESCE(?, notes),
         status     = COALESCE(?, status)
       WHERE id = ?`,
      [visit_date ?? null, visit_time ?? null, notes ?? null, status ?? null, req.params.id]
    );

    const [rows] = await pool.query(`
      SELECT v.*,
             c.name AS client_name,
             c.phone AS client_phone,
             c.email AS client_email,
             c.address AS client_address,
             c.unit_type AS unit_type,
             c.unit_type AS client_unit_type,
             c.budget AS budget,
             c.budget AS client_budget,
             c.source AS client_source,
             c.status AS client_status,
             u.name AS partner_name,
             u.firm_name AS partner_firm_name,
             u.phone AS partner_phone,
             u.phone2 AS partner_phone2,
             u.email AS partner_email
      FROM visits v
      LEFT JOIN clients c ON c.id = v.client_id
      LEFT JOIN users u ON u.id = v.partner_id
      WHERE v.id = ?
    `, [req.params.id]);

    const msg = status
      ? `${req.user.name} marked visit with ${rows[0].client_name} as "${rows[0].status}"`
      : getVisitAlertMessage(rows[0], req.user.name, 'updated');

    broadcastEvent('VISIT_UPDATED', {
      visit: rows[0],
      author: req.user.name,
      role: req.user.role,
      message: msg
    });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteVisit(req, res, next) {
  try {
    const [existing] = await pool.query('SELECT partner_id FROM visits WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Visit not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your visit' });
    }

    await pool.query('DELETE FROM visits WHERE id = ?', [req.params.id]);
    res.json({ message: 'Visit deleted' });
  } catch (err) {
    next(err);
  }
}
