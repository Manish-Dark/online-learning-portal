const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'joyajay83@gmail.com',
                pass: 'ywdyfttbyzpltevx'
            }
        });

        const mailOptions = {
            from: 'joyajay83@gmail.com',
            to: to,
            subject: subject,
            text: text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
    } catch (error) {
        console.error('❌ Error sending email:', error);
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

module.exports = { sendApprovalEmail, sendRejectionEmail };
