import mysql from 'mysql2/promise';

const host = process.env.MYSQLHOST || 'autorack.proxy.rlwy.net';
const port = parseInt(process.env.MYSQLPORT || '33350');
const user = process.env.MYSQLUSER || 'root';
const password = process.env.MYSQLPASSWORD || 'AmcjNDaWCgpFPMEolfCVIPerOfcMjAkk';
const database = process.env.MYSQLDATABASE || 'railway';

async function checkDatabase() {
  console.log('='.repeat(55));
  console.log('  🔍 CHECKING RAILWAY CLOUD MYSQL DATABASE');
  console.log('='.repeat(55));
  console.log(`Connecting to: ${host}:${port}`);
  console.log(`User: ${user} | Database: ${database}\n`);

  try {
    const startTime = Date.now();
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 8000
    });
    const pingMs = Date.now() - startTime;

    console.log(`✅ [CONNECTED] Response time: ${pingMs}ms\n`);

    // 1. Fetch MySQL server version
    const [[ver]] = await conn.query('SELECT VERSION() as version, NOW() as server_time;');
    console.log(`   MySQL Server Version : ${ver.version}`);
    console.log(`   Server Timestamp     : ${ver.server_time}\n`);

    // 2. Fetch all tables
    const [tables] = await conn.query('SHOW TABLES;');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log(`📋 [TABLES FOUND] (${tableNames.length} tables):`);
    for (const t of tableNames) {
      const [[cnt]] = await conn.query(`SELECT COUNT(*) as c FROM \`${t}\`;`);
      console.log(`   • ${t.padEnd(16)} : ${cnt.c} row(s)`);
    }

    // 3. Check users
    const [users] = await conn.query('SELECT id, name, email, role FROM users LIMIT 5;');
    console.log('\n👥 [SAMPLE USERS]:');
    for (const u of users) {
      console.log(`   • [ID ${u.id}] ${u.name} (${u.role}) - ${u.email}`);
    }

    await conn.end();
    console.log('\n' + '='.repeat(55));
    console.log('  🎉 DATABASE IS FULLY FUNCTIONAL AND ONLINE!');
    console.log('='.repeat(55));
  } catch (err) {
    console.error('\n❌ [CONNECTION ERROR]:', err.message);
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      console.error('   Hint: Check if the Railway TCP proxy is active or if your network blocks outbound port ' + port);
    }
  }
}

checkDatabase();
