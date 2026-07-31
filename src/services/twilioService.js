const twilio = require('twilio');

async function sendSMSOTP(phone) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER; // e.g. +17372508034

  console.log('[Twilio SMS] ACCOUNT_SID present:', !!accountSid);
  console.log('[Twilio SMS] AUTH_TOKEN present:', !!authToken);
  console.log('[Twilio SMS] FROM_NUMBER present:', !!fromNumber);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  if (accountSid && authToken && fromNumber) {
    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        from: fromNumber,
        to: phone,
        body: `Your LifePartner Matrimony OTP is: ${otpCode}. Valid for 5 minutes. Do not share this code.`
      });

      console.log('[Twilio SMS] Message SID:', message.sid);
      return { success: true, mode: 'TWILIO_LIVE', sid: message.sid, otp: otpCode };
    } catch (error) {
      console.error('[Twilio SMS Error]:', error.message);
      throw new Error(`Failed to send SMS OTP: ${error.message}`);
    }
  } else {
    // Dev Mode Fallback
    console.log(`\n==================================================`);
    console.log(`[DEV MODE SMS OTP] Phone: ${phone} | Code: ${otpCode}`);
    console.log(`==================================================\n`);
    return { success: true, mode: 'DEV_MODE', otp: otpCode };
  }
}

// Keep WhatsApp function name for backward compatibility with controller
const sendWhatsAppOTP = sendSMSOTP;

module.exports = { sendWhatsAppOTP, sendSMSOTP };
