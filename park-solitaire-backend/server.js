import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './src/config/db.js';
import { ensureMySQL } from './src/config/ensure-mysql.js';
import authRoutes from './src/routes/auth.routes.js';
import clientsRoutes from './src/routes/clients.routes.js';
import visitsRoutes from './src/routes/visits.routes.js';
import complaintsRoutes from './src/routes/complaints.routes.js';
import paymentsRoutes from './src/routes/payments.routes.js';
import billsRoutes from './src/routes/bills.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import { addClient } from './src/config/events.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const apiInfo = {
  name: 'Park Solitaire API',
  version: '1.0.0',
  status: 'running',
  endpoints: {
    health: 'GET /api/health',
    auth: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me'
    },
    clients: 'GET|POST /api/clients, GET|PUT|DELETE /api/clients/:id',
    visits: 'GET|POST /api/visits, GET|PUT|DELETE /api/visits/:id',
    complaints: 'GET|POST /api/complaints, PUT|DELETE /api/complaints/:id',
    payments: 'GET|POST /api/payments, PUT|DELETE /api/payments/:id',
    admin: 'GET /api/admin/dashboard, GET|POST /api/admin/partners, PUT /api/admin/partners/:id/status'
  },
  note: 'This is an API server. Open http://localhost:5173 to use the actual app.'
};

app.get('/', (_req, res) => res.json(apiInfo));
app.get('/api', (_req, res) => res.json(apiInfo));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  addClient(res);
});

app.get('/download-apk', (_req, res) => {
  const p = path.resolve(__dirname, '../release-bundle/park-solitaire-debug.apk');
  if (fs.existsSync(p)) return res.download(p, 'park-solitaire-debug.apk');
  res.status(404).json({ message: 'File not available on this server' });
});
app.get('/download-aab', (_req, res) => {
  const p = path.resolve(__dirname, '../release-bundle/park-solitaire-v1.0.0.aab');
  if (fs.existsSync(p)) return res.download(p, 'park-solitaire-v1.0.0.aab');
  res.status(404).json({ message: 'File not available on this server' });
});
app.get('/download-zip', (_req, res) => {
  const p = path.resolve(__dirname, '../park-solitaire-android-studio.zip');
  if (fs.existsSync(p)) return res.download(p, 'park-solitaire-android-studio.zip');
  res.status(404).json({ message: 'File not available on this server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

function formatError(err) {
  if (!err) return 'Unknown error';
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map(e => `[${e.code || 'ERROR'}] ${e.message}`).join('\n  ');
  }
  const code = err.code ? `[${err.code}] ` : '';
  return `${code}${err.message || String(err)}`;
}

async function start() {
  try {
    await ensureMySQL();
    await initDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('  Park Solitaire API');
      console.log(`  Local:   http://localhost:${PORT}`);
      console.log(`  Network: http://192.168.1.110:${PORT}`);
      console.log(`  Health:  http://192.168.1.110:${PORT}/api/health`);
      console.log('');
    });
  } catch (err) {
    console.error('');
    console.error('  Failed to start server:');
    console.error('  ' + formatError(err));
    console.error('');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  -> Invalid MySQL credentials in .env. Please update DB_PASSWORD with your actual MySQL root password.');
    } else if (err.code === 'ECONNREFUSED' || (err.errors && err.errors.some(e => e.code === 'ECONNREFUSED'))) {
      console.error('  -> Cannot connect to MySQL on localhost:3306. Make sure MySQL server is running.');
    } else {
      console.error('  Check that MySQL is running and .env credentials are correct.');
    }
    console.error('');
    process.exit(1);
  }
}

start();
