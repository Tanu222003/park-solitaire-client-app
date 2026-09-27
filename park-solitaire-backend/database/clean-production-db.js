import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.MYSQLHOST || 'autorack.proxy.rlwy.net';
const port = parseInt(process.env.MYSQLPORT || '33350');
const user = process.env.MYSQLUSER || 'root';
const password = process.env.MYSQLPASSWORD || 'AmcjNDaWCgpFPMEolfCVIPerOfcMjAkk';
const database = process.env.MYSQLDATABASE || 'railway';

async function cleanProductionDatabase() {
  console.log('='.repeat(65));
  console.log('  🧹 PARK SOLITAIRE - PRODUCTION DATABASE RECORD CLEANUP');
  console.log('='.repeat(65));
  console.log(`Connecting to: ${host}:${port} (${database})\n`);

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000,
      multipleStatements: true
    });

    console.log('1. Disabling Foreign Key Checks for safe record removal...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    console.log('2. Removing demo complaints...');
    const [delComplaints] = await conn.query('DELETE FROM complaints;');
    await conn.query('ALTER TABLE complaints AUTO_INCREMENT = 1;');
    console.log(`   ✔ Removed ${delComplaints.affectedRows} complaint record(s)`);

    console.log('3. Removing demo payments...');
    const [delPayments] = await conn.query('DELETE FROM payments;');
    await conn.query('ALTER TABLE payments AUTO_INCREMENT = 1;');
    console.log(`   ✔ Removed ${delPayments.affectedRows} payment record(s)`);

    console.log('4. Removing demo bills...');
    const [delBills] = await conn.query('DELETE FROM bills;');
    await conn.query('ALTER TABLE bills AUTO_INCREMENT = 1;');
    console.log(`   ✔ Removed ${delBills.affectedRows} bill record(s)`);

    console.log('5. Removing demo visits...');
    const [delVisits] = await conn.query('DELETE FROM visits;');
    await conn.query('ALTER TABLE visits AUTO_INCREMENT = 1;');
    console.log(`   ✔ Removed ${delVisits.affectedRows} visit record(s)`);

    console.log('6. Removing demo clients...');
    const [delClients] = await conn.query('DELETE FROM clients;');
    await conn.query('ALTER TABLE clients AUTO_INCREMENT = 1;');
    console.log(`   ✔ Removed ${delClients.affectedRows} client record(s)`);

    console.log('7. Removing test password reset OTP tokens...');
    const [delOtps] = await conn.query('DELETE FROM password_reset_otps;');
    await conn.query('ALTER TABLE password_reset_otps AUTO_INCREMENT = 1;');
    console.log(`   ✔ Removed ${delOtps.affectedRows} OTP record(s)`);

    console.log('8. Removing test / dummy accounts...');
    const [delTestUsers] = await conn.query(
      "DELETE FROM users WHERE email LIKE 'test%' OR email LIKE '%@example.com' OR name LIKE '%Test%';"
    );
    console.log(`   ✔ Removed ${delTestUsers.affectedRows} test user account(s)`);

    console.log('9. Ensuring Dedicated Admin and Review accounts are configured...');
    // Ensure Admin has active status and firm name
    await conn.query(`
      UPDATE users 
      SET status = 'active', firm_name = 'Park Solitaire Management', phone = '+91 98200 12345' 
      WHERE email = 'admin@parksolitaire.com';
    `);

    // Ensure Review Channel Partner has active status
    await conn.query(`
      UPDATE users 
      SET status = 'active', firm_name = 'Solitaire Realty Group', phone = '+91 90000 00001' 
      WHERE email = 'partner@parksolitaire.com';
    `);

    console.log('10. Re-enabling Foreign Key Checks...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n' + '-'.repeat(65));
    console.log('  📊 VERIFICATION OF CLEAN PRODUCTION DATABASE');
    console.log('-'.repeat(65));

    const tables = ['clients', 'visits', 'complaints', 'payments', 'bills', 'password_reset_otps'];
    for (const t of tables) {
      const [[cnt]] = await conn.query(`SELECT COUNT(*) as c FROM \`${t}\`;`);
      console.log(`   • ${t.padEnd(22)} : ${cnt.c} row(s) (Structure preserved)`);
    }

    const [remainingUsers] = await conn.query('SELECT id, name, email, role, status FROM users;');
    console.log(`\n   • Dedicated Users Remaining (${remainingUsers.length} accounts):`);
    for (const u of remainingUsers) {
      console.log(`     - [${u.role.toUpperCase()}] ${u.name} <${u.email}> (${u.status})`);
    }

    await conn.end();
    console.log('\n' + '='.repeat(65));
    console.log('  🎉 PRODUCTION DATABASE IS CLEAN, VERIFIED & READY!');
    console.log('='.repeat(65));
  } catch (err) {
    console.error('\n❌ [CLEANUP ERROR]:', err.message);
    process.exit(1);
  }
}

cleanProductionDatabase();
