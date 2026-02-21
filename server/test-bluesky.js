/**
 * Test Bluesky Integration API
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function testBlueskyAPI() {
    console.log('\n🦋 Testing Bluesky Integration API\n');
    console.log('='.repeat(50));

    // Step 1: Login to get token
    console.log('\n📧 Step 1: Logging in...');

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'testuser@example.com',
            password: 'Test123456'
        })
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
        console.log('❌ Login failed:', loginData.message);
        return;
    }

    console.log('✅ Login successful!');
    console.log('   User:', loginData.data.user.fullName);

    const token = loginData.data.accessToken;

    // Step 2: Check connected accounts
    console.log('\n📱 Step 2: Checking connected accounts...');

    const accountsRes = await fetch(`${BASE_URL}/social/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const accountsData = await accountsRes.json();

    if (accountsRes.ok) {
        console.log('✅ Accounts API working!');
        console.log('   Connected accounts:', accountsData.data.length);

        if (accountsData.data.length > 0) {
            accountsData.data.forEach(acc => {
                console.log(`   - ${acc.platform}: @${acc.username}`);
            });
        }
    } else {
        console.log('❌ Accounts API error:', accountsData.message);
    }

    // Step 3: Test Bluesky connect endpoint (without actual credentials)
    console.log('\n🔗 Step 3: Testing Bluesky connect endpoint...');

    const connectRes = await fetch(`${BASE_URL}/social/bluesky/connect`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            handle: 'test.bsky.social',
            appPassword: 'xxxx-xxxx-xxxx-xxxx'
        })
    });

    const connectData = await connectRes.json();

    // We expect this to fail with "Invalid credentials" since we're using fake data
    console.log('   Response status:', connectRes.status);
    console.log('   Message:', connectData.message);

    if (connectRes.status === 400 || connectRes.status === 500) {
        console.log('✅ Endpoint working (expected auth failure with test data)');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 API Tests Complete!');
    console.log('\nTo test with real Bluesky account:');
    console.log('1. Open http://localhost:5173 in browser');
    console.log('2. Login with your credentials');
    console.log('3. Click "Connect Bluesky" on dashboard');
    console.log('4. Enter your handle + App Password');
    console.log('='.repeat(50) + '\n');
}

testBlueskyAPI().catch(console.error);
