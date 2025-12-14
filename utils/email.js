import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
  console.log(`📧 Initializing email send to: ${email}`);

  // Check if variables exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL CONFIG MISSING: Check EMAIL_USER and EMAIL_PASS in Render Environment.");
    return;
  }

  try {
    // We force Port 465 (SSL) for maximum reliability on Cloud Servers
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Must be true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 1. Test the connection first
    await transporter.verify();
    console.log("✅ SMTP Connection Established Successfully");

    // 2. Send the email with HTML styling
    const info = await transporter.sendMail({
      from: `"9jalinks Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #008751; text-align: center;">Welcome to 9jalinks! 🇳🇬</h2>
          <p style="font-size: 16px; color: #333;">Use the code below to verify your account:</p>
          <div style="background-color: #f0fdf4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #008751; letter-spacing: 8px; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log(`🚀 Email Sent Successfully! ID: ${info.messageId}`);

  } catch (error) {
    console.error("❌ EMAIL SENDING FAILED:");
    console.error(error); // This will print the exact reason in Render Logs
  }
};