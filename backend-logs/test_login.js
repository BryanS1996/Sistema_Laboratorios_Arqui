const http = require('http');

function post(path, body) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        console.log('1. Attempting Login...');
        const loginRes = await post('/auth/login', JSON.stringify({
            email: 'admin-labs@uce.edu.ec',
            password: 'admin'
        }));

        console.log('Login Status:', loginRes.statusCode);
        if (loginRes.statusCode !== 200) {
            console.error('Login Failed:', loginRes.body);
            return;
        }

        const token = loginRes.body.token;
        console.log('Token received:', token.substring(0, 20) + '...');

        console.log('2. Fetching Logs...');
        const logsRes = await get('/api/logs/recent?limit=10', token);

        console.log('Logs Status:', logsRes.statusCode);
        if (logsRes.statusCode !== 200) {
            console.error('Logs Fetch Failed:', logsRes.body);
        } else {
            console.log('Success! Logs retrieved.');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
