const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmailAsync = async (options) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"DealMind AI" <${process.env.EMAIL_USER}>`,
      ...options,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

/**
 * Send a welcome email on successful login without blocking the response.
 */
exports.sendLoginEmail = (email, username) => {
  const htmlContext = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e;">
      <h2 style="color: #4361ee;">🚀 Welcome Back, ${username}!</h2>
      <p>Thanks for logging in! Welcome back to DealMind AI.</p>
      <p>Ready to outsmart the seller today and score huge deals?</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: linear-gradient(135deg, #4361ee, #f72585); color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
      </div>
    </div>
  `;

  sendEmailAsync({
    to: email,
    subject: 'Successful Login to DealMind AI',
    html: htmlContext,
  });
};

/**
 * Send a password reset link.
 */
exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const htmlContext = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e;">
      <h2 style="color: #4361ee;">🔑 Password Reset Request</h2>
      <p>You requested a password reset for your DealMind AI account.</p>
      <p>Please click the button below to reset your password. This link is valid for 15 minutes.</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #f72585, #e5166f); color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #8888a8;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmailAsync({
    to: email,
    subject: 'DealMind AI - Password Reset Request',
    html: htmlContext,
  });
};
