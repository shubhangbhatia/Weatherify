const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { logAction } = require('../services/logService');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.'
      });
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [emailClean]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Role assignment: Default to viewer unless specified (only 'admin' or 'viewer' allowed)
    const assignedRole = role === 'admin' ? 'admin' : 'viewer';

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name.trim(), emailClean, password_hash, assignedRole]
    );

    const newUser = {
      id: result.insertId,
      full_name: full_name.trim(),
      email: emailClean,
      role: assignedRole
    };

    const token = generateToken(newUser);
    await logAction(newUser.id, 'USER_REGISTER', `New user registered with role: ${assignedRole}`);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('[AuthController.register] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during user registration.'
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const emailClean = email.trim().toLowerCase();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailClean]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const userPayload = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    const token = generateToken(userPayload);
    await logAction(user.id, 'USER_LOGIN', `User authenticated successfully (${user.email})`);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    return res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    console.error('[AuthController.getMe] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
}

module.exports = {
  register,
  login,
  getMe
};

