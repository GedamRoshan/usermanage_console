const db = require('../db');

class OTPModel {
  static createOTP(phone, otpCode, ttlMinutes = 5) {
    // Expiration timestamp in ISO string
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    // Invalidate existing unverified OTPs for this phone
    db.prepare('DELETE FROM otps WHERE phone = ? AND is_verified = 0').run(phone);

    const stmt = db.prepare(`
      INSERT INTO otps (phone, otp_code, expires_at, is_verified)
      VALUES (?, ?, ?, 0)
    `);
    const result = stmt.run(phone, otpCode, expiresAt);
    return db.prepare('SELECT * FROM otps WHERE id = ?').get(result.lastInsertRowid);
  }

  static verifyOTP(phone, otpCode) {
    const record = db.prepare(`
      SELECT * FROM otps 
      WHERE phone = ? AND otp_code = ? AND is_verified = 0
      ORDER BY id DESC
    `).get(phone, otpCode);

    if (!record) {
      throw new Error('Invalid OTP code');
    }

    const now = new Date().toISOString();
    if (record.expires_at < now) {
      throw new Error('OTP code has expired. Please request a new one.');
    }

    // Mark as verified
    db.prepare('UPDATE otps SET is_verified = 1 WHERE id = ?').run(record.id);
    return true;
  }

  static isPhoneVerifiedRecently(phone, validMinutes = 15) {
    const minTime = new Date(Date.now() - validMinutes * 60 * 1000).toISOString();
    const record = db.prepare(`
      SELECT * FROM otps 
      WHERE phone = ? AND is_verified = 1 AND created_at >= ?
      ORDER BY id DESC
    `).get(phone, minTime);
    return !!record;
  }
}

module.exports = OTPModel;
