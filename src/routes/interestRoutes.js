const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', interestController.sendInterest);
router.patch('/:interestId/respond', interestController.respondToInterest);
router.get('/received', interestController.getReceivedInterests);
router.get('/sent', interestController.getSentInterests);
router.get('/connections', interestController.getConnections);

// Shortlists
router.post('/shortlist', interestController.toggleShortlist);
router.get('/shortlist', interestController.getShortlist);

module.exports = router;
