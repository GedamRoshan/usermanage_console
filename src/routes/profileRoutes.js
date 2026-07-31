const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// Profile CRUD & Search
router.post('/', profileController.upsertProfile);
router.get('/me', profileController.getMyProfile);
router.get('/search', profileController.searchProfiles);
router.get('/:userId', profileController.getProfileById);

// Partner Preferences
router.post('/preferences', profileController.upsertPreferences);
router.get('/preferences/me', profileController.getPreferences);

module.exports = router;
