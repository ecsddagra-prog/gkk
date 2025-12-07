const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug/env',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', data);
        try {
            const json = JSON.parse(data);
            console.log('Parsed:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.end();
