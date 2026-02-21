/**
 * Test Connected Social Accounts - User 3
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function testConnectedAccounts() {
    console.log('\n🧪 Testing Connected Social Accounts\n');
    console.log('='.repeat(50));

    // Step 1: Login with User 3
    console.log('\n📧 Step 1: Logging in as playgroundbattle05@gmail.com...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'playgroundbattle05@gmail.com',
            password: '12345678'
        })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.log('❌ Login failed:', loginData.message);
        return;
    }
    console.log('✅ Login successful! User:', loginData.data.user.fullName);
    const token = loginData.data.accessToken;

    // Step 2: Fetch connected accounts
    console.log('\n📱 Step 2: Fetching connected accounts...');
    const accountsRes = await fetch(`${BASE_URL}/social/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok) {
        console.log('❌ Accounts fetch failed:', accountsData.message);
        return;
    }

    console.log(`✅ Found ${accountsData.data.length} connected account(s):\n`);

    const accounts = accountsData.data;
    accounts.forEach((acc, i) => {
        console.log(`   ${i + 1}. [${acc.platform.toUpperCase()}]`);
        console.log(`      Name: ${acc.name}`);
        console.log(`      Username: ${acc.username}`);
        console.log(`      ID: ${acc.id}`);
        console.log('');
    });

    // Step 3: Test Telegram
    const telegramAcc = accounts.find(a => a.platform === 'telegram');
    if (telegramAcc) {
        // Get chat info
        console.log('\n📱 Step 3: Getting Telegram chat info...');
        const infoRes = await fetch(`${BASE_URL}/social/telegram/${telegramAcc.id}/info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const infoData = await infoRes.json();

        if (infoRes.ok) {
            console.log('✅ Telegram chat info:');
            console.log(`   Title: ${infoData.data.title}`);
            console.log(`   Type: ${infoData.data.type}`);
            console.log(`   Members: ${infoData.data.memberCount}`);
            console.log(`   Description: ${infoData.data.description || 'N/A'}`);
        } else {
            console.log('❌ Telegram info failed:', infoData.message);
        }

        // Send test message
        console.log('\n✉️ Step 4: Sending test message to Telegram...');
        const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const msgRes = await fetch(`${BASE_URL}/social/telegram/${telegramAcc.id}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: `🚀 <b>SocialMRT Test Message</b>\n\nThis is an automated test from SocialMRT platform.\n\n✅ Telegram integration working!\n📅 ${now}\n\n<i>Powered by Vayunex Solution</i>`
            })
        });
        const msgData = await msgRes.json();

        if (msgRes.ok) {
            console.log('✅ Message sent successfully!');
            console.log(`   Message ID: ${msgData.data.messageId}`);
        } else {
            console.log('❌ Message failed:', msgData.message);
        }
    } else {
        console.log('\n⚠️ No Telegram account found');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests complete!');
    console.log('='.repeat(50) + '\n');
}

testConnectedAccounts().catch(console.error);
