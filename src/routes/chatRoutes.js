const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/messages', chatController.sendMessage);
router.get('/conversations/:targetUserId', chatController.getConversation);
router.get('/recent', chatController.getRecentChats);

module.exports = router;
