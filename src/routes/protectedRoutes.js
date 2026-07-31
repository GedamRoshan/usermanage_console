const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Protected content', user: req.user });
});

module.exports = router;
