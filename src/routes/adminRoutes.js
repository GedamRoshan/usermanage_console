const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

// User-facing report endpoint
router.post('/report', adminController.reportUser);

// Admin-only endpoints
router.use(requireAdmin);

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsersList);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.patch('/users/:userId/verify', adminController.verifyProfile);
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId/status', adminController.updateReportStatus);

module.exports = router;
