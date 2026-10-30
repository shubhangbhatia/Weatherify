const rateLimit = require('express-rate-limit');

// Rate limit for authentication attempts (15 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  }
});

// Rate limit for live weather refresh to respect OpenWeather API quotas (10 requests per minute)
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many weather refresh requests. Please wait a minute before requesting fresh data.'
  }
});

module.exports = {
  authLimiter,
  refreshLimiter
};
