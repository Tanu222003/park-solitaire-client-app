CREATE DATABASE IF NOT EXISTS park_solitaire
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE park_solitaire;

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  firm_name    VARCHAR(150) NULL,
  contact_name VARCHAR(100) NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('partner', 'admin') NOT NULL DEFAULT 'partner',
  phone        VARCHAR(20),
  phone2       VARCHAR(20),
  status       ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  partner_id  INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(20),
  email       VARCHAR(150),
  address     TEXT,
  unit_type   VARCHAR(50),
  budget      VARCHAR(50),
  source      VARCHAR(50),
  status      VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_clients_partner (partner_id)
);

CREATE TABLE IF NOT EXISTS visits (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  client_id  INT NOT NULL,
  partner_id INT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time VARCHAR(20) NULL,
  notes      TEXT,
  status     ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)  REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_id) REFERENCES users(id)   ON DELETE CASCADE,
  INDEX idx_visits_client (client_id),
  INDEX idx_visits_partner (partner_id)
);

CREATE TABLE IF NOT EXISTS complaints (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  client_id   INT NOT NULL,
  partner_id  INT NOT NULL,
  subject     VARCHAR(200) NOT NULL,
  description TEXT,
  admin_reply TEXT NULL,
  replied_at  TIMESTAMP NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (client_id)  REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_id) REFERENCES users(id)   ON DELETE CASCADE,
  INDEX idx_complaints_client (client_id),
  INDEX idx_complaints_partner (partner_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  client_id  INT NOT NULL,
  partner_id INT NOT NULL,
  amount     DECIMAL(10, 2) NOT NULL,
  due_date   DATE,
  paid_date  DATE NULL,
  status     ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)  REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_id) REFERENCES users(id)   ON DELETE CASCADE,
  INDEX idx_payments_client (client_id),
  INDEX idx_payments_partner (partner_id)
);
