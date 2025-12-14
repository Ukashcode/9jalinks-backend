import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Hardcoded to be safe
    port: 465,              // Hardcoded to SSL port
    secure: true,           // Must be true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"9jalinks Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your code is: ${otp}`
  };

  await transporter.sendMail(mailOptions);
};