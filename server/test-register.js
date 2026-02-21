// Test Registration Endpoint
require('dotenv').config();
const http = require('http');

const data = JSON.stringify({
    email: 'testuser@example.com',
    password: 'Test123456',
    fullName: 'Test User'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔌 Testing Registration Endpoint...\n');

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        try {
            const json = JSON.parse(body);
            console.log('📋 Response:', JSON.stringify(json, null, 2));

            if (json.success) {
                console.log('\n✅ Registration successful!');
                console.log('   User ID:', json.data?.user?.id);
                console.log('   Email:', json.data?.user?.email);
            } else {
                console.log('\n⚠️  Error:', json.message);
            }
        } catch (e) {
            console.log('Raw response:', body.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
});

req.write(data);
req.end();
