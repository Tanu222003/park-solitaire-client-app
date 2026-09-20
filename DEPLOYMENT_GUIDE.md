# Park Solitaire - Testing & Production Deployment Guide

This guide covers everything required to test, verify, and deploy the **Park Solitaire** full-stack real estate CRM application.

---

## 1. How to Test the Application

### A. Automated Integration & API Test Suite
An automated test suite tests all backend endpoints, authentication, client dossiers, visits radar, targeted complaints isolation, and real-time SSE streaming.

1. Ensure the backend is running on port 5001.
2. In your terminal, run:
```bash
cd park-solitaire-backend
npm test
```
**What is automatically validated:**
- **GET /api/health**: API uptime and JSON response.
- **Admin & Partner Authentication**: JWT token generation and role access.
- **Client Management & Dossier**: Client fields (`name`, `phone`, `unit_type`, `budget`, `source`).
- **Tomorrow Visit Radar**: Join on visit records with complete client contact and unit info.
- **Targeted Complaints Isolation**: Verifies that when an Admin targets a ticket to a Channel Partner, only that partner can see it. No leaks to other partners.
- **Admin Dashboard**: Real-time statistics aggregation.
- **Real-Time SSE**: Verifies `text/event-stream` handshake and live event broadcasting.

---

### B. Frontend Production Build Check
Ensure that the React frontend bundles and compiles with zero errors:
```bash
cd park-solitaire-frontend
npm run build
```
This outputs production-optimized, minified assets into `dist/`.

---

### C. Manual End-to-End User Verification
To experience real-time synchronization between Admin and Channel Partner:

1. Open **two browser windows side-by-side**:
   - **Window 1 (Admin)**: `http://localhost:5173` -> Log in as `admin@parksolitaire.com` / `admin123`.
   - **Window 2 (Partner)**: Incognito `http://localhost:5173` -> Log in as `partner@parksolitaire.com` / `partner123`.
2. **Tomorrow's Visit Test**:
   - In Window 1 or 2, go to **Visits** and schedule a visit with **tomorrow's date**.
   - Check the **Visit Radar (Tomorrow Visit)** section on the Home dashboard:
     - Displays the Client Dossier card with Client ID `#CL-XXXX`, phone call button, email button, budget, unit requirements, and assigned CP.
3. **Complaint Privacy & Isolation Test**:
   - In Window 1 (Admin), go to **Complaints** -> Click **+ Raise Issue / Complaint**.
   - Select Rahul Sharma (Targeted Channel Partner).
   - Submit the complaint.
   - Observe: Window 2 (Rahul Sharma) receives a live push toast immediately and the ticket appears in his inbox. Other partners will not see this ticket.

---

## 2. Production Deployment Options

Choose the deployment architecture that best fits your infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                       Deployment Paths                      │
├─────────────────────────┬───────────────────────────────────┤
│ Option A: Cloud PaaS    │ Vercel (Frontend) + Render        │
│ (Fastest & Easiest)     │ (Backend) + Aiven (MySQL)         │
├─────────────────────────┼───────────────────────────────────┤
│ Option B: Docker        │ 1-Click Multi-container on any    │
│ (Self-contained VPS)    │ Cloud VPS (EC2 / DigitalOcean)    │
├─────────────────────────┼───────────────────────────────────┤
│ Option C: Linux VPS     │ Ubuntu + Nginx + PM2 + MySQL      │
│ (Standard Enterprise)   │ with Let's Encrypt SSL            │
└─────────────────────────┴───────────────────────────────────┘
```

---

### Option A: Cloud PaaS Deployment (Recommended & Free Tier Available)

#### Step 1: Deploy MySQL Database
You can use any cloud MySQL provider:
- **Aiven for MySQL** (Free tier available)
- **Railway MySQL**
- **AWS RDS (MySQL)**

1. Create a database named `park_solitaire`.
2. Note your connection details: Host, Port, Username, Password.

#### Step 2: Deploy Backend to Render (or Railway)
1. Push `park-solitaire-backend` to GitHub.
2. In [Render Dashboard](https://render.com):
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - **Root Directory**: `park-solitaire-backend` (if in a monorepo) or `/`.
   - **Environment**: `Node`.
   - **Build Command**: `npm install`.
   - **Start Command**: `node server.js`.
3. Set the **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5001
   DB_HOST=<your-cloud-mysql-host>
   DB_PORT=<your-cloud-mysql-port>
   DB_USER=<your-cloud-mysql-user>
   DB_PASSWORD=<your-cloud-mysql-password>
   DB_NAME=park_solitaire
   JWT_SECRET=<generate-a-secure-64-character-secret>
   CLIENT_ORIGIN=https://<your-frontend-domain>.vercel.app
   ```
