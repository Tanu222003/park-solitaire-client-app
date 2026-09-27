import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const host = process.env.MYSQLHOST || 'autorack.proxy.rlwy.net';
const port = parseInt(process.env.MYSQLPORT || '33350');
const user = process.env.MYSQLUSER || 'root';
const password = process.env.MYSQLPASSWORD || 'AmcjNDaWCgpFPMEolfCVIPerOfcMjAkk';
const database = process.env.MYSQLDATABASE || 'railway';

async function backupDatabase() {
  console.log('='.repeat(55));
  console.log('  📦 BACKING UP RAILWAY CLOUD MYSQL DATABASE');
  console.log('='.repeat(55));
  console.log(`Connecting to: ${host}:${port} (${database})`);

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000,
      dateStrings: true
    });

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const backupsDir = path.resolve(__dirname, '../../backups');

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const backupFile = path.join(backupsDir, `railway_backup_${timestamp}.sql`);
    let sqlDump = `-- =======================================================\n`;
    sqlDump += `-- Park Solitaire - Railway Cloud Database Backup\n`;
    sqlDump += `-- Date: ${now.toISOString()}\n`;
    sqlDump += `-- Source: ${host}:${port} / ${database}\n`;
    sqlDump += `-- =======================================================\n\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    const [tables] = await conn.query('SHOW TABLES;');
    const tableNames = tables.map((r) => Object.values(r)[0]);

    for (const table of tableNames) {
      console.log(`Exporting table: ${table}...`);
      const [[createTable]] = await conn.query(`SHOW CREATE TABLE \`${table}\`;`);
      sqlDump += `-- Table structure for \`${table}\`\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlDump += `${createTable['Create Table']};\n\n`;

      const [rows] = await conn.query(`SELECT * FROM \`${table}\`;`);
      if (rows.length > 0) {
        sqlDump += `-- Dumping data for table \`${table}\` (${rows.length} rows)\n`;
        const columns = Object.keys(rows[0]).map((col) => `\`${col}\``).join(', ');

        for (const row of rows) {
          const values = Object.values(row).map((val) => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
          }).join(', ');

          sqlDump += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
        }
        sqlDump += `\n`;
      }
    }

    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    sqlDump += `-- Backup complete\n`;

    fs.writeFileSync(backupFile, sqlDump, 'utf8');

    await conn.end();

    const stats = fs.statSync(backupFile);
    console.log('\n' + '='.repeat(55));
    console.log(`✅ BACKUP SUCCESSFULLY CREATED!`);
    console.log(`📁 File: ${backupFile}`);
    console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('='.repeat(55));
  } catch (err) {
    console.error('\n❌ [BACKUP FAILED]:', err.message);
    process.exit(1);
  }
}

backupDatabase();
