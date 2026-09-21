import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'park_solitaire'
};

const connUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (connUrl && !process.env.DB_HOST && !process.env.MYSQLHOST) {
  try {
    const parsed = new URL(connUrl);
    dbConfig.host = parsed.hostname;
    dbConfig.port = Number(parsed.port) || 3306;
    dbConfig.user = decodeURIComponent(parsed.username || 'root');
    dbConfig.password = decodeURIComponent(parsed.password || '');
    const cleanDb = (parsed.pathname || '').replace(/^\//, '');
    if (cleanDb) dbConfig.database = cleanDb;
  } catch (e) {
    console.error('Could not parse database connection URL:', e.message);
  }
}

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

export async function initDatabase() {
  const connection = await mysql.createConnection({
    ...dbConfig,
    multipleStatements: true
  });

  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schema);

  // Ensure firm_name and contact_name columns exist in users table
  try {
    await connection.query('ALTER TABLE users ADD COLUMN firm_name VARCHAR(150) NULL AFTER name');
  } catch (err) {
    // ER_DUP_FIELDNAME - already exists
  }
  try {
    await connection.query('ALTER TABLE users ADD COLUMN contact_name VARCHAR(100) NULL AFTER firm_name');
  } catch (err) {
    // ER_DUP_FIELDNAME - already exists
  }
  try {
    await connection.query('ALTER TABLE users ADD COLUMN phone2 VARCHAR(20) NULL AFTER phone');
  } catch (err) {
    // ER_DUP_FIELDNAME - already exists
  }

  // Ensure realistic phone details for admin and default partner
  try {
    await connection.query("UPDATE users SET phone = '+91 98200 12345' WHERE role = 'admin' AND (phone IS NULL OR phone = '')");
    await connection.query("UPDATE users SET firm_name = 'Solitaire Realty Group', phone2 = '+91 98200 54321' WHERE email = 'partner@parksolitaire.com' AND (firm_name IS NULL OR firm_name = '')");
  } catch (err) {}

  // Ensure sample visits for today and tomorrow are present
  try {
    const [todayCount] = await connection.query('SELECT COUNT(*) AS c FROM visits WHERE visit_date = CURDATE()');
    const [tomorrowCount] = await connection.query('SELECT COUNT(*) AS c FROM visits WHERE visit_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
    const [clients] = await connection.query('SELECT id, partner_id, name FROM clients LIMIT 6');

    if (clients.length > 0) {
      if (todayCount[0].c === 0) {
        const c1 = clients[0];
        await connection.query(
          'INSERT INTO visits (client_id, partner_id, visit_date, visit_time, notes, status) VALUES (?, ?, CURDATE(), ?, ?, ?)',
          [c1.id, c1.partner_id, '11:30 AM', 'Site tour of 2 BHK luxury show apartment & premium amenities', 'scheduled']
        );
        if (clients.length > 1) {
          const c2 = clients[1];
          await connection.query(
            'INSERT INTO visits (client_id, partner_id, visit_date, visit_time, notes, status) VALUES (?, ?, CURDATE(), ?, ?, ?)',
            [c2.id, c2.partner_id, '03:45 PM', 'Client walkthrough with family for corner unit & master layout', 'scheduled']
          );
        }
      }

      if (tomorrowCount[0].c === 0) {
        const c3 = clients.length > 2 ? clients[2] : clients[0];
        await connection.query(
          'INSERT INTO visits (client_id, partner_id, visit_date, visit_time, notes, status) VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 1 DAY), ?, ?, ?)',
          [c3.id, c3.partner_id, '10:15 AM', 'Meeting on 3 BHK pricing breakdown and payment schedule', 'scheduled']
        );
        if (clients.length > 3) {
          const c4 = clients[3];
          await connection.query(
            'INSERT INTO visits (client_id, partner_id, visit_date, visit_time, notes, status) VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 1 DAY), ?, ?, ?)',
            [c4.id, c4.partner_id, '04:30 PM', 'Floor layout selection and booking advance token review', 'scheduled']
          );
        }
      }
    }
  } catch (seedErr) {
    console.warn('Visits seed notice:', seedErr.message);
  }

  await connection.end();

  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM users');
  console.log(`  Database ready (${rows[0].c} users in system)`);
}

export default pool;
