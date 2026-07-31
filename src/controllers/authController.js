const authService = require('../services/authService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const OTPModel = require('../models/otpModel');
const { sendWhatsAppOTP, verifyWhatsAppOTP } = require('../services/twilioService');
const { jwtSecret } = require('../config');

exports.sendWhatsAppOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Basic phone number format check (+ followed by digits)
    const cleanPhone = phone.trim();
    if (!/^\+?[1-9]\d{7,14}$/.test(cleanPhone.replace(/[\s-]/g, ''))) {
      return res.status(400).json({ message: 'Invalid phone number format. Include country code e.g. +919876543210' });
    }

    // Check if phone number is already registered
    const existingUser = userModel.findByPhone ? userModel.findByPhone(cleanPhone) : null;
    if (existingUser) {
      return res.status(409).json({ message: 'Phone number is already registered' });
    }

    // Send via Twilio Verify (handles OTP internally) / Dev Fallback
    const dispatchResult = await sendWhatsAppOTP(cleanPhone);

    // In DEV MODE only: save OTP to DB for manual verification
    if (dispatchResult.mode === 'DEV_MODE') {
      OTPModel.createOTP(cleanPhone, dispatchResult.otp, 5);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your phone via SMS',
      mode: dispatchResult.mode,
      dev_otp: dispatchResult.mode === 'DEV_MODE' ? dispatchResult.otp : undefined
    });
  } catch (err) {
    console.error('[sendWhatsAppOTP Error]:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyWhatsAppOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP code are required' });
    }

    const cleanPhone = phone.trim();
    OTPModel.verifyOTP(cleanPhone, otp);

    // Generate a temporary verification token (expires in 15 mins)
    const verificationToken = jwt.sign(
      { phone: cleanPhone, purpose: 'PHONE_VERIFICATION' },
      jwtSecret,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: 'WhatsApp number verified successfully',
      phone: cleanPhone,
      verification_token: verificationToken
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, verification_token } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // Enforce WhatsApp Phone Verification if phone is provided
    if (phone) {
      if (!verification_token) {
        // Fallback check if verified recently in DB
        const isVerified = OTPModel.isPhoneVerifiedRecently(phone);
        if (!isVerified) {
          return res.status(400).json({ message: 'Phone number has not been verified via WhatsApp OTP' });
        }
      } else {
        try {
          const payload = jwt.verify(verification_token, jwtSecret);
          if (payload.purpose !== 'PHONE_VERIFICATION' || payload.phone !== phone) {
            return res.status(400).json({ message: 'Invalid or mismatched verification token for phone number' });
          }
        } catch (jwtErr) {
          return res.status(400).json({ message: 'Expired or invalid verification token' });
        }
      }
    }

    const existing = userModel.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = userModel.createUser({ email, password: hashed, name: name || null, phone: phone || null });

    // Issue login token directly on registration
    const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
