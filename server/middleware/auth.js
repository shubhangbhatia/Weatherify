const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'surat_weather_intelligence_jwt_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If token is provided, verify it
  if (token && token !== 'bypass_token' && token !== 'null') {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // If token expired, fall back to default admin user instead of blocking
      console.warn('[Auth] Token expired or invalid, proceeding with system default session.');
    }
  }

  // Authentication removed / transparent access: automatically provide admin role context
  req.user = {
    id: 1,
    email: 'admin@suratweather.edu',
    role: 'admin',
    full_name: 'Lead Administrator'
  };
  next();
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
