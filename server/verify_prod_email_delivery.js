const axios = require('axios');

const API_URL = 'https://online-learning-portal-ciy7.onrender.com';
const ADMIN_EMAIL = 'manish1212@gmail.com';
const ADMIN_PASSWORD = 'manish@2004';
const TARGET_EMAIL = 'joyajay83@gmail.com'; // Send to the admin's email to verify receipt

const testProdEmail = async () => {
    try {
        console.log('🚀 Testing Email Delivery on Production...');

        // 1. Login
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin'
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful');

        // 2. Call Test Email Endpoint
        console.log(`2. Sending Test Email to ${TARGET_EMAIL}...`);
        console.log('(This forces the server to try sending an email immediately)');

        try {
            const emailRes = await axios.post(`${API_URL}/admin/test-email`, {
                email: TARGET_EMAIL
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('\n✅ SUCCESS:', emailRes.data.message);
            console.log('The server confirmed it sent the email. Check your Inbox/Spam.');
        } catch (emailError) {
            console.error('\n❌ EMAIL SEND FAILED');
            if (emailError.response) {
                console.error('Server Response:', emailError.response.data);
            } else {
                console.error('Error:', emailError.message);
            }
        }

    } catch (error) {
        console.error('❌ Script Error:', error.response ? error.response.data : error.message);
    }
};

testProdEmail();
