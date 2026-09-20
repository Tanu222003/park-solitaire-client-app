import fs from 'fs';
import net from 'net';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../mysql_data');
const mysqldPath = '/usr/local/mysql/bin/mysqld';
const PORT = Number(process.env.DB_PORT) || 3307;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

export async function ensureMySQL() {
  if (process.env.NODE_ENV === 'production' || !fs.existsSync(mysqldPath)) {
    return;
  }
  const open = await isPortOpen(PORT);
  if (open) return;

  console.log(`  Starting dedicated MySQL server on port ${PORT}...`);
  const child = spawn(
    mysqldPath,
    [
      `--datadir=${dataDir}`,
      `--port=${PORT}`,
      `--socket=${path.join(dataDir, 'mysql.sock')}`,
      '--mysqlx=OFF'
    ],
    {
      detached: true,
      stdio: 'ignore'
    }
  );
  child.unref();

  // Wait for MySQL to become ready
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isPortOpen(PORT)) {
      console.log(`  Dedicated MySQL server is ready on port ${PORT}.`);
      return;
    }
  }

  console.warn(`  Warning: MySQL server did not respond on port ${PORT} within 10s.`);
}
