const axios = require('axios');

const verifyLiveHealth = async () => {
    const liveUrl = 'https://online-learning-portal-ciy7.onrender.com/api/sanity';

    console.log(`ℹ️ Testing Live Health: ${liveUrl}`);

    try {
        const response = await axios.get(liveUrl, {
            validateStatus: null
        });

        console.log(`Status: ${response.status}`);
        console.log(`Data: ${response.data}`);

    } catch (err) {
        console.error('❌ Request Error:', err.message);
    }
};

verifyLiveHealth();
