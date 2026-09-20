# Park Solitaire — Backend

Node.js + Express + MySQL API server for the Park Solitaire channel-partner app.

## Prerequisites

- **Node.js** v18 or newer — check with `node --version`
- **MySQL** running on `localhost:3306` (XAMPP / Laragon / MySQL Installer — anything works)

## Setup (first time)

### 1. Install dependencies

```bash
cd park-solitaire-backend
npm install
```

### 2. Configure `.env`

Edit `.env` and set your MySQL root password:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=park_solitaire
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Start MySQL

Make sure MySQL server is running. Verify:

```bash
netstat -ano | findstr :3306
```

You should see a `LISTENING` line. If not, start MySQL from XAMPP / Laragon / Services.

### 4. Seed sample users (optional but recommended)

```bash
npm run db:seed
```

This creates:
- **Admin**  — `admin@parksolitaire.com` / `admin123`
- **Partner** — `partner@parksolitaire.com` / `partner123`

> The schema is created automatically the first time the server starts, so `db:init` is not needed unless you want to reset.

### 5. Start the server

```bash
npm run dev
```

You should see:

```
  Park Solitaire API
  Running on http://localhost:5001
  Health check: http://localhost:5001/api/health
```

## Verify

Open in browser:

- **`http://localhost:5001/`** → JSON with API info and endpoint list
- **`http://localhost:5001/api/health`** → `{"status":"ok"}`

> `http://localhost:5001` is the **API** — not the app UI. The actual app is served by the frontend at **`http://localhost:5173`** (Vite dev server).

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Register a new partner |
| POST | `/api/auth/login` | — | Login (partner or admin) |
| GET  | `/api/auth/me` | Bearer | Current user profile |
| GET  | `/api/clients` | Bearer | List (own if partner, all if admin) |
| POST | `/api/clients` | Bearer | Create a client |
| GET  | `/api/clients/:id` | Bearer | Client detail |
| PUT  | `/api/clients/:id` | Bearer | Update a client |
| DELETE | `/api/clients/:id` | Bearer | Delete a client |
| GET  | `/api/visits` | Bearer | List visits |
| POST | `/api/visits` | Bearer | Create visit |
| PUT  | `/api/visits/:id` | Bearer | Update visit |
| DELETE | `/api/visits/:id` | Bearer | Delete visit |
| GET  | `/api/complaints` | Bearer | List complaints |
| POST | `/api/complaints` | Bearer | Create complaint |
| PUT  | `/api/complaints/:id` | Bearer | Update complaint |
| DELETE | `/api/complaints/:id` | Bearer | Delete complaint |
| GET  | `/api/payments` | Bearer | List payments |
| POST | `/api/payments` | Bearer | Create payment |
| PUT  | `/api/payments/:id` | Bearer | Update payment |
| DELETE | `/api/payments/:id` | Bearer | Delete payment |
| GET  | `/api/admin/dashboard` | Admin | Aggregated stats |
| GET  | `/api/admin/partners` | Admin | List all partners |
| POST | `/api/admin/partners` | Admin | Create a partner |
| PUT  | `/api/admin/partners/:id/status` | Admin | Activate / deactivate |

`Bearer` = requires `Authorization: Bearer <jwt>` header. `Admin` = also requires `role = admin`.

## Troubleshooting

**`ECONNREFUSED 127.0.0.1:3306`** → MySQL is not running. Start it.

**`Access denied for user 'root'@'localhost'`** → Wrong password in `.env`. Fix `DB_PASSWORD`.

**`Route not found` in browser at `http://localhost:5001/something`** → That path isn't a registered endpoint. Open `http://localhost:5001/api` to see the list. If you were trying to see the app, open `http://localhost:5173` instead — that's the frontend.

**`Failed to load resource: 404`** in frontend console → Some API call is hitting a path that doesn't exist. Open the browser Network tab, click the failing request, check the URL — it should start with `http://localhost:5001/api/…` and match one of the paths above.
