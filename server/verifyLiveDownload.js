const axios = require('axios');

const verifyLiveDownload = async () => {
    const materialId = '6997053ec55672b8b769a80c'; // Known material ID
    const liveUrl = `https://online-learning-portal-ciy7.onrender.com/api/download/${materialId}`;

    console.log(`ℹ️ Testing Live URL: ${liveUrl}`);

    try {
        const response = await axios.get(liveUrl, {
            maxRedirects: 0,
            validateStatus: null
        });

        if (response.status === 302) {
            console.log('✅ SUCCESS: Live Server returned 302 Redirect');
            console.log(`   Location: ${response.headers.location}`);
        } else {
            console.log(`❌ FAILED: Live Server returned status ${response.status}`);
            if (response.status === 200) {
                console.log('   (Content served instead of redirect)');
            }
        }
    } catch (err) {
        console.error('❌ Request Error:', err.message);
        if (err.response) {
            console.log('   Status:', err.response.status);
            console.log('   Data:', JSON.stringify(err.response.data, null, 2));
        }
    }
};

verifyLiveDownload();
