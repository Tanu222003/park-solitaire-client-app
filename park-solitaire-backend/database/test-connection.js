import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { ensureMySQL } from '../src/config/ensure-mysql.js';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3307;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'park_solitaire';

async function testConnection() {
  await ensureMySQL();
  console.log('\n--- MySQL Connection Test ---');
  console.log(`Host: ${DB_HOST}`);
  console.log(`Port: ${DB_PORT}`);
  console.log(`User: ${DB_USER}`);
  console.log(`Database: ${DB_NAME}\n`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    console.log('  [PASS] Successfully connected to MySQL server!');
  } catch (err) {
    console.error('  [FAIL] Could not connect to MySQL server:');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`  -> Access denied for user '${DB_USER}'.`);
      console.error('  -> Please check the DB_PASSWORD value in park-solitaire-backend/.env.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('  -> Connection refused. MySQL is not running on port ' + DB_PORT);
      console.error('  -> Start MySQL using your MySQL service or System Settings.');
    } else {
      console.error(`  -> [${err.code || 'ERROR'}] ${err.message}`);
    }
    console.log('\n-----------------------------\n');
    process.exit(1);
  }

  try {
    const [dbs] = await conn.query('SHOW DATABASES LIKE ?', [DB_NAME]);
    if (dbs.length === 0) {
      console.log(`  [INFO] Database '${DB_NAME}' does not exist yet. It will be created when running npm run db:init or npm run dev.`);
    } else {
      console.log(`  [PASS] Database '${DB_NAME}' exists.`);
      await conn.query(`USE \`${DB_NAME}\``);
      const [tables] = await conn.query('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      console.log(`  [INFO] Tables found: ${tableNames.length > 0 ? tableNames.join(', ') : 'None yet'}`);
    }
  } catch (err) {
    console.error('  [WARN] Query error:', err.message);
  } finally {
    await conn.end();
  }

  console.log('\n  All checks passed successfully!\n');
}

testConnection();
