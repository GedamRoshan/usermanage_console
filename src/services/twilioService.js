const twilio = require('twilio');

async function sendWhatsAppOTP(phone) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SID;

  console.log('[Twilio] ACCOUNT_SID present:', !!accountSid);
  console.log('[Twilio] AUTH_TOKEN present:', !!authToken);
  console.log('[Twilio] VERIFY_SID present:', !!verifySid);

  if (accountSid && authToken && verifySid) {
    try {
      const client = twilio(accountSid, authToken);
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({
          to: `whatsapp:${phone}`,
          channel: 'whatsapp'
        });

      console.log('[Twilio Verify] Status:', verification.status);
      return { success: true, mode: 'TWILIO_LIVE', status: verification.status };
    } catch (error) {
      console.error('[Twilio Verify Error]:', error.message);
      throw new Error(`Failed to send WhatsApp OTP via Twilio Verify: ${error.message}`);
    }
  } else {
    // Dev Mode Fallback
    const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n==================================================`);
    console.log(`[DEV MODE WHATSAPP OTP] Phone: ${phone} | Code: ${devOtp}`);
    console.log(`==================================================\n`);
    return { success: true, mode: 'DEV_MODE', otp: devOtp };
  }
}

async function verifyWhatsAppOTP(phone, code) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SID;

  if (accountSid && authToken && verifySid) {
    try {
      const client = twilio(accountSid, authToken);
      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          to: `whatsapp:${phone}`,
          code: code
        });

      console.log('[Twilio Verify Check] Status:', verificationCheck.status);
      return {
        success: verificationCheck.status === 'approved',
        status: verificationCheck.status
      };
    } catch (error) {
      console.error('[Twilio Verify Check Error]:', error.message);
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }
  } else {
    // Dev Mode - always approve
    return { success: true, status: 'approved', mode: 'DEV_MODE' };
  }
}

module.exports = { sendWhatsAppOTP, verifyWhatsAppOTP };
