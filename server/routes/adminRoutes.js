const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// All admin endpoints require valid JWT and 'admin' role
router.use(authenticateToken, requireAdmin);

router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/logs', adminController.getLogs);
router.delete('/weather/:id', adminController.deleteWeatherRecord);
router.get('/stats', adminController.getAdminStats);

module.exports = router;

