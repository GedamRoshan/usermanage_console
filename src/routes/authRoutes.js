const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);

// WhatsApp OTP Verification Routes
router.post('/send-whatsapp-otp', authController.sendWhatsAppOTP);
router.post('/verify-whatsapp-otp', authController.verifyWhatsAppOTP);

module.exports = router;
