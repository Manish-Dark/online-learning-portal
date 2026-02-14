const http = require('http');

console.log('--- Starting Route Diagnostics (Port 5000) ---');

const testRoute = (path, method, body = null) => {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // We assume the server is running and might fail auth (401) or accept (201/200)
            // We mainly want to check if it returns 404 HTML
        }
    };

    const req = http.request(options, (res) => {
        console.log(`[${method} ${path}] STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            // Check if response is HTML or JSON
            const isHtml = data.trim().startsWith('<');
            console.log(`[${method} ${path}] TYPE: ${isHtml ? 'HTML' : 'JSON'}`);
            console.log(`[${method} ${path}] BODY: ${data.substring(0, 100).replace(/\n/g, ' ')}...`);
        });
    });

    req.on('error', (e) => {
        console.error(`[${method} ${path}] ERROR: ${e.message}`);
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
};

// 1. Sanity Check
testRoute('/sanity', 'GET');

// 2. Material Link Check
testRoute('/materials/link', 'POST', {
    title: 'Test Link',
    description: 'Test Desc',
    course: 'B.Tech',
    branch: 'CSE',
    linkUrl: 'http://test.com'
});
