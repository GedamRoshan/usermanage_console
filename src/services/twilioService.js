const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let twilioClient = null;
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

async function sendWhatsAppOTP(phone, otp) {
  // Ensure formatted phone number has whatsapp: prefix
  const formattedTo = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
  const formattedFrom = fromWhatsAppNumber.startsWith('whatsapp:') ? fromWhatsAppNumber : `whatsapp:${fromWhatsAppNumber}`;

  const messageBody = `Your LifePartner Matrimony verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

  if (twilioClient) {
    try {
      const message = await twilioClient.messages.create({
        from: formattedFrom,
        to: formattedTo,
        body: messageBody
      });
      return { success: true, mode: 'TWILIO_LIVE', sid: message.sid };
    } catch (error) {
      console.error('[Twilio WhatsApp Error]:', error.message);
      throw new Error(`Failed to send WhatsApp message via Twilio: ${error.message}`);
    }
  } else {
    // Dev Mode Fallback
    console.log(`\n==================================================`);
    console.log(`[DEV MODE WHATSAPP OTP] Phone: ${phone} | Code: ${otp}`);
    console.log(`==================================================\n`);
    return { success: true, mode: 'DEV_MODE', otp };
  }
}

module.exports = { sendWhatsAppOTP };
