// One-time helper: creates the database and tables from schema.sql
// Usage: npm run db:init
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running schema.sql...');
  await connection.query(schema);
  console.log('Database and tables created successfully.');

  await connection.end();
}

init().catch((err) => {
  const details = err.code ? `[${err.code}] ${err.message}` : (err.message || err);
  console.error('Failed to initialize database:', details);
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Hint: DB_PASSWORD in .env is incorrect. Please update it with your actual MySQL root password.');
  }
  process.exit(1);
});
