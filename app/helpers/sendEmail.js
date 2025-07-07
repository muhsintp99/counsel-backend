// utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        name: process.env.EMAIL_USER_NAME
    }
});

const sendWelcomeEmail = async (to, name, password) => {
    const mailOptions = {
        from: `${process.env.EMAIL_USER_NAME} <${process.env.EMAIL_USER}>`,
        to,
        subject: `🎉 Welcome to ${process.env.EMAIL_USER_NAME}, ${name}!`,
        html: `
      <h3>Hi ${name},</h3>
      <p>Thank you for joining us at <strong>${process.env.EMAIL_USER_NAME}</strong>.</p>
      <p>Your account has been successfully created. Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${to}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please keep this information safe. You can change your password after logging in.</p>
      <br>
      <p>Regards,<br><strong>${process.env.EMAIL_USER_NAME} Team</strong></p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Send welcome email error:', {
            message: error.message,
            stack: error.stack,
            error,
        });
        throw new Error(`Failed to send welcome email: ${error.message || 'Unknown error'}`);
    }
};


module.exports = { sendWelcomeEmail };
