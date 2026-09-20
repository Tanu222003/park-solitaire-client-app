import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { ensureMySQL } from '../src/config/ensure-mysql.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  await ensureMySQL();
  const dbName = process.env.DB_NAME || 'park_solitaire';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
  if (tables.length === 0) {
    console.log('  Tables missing. Running schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await conn.query(schema);
    console.log('  Schema created.');
  }

  const users = [
    { name: 'Admin',        email: 'admin@parksolitaire.com',   password: 'admin123',   role: 'admin',   phone: null },
    { name: 'Rahul Sharma', email: 'partner@parksolitaire.com', password: 'partner123', role: 'partner', phone: '+91 9000000001' }
  ];

  const ids = {};
  for (const u of users) {
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length > 0) {
      ids[u.role] = existing[0].id;
      console.log(`  ${u.role.padEnd(7)}  already exists  ${u.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const [r] = await conn.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, hashed, u.phone, u.role]
    );
    ids[u.role] = r.insertId;
    console.log(`  ${u.role.padEnd(7)}  created         ${u.email}  (password: ${u.password})`);
  }

  const partnerId = ids.partner;
  const [clientCount] = await conn.query('SELECT COUNT(*) AS c FROM clients WHERE partner_id = ?', [partnerId]);
  if (clientCount[0].c === 0) {
    const clients = [
      ['Priya Sharma',   '+91 98765 43210', 'priya@example.com',   'Sector 21, Noida',    '2 BHK', '₹ 50L - 70L', 'Referral', 'Visited'],
      ['Rohit Verma',    '+91 87654 32109', 'rohit@example.com',   'Andheri West, Mumbai','3 BHK', '₹ 70L - 90L', 'Walk-in',  'Pending'],
      ['Anjali Singh',   '+91 99887 66554', 'anjali@example.com',  'Baner, Pune',         '2 BHK', '₹ 50L - 70L', 'Referral', 'Visited'],
      ['Mayank Kumar',   '+91 91234 56789', 'mayank@example.com',  'Koregaon Park, Pune', '3 BHK', '₹ 80L - 1 Cr', 'Website',  'Pending'],
      ['Sneha Patil',    '+91 90909 12121', 'sneha@example.com',   'Viman Nagar, Pune',   '2 BHK', '₹ 55L - 75L', 'Referral', 'Closed'],
      ['Deepak Sridhar', '+91 93210 98765', 'deepak@example.com',  'Aundh, Pune',         '2 BHK', '₹ 50L - 70L', 'Referral', 'Visited']
    ];
    for (const [name, phone, email, address, unit_type, budget, source, status] of clients) {
      await conn.query(
        'INSERT INTO clients (partner_id, name, phone, email, address, unit_type, budget, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [partnerId, name, phone, email, address, unit_type, budget, source, status]
      );
    }
    console.log(`  clients  created  ${clients.length} sample rows`);
  } else {
    console.log(`  clients  already present  (${clientCount[0].c} rows)`);
  }

  await conn.end();
  console.log('\nSeed complete.\n');
  console.log('  Admin login:   admin@parksolitaire.com   / admin123');
  console.log('  Partner login: partner@parksolitaire.com / partner123\n');
}

seed().catch((err) => {
  const details = err.code ? `[${err.code}] ${err.message}` : (err.message || err);
  console.error('Seed failed:', details);
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Hint: DB_PASSWORD in .env is incorrect. Please update it with your actual MySQL root password.');
  }
  process.exit(1);
});
