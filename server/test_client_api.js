const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1'; // Client API base
const ADMIN_API_URL = 'http://localhost:3000/api/admin';
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'secret-key-for-dev'
};

async function testClientAPI() {
    console.log('--- Testing Client API ---');
    try {
        // Setup: Create Activity and Task
        const actRes = await axios.post(`${ADMIN_API_URL}/activity`, {
            name: 'Client Test Activity',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'ACTIVE' // Must be ACTIVE for client API
        }, { headers });
        const activityId = actRes.data.id;

        const taskRes = await axios.post(`${ADMIN_API_URL}/task`, {
            activityId,
            taskName: 'login-task',
            points: 100,
            dailyLimit: 0,
            totalLimit: 0,
            descJson: { en: "Login Task" },
            platform: 'mobile'
        }, { headers });
        const taskId = taskRes.data.id;
        console.log('Setup: Activity & Task Created');

        // 1. Get Activity Details
        const detailsRes = await axios.get(`${API_URL}/activity/${activityId}`, { headers });
        const taskInDetails = detailsRes.data.tasks.find(t => t.id === taskId);
        console.log('Get Activity Details: SUCCESS');
        console.log(' - Checking taskName field:', taskInDetails.taskName === 'login-task' ? 'PASS' : 'FAIL');
        console.log(' - Checking platform field:', taskInDetails.platform === 'mobile' ? 'PASS' : 'FAIL');
        // task created in setup didn't have category set, so it should be null
        console.log(' - Checking category field:', taskInDetails.category === null ? 'PASS' : 'FAIL');

        // 2. Report Task
        const reportRes = await axios.post(`${API_URL}/task/report`, {
            email: 'test@example.com',
            activityId,
            taskName: 'login-task' // Sending taskName
        }, { headers });
        console.log('Report Task: SUCCESS', reportRes.data.points === 100);

        // 3. Get User Status
        const statusRes = await axios.get(`${API_URL}/user/status`, {
            params: { email: 'test@example.com', activityId },
            headers
        });
        const userTask = statusRes.data.tasks.find(t => t.id === taskId);
        console.log('Get User Status: SUCCESS');
        console.log(' - Checking taskName in user status:', userTask.taskName === 'login-task' ? 'PASS' : 'FAIL');
        console.log(' - Checking platform in user status:', userTask.platform === 'mobile' ? 'PASS' : 'FAIL');
        console.log(' - Checking completed count:', userTask.completed.total === 1 ? 'PASS' : 'FAIL');

        // Cleanup
        // Change status to DRAFT to delete? Or just force delete logic
        await axios.put(`${ADMIN_API_URL}/activity/${activityId}`, { ...actRes.data, status: 'DRAFT' }, { headers });
        await axios.delete(`${ADMIN_API_URL}/activity/${activityId}`, { headers });
        console.log('Cleanup: Activity Deleted');

    } catch (error) {
        console.error('Client API Failed:', error.response ? error.response.data : error.message);
    }
}

testClientAPI();
