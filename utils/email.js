import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';

export const sendOTPEmail = async (email, otp) => {
  console.log(`📧 Preparing to send email via SendGrid to: ${email}`);
  
  // 1. Configure SendGrid Transport
  const options = {
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  };

  const transporter = nodemailer.createTransport(sgTransport(options));

  try {
    // 2. Send the Email
    await transporter.sendMail({
      from: `9jalinks Support <${process.env.SENDGRID_FROM_EMAIL}>`, // Use a verified sender email
      to: email,
      subject: 'Your 9jalinks Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #008751;">Welcome to 9jalinks!</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #e6f4ea; display: inline-block; padding: 10px 20px; color: #008751; letter-spacing: 5px;">${otp}</h1>
        </div>
      `
    });
    console.log("🚀 Email Sent Successfully via SendGrid!");

  } catch (error) {
    console.error("❌ SENDGRID FAILED:", error);
  }
};