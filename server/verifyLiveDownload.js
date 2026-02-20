const axios = require('axios');

const verifyLiveDownload = async () => {
    const materialId = '6997053ec55672b8b769a80c'; // Known material ID
    const liveUrl = `https://online-learning-portal-ciy7.onrender.com/api/download/${materialId}`;

    console.log(`ℹ️ Testing Live URL: ${liveUrl}`);

    try {
        const response = await axios.get(liveUrl, {
            maxRedirects: 5,
            validateStatus: null
        });

        if (response.status === 200) {
            console.log('✅ SUCCESS: Final URL returned 200 OK');
            console.log(`   Content-Type: ${response.headers['content-type']}`);
            console.log(`   Content-Length: ${response.headers['content-length']}`);
        } else {
            console.log(`❌ FAILED: Final URL returned status ${response.status}`);
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
