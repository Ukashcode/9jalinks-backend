import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
  console.log(`📧 Preparing to send email to: ${email}`);
  
  // Debug: Print settings (hiding password)
  console.log(`🔧 SMTP Config -> Host: ${process.env.EMAIL_HOST}, Port: ${process.env.EMAIL_PORT}, User: ${process.env.EMAIL_USER}`);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    // Logic: True for 465, False for other ports
    secure: Number(process.env.EMAIL_PORT) === 465, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Fix for some cloud servers blocking TLS
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false
    }
  });

  try {
    // 1. Verify connection
    await transporter.verify();
    console.log("✅ SMTP Connection Verified!");

    // 2. Send Email
    await transporter.sendMail({
      from: `"9jalinks Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your 9jalinks Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #008751;">Welcome to 9jalinks!</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #e6f4ea; display: inline-block; padding: 10px 20px; color: #008751; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });
    console.log("🚀 Email Sent Successfully!");

  } catch (error) {
    console.error("❌ EMAIL FAILED:", error);
  }
};