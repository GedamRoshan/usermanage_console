const twilio = require('twilio');

async function sendSMSOTP(phone) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let rawFromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;
  
  // CRITICAL FIX: Ensure 'whatsapp:' prefix is removed so Twilio sends an SMS, not WhatsApp
  const fromNumber = rawFromNumber ? rawFromNumber.replace('whatsapp:', '') : null;

  console.log('[Twilio SMS] ACCOUNT_SID present:', !!accountSid);
  console.log('[Twilio SMS] AUTH_TOKEN present:', !!authToken);
  console.log('[Twilio SMS] FROM_NUMBER:', fromNumber);

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
      console.log(`\n==================================================`);
      console.log(`[FALLBACK DEV MODE OTP] Phone: ${phone} | Code: ${otpCode}`);
      console.log(`Twilio failed, using dev mode so you can continue testing.`);
      console.log(`==================================================\n`);
      return { success: true, mode: 'DEV_MODE', otp: otpCode, error: error.message };
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
