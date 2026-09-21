import pool from '../config/db.js';
import { broadcastEvent } from '../config/events.js';
import { getVisitAlertMessage } from './visits.controller.js';

export async function getClients(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const sql = `
      SELECT c.*, u.name AS partner_name, u.firm_name AS partner_firm_name, u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM clients c
      LEFT JOIN users u ON u.id = c.partner_id
      ${isAdmin ? '' : 'WHERE c.partner_id = ?'}
      ORDER BY c.created_at DESC
    `;
    const [rows] = await pool.query(sql, isAdmin ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getClientById(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, u.name AS partner_name, u.firm_name AS partner_firm_name, u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM clients c
      LEFT JOIN users u ON u.id = c.partner_id
      WHERE c.id = ?
    `, [req.params.id]);
    const client = rows[0];
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (req.user.role !== 'admin' && client.partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your client' });
    }

    const [visits] = await pool.query(`
      SELECT v.*, u.name AS partner_name, u.firm_name AS partner_firm_name, u.phone AS partner_phone, u.phone2 AS partner_phone2, u.email AS partner_email
      FROM visits v
      LEFT JOIN users u ON u.id = v.partner_id
      WHERE v.client_id = ?
      ORDER BY v.visit_date DESC, v.id DESC
    `, [client.id]);
    const [complaints] = await pool.query('SELECT * FROM complaints WHERE client_id = ? ORDER BY created_at DESC', [client.id]);
    const [payments] = await pool.query('SELECT * FROM payments WHERE client_id = ? ORDER BY created_at DESC', [client.id]);

    res.json({ ...client, visits, complaints, payments });
  } catch (err) {
    next(err);
  }
}

export async function createClient(req, res, next) {
  try {
    const {
      name,
      phone,
      email,
      address,
      unit_type,
      budget,
      source,
      status,
      visit_date,
      visit_time,
      visit_notes
    } = req.body || {};

    if (!name) return res.status(400).json({ message: 'name is required' });

    // Pipeline status defaults to 'Upcoming Visit'
    const clientStatus = status || 'Upcoming Visit';

    const [result] = await pool.query(
      'INSERT INTO clients (partner_id, name, phone, email, address, unit_type, budget, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, phone || null, email || null, address || null, unit_type || null, budget || null, source || null, clientStatus]
    );

    const clientId = result.insertId;

    const [rows] = await pool.query(`
      SELECT c.*, u.name AS partner_name, u.firm_name AS partner_firm_name, u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM clients c
      LEFT JOIN users u ON u.id = c.partner_id
      WHERE c.id = ?
    `, [clientId]);

    const createdClient = rows[0];

    // Automatically register an initial Upcoming visit for Today so it reflects in Admin dashboard and visit records
    const todayStr = new Date().toISOString().slice(0, 10);
    const targetVisitDate = visit_date || todayStr;
    const defaultNotes = visit_notes || `New client registered by ${createdClient.partner_name || 'Channel Partner'} (${createdClient.unit_type || 'Unit'})`;

    const [vResult] = await pool.query(
      'INSERT INTO visits (client_id, partner_id, visit_date, visit_time, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, req.user.id, targetVisitDate, visit_time || '11:00 AM', defaultNotes, 'Upcoming']
    );

    const [vRows] = await pool.query(`
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
    `, [vResult.insertId]);

    const scheduledVisit = vRows[0];

    // Broadcast VISIT_CREATED so Visit Radar & Admin Dashboard update immediately in real-time
    const visitAlert = getVisitAlertMessage(scheduledVisit, req.user.name, 'scheduled');
    broadcastEvent('VISIT_CREATED', {
      visit: scheduledVisit,
      author: req.user.name,
      role: req.user.role,
      message: visitAlert
    });

    broadcastEvent('CLIENT_CREATED', {
      client: createdClient,
      author: req.user.name,
      role: req.user.role,
      message: `${req.user.name} added client: ${createdClient.name} (${createdClient.unit_type || 'Unit'})`
    });

    res.status(201).json({
      ...createdClient,
      scheduled_visit: scheduledVisit
    });
  } catch (err) {
    next(err);
  }
}

export async function updateClient(req, res, next) {
  try {
    const { name, phone, email, address, unit_type, budget, source, status } = req.body || {};
    const [existing] = await pool.query('SELECT partner_id FROM clients WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Client not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your client' });
    }

    await pool.query(
      `UPDATE clients SET
         name       = COALESCE(?, name),
         phone      = COALESCE(?, phone),
         email      = COALESCE(?, email),
         address    = COALESCE(?, address),
         unit_type  = COALESCE(?, unit_type),
         budget     = COALESCE(?, budget),
         source     = COALESCE(?, source),
         status     = COALESCE(?, status)
       WHERE id = ?`,
      [name ?? null, phone ?? null, email ?? null, address ?? null, unit_type ?? null, budget ?? null, source ?? null, status ?? null, req.params.id]
    );

    const [rows] = await pool.query(`
      SELECT c.*, u.name AS partner_name, u.firm_name AS partner_firm_name, u.email AS partner_email, u.phone AS partner_phone, u.phone2 AS partner_phone2
      FROM clients c
      LEFT JOIN users u ON u.id = c.partner_id
      WHERE c.id = ?
    `, [req.params.id]);

    broadcastEvent('CLIENT_UPDATED', {
      client: rows[0],
      author: req.user.name,
      role: req.user.role,
      message: `${req.user.name} updated client ${rows[0].name} (Status: ${rows[0].status})`
    });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteClient(req, res, next) {
  try {
    const [existing] = await pool.query('SELECT partner_id FROM clients WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Client not found' });
    if (req.user.role !== 'admin' && existing[0].partner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your client' });
    }

    await pool.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
}
