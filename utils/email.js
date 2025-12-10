import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendOTPEmail(to, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your 9jalinks verification code',
    text: `Your 9jalinks verification code is ${code}. It expires in 10 minutes.`
  };
  return transporter.sendMail(mailOptions);
}