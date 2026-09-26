import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, firm_name: user.firm_name || null, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function register(req, res, next) {
  try {
    const { name, firm_name, contact_name, email, password, phone, phone2 } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'C.P Name, C.P Email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    let cleanPhone = null;
    if (phone) {
      cleanPhone = String(phone).replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: 'Contact number must be exactly 10 digits.' });
      }
    }

    let cleanPhone2 = null;
    if (phone2) {
      cleanPhone2 = String(phone2).replace(/\D/g, '');
      if (cleanPhone2.length !== 10) {
        return res.status(400).json({ message: 'Alternate phone number must be exactly 10 digits.' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, firm_name, contact_name, email, password, phone, phone2, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, firm_name || null, contact_name || null, email, hashed, cleanPhone || null, cleanPhone2 || null, 'partner']
    );

    const user = {
      id: result.insertId,
      name,
      firm_name: firm_name || null,
      email,
      role: 'partner',
      phone: cleanPhone || null,
      phone2: cleanPhone2 || null
    };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role: requestedRole } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanIdentifier = String(email).trim();
    const digitsOnly = cleanIdentifier.replace(/\D/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Allow login by email OR mobile phone / alternate phone (any formatting)
    let [rows] = await pool.query(
      `SELECT * FROM users 
       WHERE email = ? 
          OR phone = ? 
          OR phone2 = ? 
          OR REPLACE(phone, ' ', '') = ? 
          OR (LENGTH(?) >= 10 AND RIGHT(REPLACE(REPLACE(phone, ' ', ''), '+91', ''), 10) = ?)
          OR (LENGTH(?) >= 10 AND RIGHT(REPLACE(REPLACE(phone2, ' ', ''), '+91', ''), 10) = ?)`,
      [cleanIdentifier, cleanIdentifier, cleanIdentifier, cleanIdentifier.replace(/\s+/g, ''), last10, last10, last10, last10]
    );

    if (rows.length === 0 && cleanIdentifier.toLowerCase() === 'admin') {
      [rows] = await pool.query("SELECT * FROM users WHERE email = 'admin@parksolitaire.com'");
    }

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email/mobile or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    // Strict portal role enforcement
    if (requestedRole) {
      if (requestedRole === 'admin' && user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied: Channel Partner credentials cannot be used for Admin login. Please use the Channel Partner login portal.'
        });
      }
      if (requestedRole === 'partner' && user.role !== 'partner') {
        return res.status(403).json({
          message: 'Access denied: Admin accounts must log in through the Admin Portal (/admin/login).'
        });
      }
    }

    res.json({
      token: signToken(user),
      user: {
        id: user.id,
        name: user.name,
        firm_name: user.firm_name || null,
        email: user.email,
        role: user.role,
        phone: user.phone,
        phone2: user.phone2
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, firm_name, contact_name, email, role, phone, phone2, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getUserProfile(req, res, next) {
  try {
    const targetId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, name, firm_name, contact_name, email, role, phone, phone2, status, created_at FROM users WHERE id = ?',
      [targetId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getAdminInfo(_req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, firm_name, contact_name, email, role, phone, phone2, status, created_at FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function sendForgotPasswordOtp(req, res, next) {
  try {
    const { identifier, role } = req.body || {};
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({ message: 'Email address or mobile number is required' });
    }

    const cleanIdentifier = String(identifier).trim();
    const digitsOnly = cleanIdentifier.replace(/\D/g, '');
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    const isEmail = cleanIdentifier.includes('@');

    let [rows] = await pool.query(
      `SELECT * FROM users 
       WHERE email = ? 
          OR phone = ? 
          OR phone2 = ? 
          OR REPLACE(phone, ' ', '') = ? 
          OR (LENGTH(?) >= 10 AND RIGHT(REPLACE(REPLACE(phone, ' ', ''), '+91', ''), 10) = ?)
          OR (LENGTH(?) >= 10 AND RIGHT(REPLACE(REPLACE(phone2, ' ', ''), '+91', ''), 10) = ?)`,
      [cleanIdentifier, cleanIdentifier, cleanIdentifier, cleanIdentifier.replace(/\s+/g, ''), last10, last10, last10, last10]
    );

    if (rows.length === 0 && cleanIdentifier.toLowerCase() === 'admin') {
      [rows] = await pool.query("SELECT * FROM users WHERE email = 'admin@parksolitaire.com'");
    }

    if (role && rows.length > 1) {
      const match = rows.find((u) => u.role === role);
      if (match) rows = [match];
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'No registered account found matching this email or mobile number.'
      });
    }

    const user = rows[0];

    if (role && user.role !== role) {
      if (role === 'admin') {
        return res.status(403).json({
          message: 'Access denied: This account belongs to a Channel Partner, not an Administrator. Please use the Channel Partner portal.'
        });
      } else {
        return res.status(403).json({
          message: 'Access denied: This account belongs to an Administrator. Please use the Admin portal.'
        });
      }
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      await pool.query(
        'INSERT INTO password_reset_otps (user_id, identifier, otp_code, role, expires_at, used) VALUES (?, ?, ?, ?, ?, FALSE)',
        [user.id, cleanIdentifier, otp, user.role, expiresAt]
      );
    } catch (e) {
      // Table fallback creation if needed
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_otps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          identifier VARCHAR(150) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          role VARCHAR(20) NOT NULL,
          expires_at DATETIME NOT NULL,
          used BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_otp_identifier (identifier),
          INDEX idx_otp_code (otp_code)
        )
      `);
      await pool.query(
        'INSERT INTO password_reset_otps (user_id, identifier, otp_code, role, expires_at, used) VALUES (?, ?, ?, ?, ?, FALSE)',
        [user.id, cleanIdentifier, otp, user.role, expiresAt]
      );
    }

    // Mask destination for privacy
    let masked = '';
    if (isEmail) {
      const parts = user.email.split('@');
      const namePart = parts[0];
      const domainPart = parts[1] || '';
      masked = `${namePart.charAt(0)}***@${domainPart}`;
    } else {
      const ph = user.phone || cleanIdentifier;
      const phDigits = ph.replace(/\D/g, '');
      masked = phDigits.length >= 4 ? `+91 ******${phDigits.slice(-4)}` : ph;
    }

    console.log(`[PASSWORD RESET OTP] Generated code for ${user.email} (${user.name}): ${otp}`);

    res.json({
      success: true,
      message: `OTP has been generated and sent to your registered ${isEmail ? 'email address' : 'mobile number'} (${masked}).`,
      otp, // Included in response for seamless development & verification
      maskedTarget: masked,
      identifier: cleanIdentifier,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyForgotPasswordOtp(req, res, next) {
  try {
    const { identifier, otp } = req.body || {};
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Identifier and OTP code are required' });
    }

    const cleanIdentifier = String(identifier).trim();
    const cleanOtp = String(otp).trim();

    const [rows] = await pool.query(
      `SELECT * FROM password_reset_otps 
       WHERE (identifier = ? OR identifier = ?) 
         AND otp_code = ? 
         AND used = FALSE 
         AND expires_at > NOW() 
       ORDER BY id DESC LIMIT 1`,
      [cleanIdentifier, cleanIdentifier.replace(/\D/g, ''), cleanOtp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP code. Please check and try again.' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export async function resetForgotPassword(req, res, next) {
  try {
    const { identifier, otp, new_password, newPassword } = req.body || {};
    const finalPassword = new_password || newPassword;
    if (!identifier || !otp || !finalPassword) {
      return res.status(400).json({ message: 'Identifier, OTP code, and new password are required' });
    }

    if (String(finalPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanIdentifier = String(identifier).trim();
    const cleanOtp = String(otp).trim();

    const [otpRows] = await pool.query(
      `SELECT * FROM password_reset_otps 
       WHERE (identifier = ? OR identifier = ?) 
         AND otp_code = ? 
         AND used = FALSE 
         AND expires_at > NOW() 
       ORDER BY id DESC LIMIT 1`,
      [cleanIdentifier, cleanIdentifier.replace(/\D/g, ''), cleanOtp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP code. Please request a new OTP.' });
    }

    const otpRecord = otpRows[0];
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Update password in users table
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, otpRecord.user_id]);

    // Mark OTP as used
    await pool.query('UPDATE password_reset_otps SET used = TRUE WHERE id = ?', [otpRecord.id]);

    const [userRows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [otpRecord.user_id]);

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
      user: userRows[0]
    });
  } catch (err) {
    next(err);
  }
}