4. Click **Deploy**. Note down your backend URL (e.g., `https://park-solitaire-api.onrender.com`).

#### Step 3: Deploy Frontend to Vercel (or Netlify)
1. Push `park-solitaire-frontend` to GitHub.
2. In [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** -> Select your repo.
   - **Framework Preset**: `Vite`.
   - **Root Directory**: `park-solitaire-frontend`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://park-solitaire-api.onrender.com/api`
4. Click **Deploy**.
5. *Note*: `vercel.json` is already configured in the repo to handle client-side route rewrites.

---

### Option B: Docker Compose Deployment (Any Linux VPS / Cloud Server)

A complete `docker-compose.yml` is included in the project root.

1. SSH into your VPS (Ubuntu 22.04 / Debian).
2. Clone your project:
   ```bash
   git clone <your-repo-url>
   cd ps
   ```
3. Update environment secrets in `docker-compose.yml` (e.g., `JWT_SECRET`, passwords).
4. Launch the full stack:
   ```bash
   docker compose up -d --build
   ```
5. All three containers will boot automatically:
   - **db**: MySQL 8.0 with volume persistence
   - **backend**: Node API with auto-database initialization
   - **frontend**: Nginx serving the React bundle on port 80

---

### Option C: Ubuntu Linux VPS (PM2 + Nginx + System MySQL)

#### 1. Install Node.js, MySQL, and Nginx
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server nodejs npm
sudo npm install -g pm2
```

#### 2. Configure MySQL
```bash
sudo mysql
```
```sql
CREATE DATABASE park_solitaire;
CREATE USER 'parkuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON park_solitaire.* TO 'parkuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Setup Backend
```bash
cd /var/www/park-solitaire-backend
npm install --omit=dev
nano .env
```
Populate `.env`:
```env
NODE_ENV=production
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=parkuser
DB_PASSWORD=StrongPassword123!
DB_NAME=park_solitaire
JWT_SECRET=change_to_a_long_random_string_here
CLIENT_ORIGIN=https://yourdomain.com
```
Initialize DB and start with PM2:
```bash
npm run db:init
npm run db:seed
pm2 start server.js --name "ps-backend"
pm2 save
pm2 startup
```

#### 4. Build and Deploy Frontend
```bash
cd /var/www/park-solitaire-frontend
# Set production API URL in .env
echo "VITE_API_URL=https://yourdomain.com/api" > .env
npm install
npm run build
```

#### 5. Nginx Configuration
Create `/etc/nginx/sites-available/parksolitaire`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend Static Files
    location / {
        root /var/www/park-solitaire-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API & Server-Sent Events (SSE)
    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Crucial for Real-Time SSE streaming
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```
Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/parksolitaire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Enable Free HTTPS (SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Summary Checklist Before Launch
- [x] All 12 automated API tests pass (`npm test`).
- [x] Frontend builds cleanly without compile errors (`npm run build`).
- [x] CORS `CLIENT_ORIGIN` matches frontend production URL.
- [x] Real-time SSE proxy buffering disabled (`proxy_buffering off`).
- [x] Database credentials and secure `JWT_SECRET` configured in production `.env`.
