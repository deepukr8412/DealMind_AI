const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  
  console.log(`📡 Creating Production-Ready Transporter (Pooling Enabled)...`);
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL for Port 465
    pool: true,   // Keep connection open
    maxConnections: 1, // Avoid spamming Gmail
    maxMessages: 100,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    // INCREASED TIMEOUTS FOR CLOUD
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,
    socketTimeout: 60000,
    family: 4, 
    logger: true,
    debug: true,
  });
  return transporter;
};

const sendEmailAsync = async (options) => {
  try {
    const mailTransporter = getTransporter();
    const mailOptions = {
      from: `"DealMind AI" <${process.env.EMAIL_USER}>`,
      ...options,
    };
    
    console.log(`✉️ Attempting send to: ${options.to}`);
    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✉️ SUCCESS! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
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
      <p>Click the button below to reset your password. Valid for 15 minutes.</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #f72585, #e5166f); color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
    </div>
  `;

  await sendEmailAsync({
    to: email,
    subject: 'DealMind AI - Password Reset Request',
    html: htmlContext,
  });
};
