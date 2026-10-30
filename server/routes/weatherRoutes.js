const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { authenticateToken } = require('../middleware/auth');
const { requireViewerOrAdmin } = require('../middleware/role');
const { refreshLimiter } = require('../middleware/rateLimiter');

// All weather endpoints require authentication (viewer or admin)
router.use(authenticateToken, requireViewerOrAdmin);

router.get('/current', weatherController.getCurrent);
router.post('/refresh', refreshLimiter, weatherController.refreshCurrent);
router.get('/history', weatherController.getHistory);
router.get('/stats', weatherController.getStats);
router.get('/export', weatherController.exportCsv);

module.exports = router;
