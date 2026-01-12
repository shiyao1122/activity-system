const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const ADMIN_URL = `${API_URL}/admin`;
const CLIENT_URL = `${API_URL}/v1`;
const API_KEY = 'secret-key-for-dev';

async function verify() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Create Activity
        console.log('1. Creating Activity...');
        const activityRes = await axios.post(`${ADMIN_URL}/activity`, {
            name: 'Test Activity',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(), // +1 day
            status: 'ACTIVE',
        });
        const activityId = activityRes.data.id;
        console.log('   Activity Created:', activityId);

        // 2. Create Task
        console.log('2. Creating Task...');
        const taskRes = await axios.post(`${ADMIN_URL}/task`, {
            activityId,
            groupName: 'login',
            points: 100,
            dailyLimit: 1,
            totalLimit: 0,
            descJson: { en: 'Daily Login' },
        });
        const taskId = taskRes.data.id;
        console.log('   Task Created:', taskId);

        // 3. Report Task (Client)
        console.log('3. Reporting Task...');
        const reportRes = await axios.post(`${CLIENT_URL}/task/report`, {
            email: 'test@example.com',
            activityId,
            taskGroupName: 'login',
        }, {
            headers: { 'x-api-key': API_KEY }
        });
        console.log('   Report Result:', reportRes.data);

        // 4. Report Task Again (Should hit daily limit)
        console.log('4. Reporting Task Again (Limit Check)...');
        const reportRes2 = await axios.post(`${CLIENT_URL}/task/report`, {
            email: 'test@example.com',
            activityId,
            taskGroupName: 'login',
        }, {
            headers: { 'x-api-key': API_KEY }
        });
        console.log('   Report Result 2:', reportRes2.data);

        // 5. Check User Status
        console.log('5. Checking User Status...');
        const statusRes = await axios.get(`${CLIENT_URL}/user/status`, {
            params: { email: 'test@example.com', activityId }
        });
        console.log('   User Status:', JSON.stringify(statusRes.data, null, 2));

        // 6. Check Admin Stats
        console.log('6. Checking Admin Stats...');
        const statsRes = await axios.get(`${ADMIN_URL}/stats/${activityId}`);
        console.log('   Admin Stats:', JSON.stringify(statsRes.data, null, 2));

        console.log('--- Verification Complete ---');
    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verify();
