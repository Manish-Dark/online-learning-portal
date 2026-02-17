const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
console.log('📧 Initializing Email Transporter with:', {
    host: process.env.SMTP_HOST || '(not set)',
    port: process.env.SMTP_PORT || '(not set)',
    user: process.env.SMTP_USER ? '***' : '(not set)',
    from: process.env.SMTP_FROM || '(not set)'
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT, // 587
    secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        minVersion: 'TLSv1.2', // Force TLS 1.2+ for better security/compatibility
        rejectUnauthorized: true
    },
    logger: true, // Log to console
    debug: true   // Include debug info
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ SMTP Connection Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER, // Use configured sender or fallback to user
            to: to,
            subject: subject,
            text: text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
};

const sendApprovalEmail = async (email, name) => {
    const subject = 'Account Approved - Online Learning Portal';
    const text = `Hello ${name},\n\nYour account has been APPROVED by the admin. You can now login to the portal.\n\nRegards,\nAdmin Team`;
    await sendEmail(email, subject, text);
};

const sendRejectionEmail = async (email, name) => {
    const subject = 'Account Application Status';
    const text = `Hello ${name},\n\nYour account request has been REJECTED by the admin.\n\nRegards,\nAdmin Team`;
    await sendEmail(email, subject, text);
};

module.exports = { sendApprovalEmail, sendRejectionEmail, sendEmail };
