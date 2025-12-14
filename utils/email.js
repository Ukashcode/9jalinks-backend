import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // 👇 Logic Change: If port is 465, use secure: true. Otherwise false.
    secure: process.env.EMAIL_PORT == 465, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"9jalinks Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your 9jalinks Verification Code',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
};