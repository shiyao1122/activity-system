const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
const ADMIN_API_URL = 'http://localhost:3000/api/admin';
const API_KEY = 'secret-key-for-dev';

async function run() {
    console.log('--- Starting Task Status Verification ---');

    try {
        // 1. Create Activity
        console.log('1. Creating Activity...');
        const actRes = await axios.post(`${ADMIN_API_URL}/activity`, {
            name: 'Status Test Activity',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'ACTIVE'
        });
        const activityId = actRes.data.id;

        // 2. Create Task with Daily Limit 1, Total Limit 2
        console.log('2. Creating Task (Daily: 1, Total: 2)...');
        const taskRes = await axios.post(`${ADMIN_API_URL}/task`, {
            activityId,
            groupName: 'status-test',
            points: 10,
            dailyLimit: 1,
            totalLimit: 2,
            descJson: { en: 'Status Test' }
        });
        const taskId = taskRes.data.id;

        const email = `status_user_${Date.now()}@test.com`;

        // 3. Complete Task Once (Daily Limit Reached)
        console.log('3. User completes task once...');
        await axios.post(`${API_URL}/task/report`, {
            email,
            activityId,
            taskGroupName: 'status-test'
        }, { headers: { 'x-api-key': API_KEY } });

        // 4. Check Status (Should NOT be finished)
        console.log('4. Checking Status (Expect isFinished: false)...');
        let statusRes = await axios.get(`${API_URL}/user/status`, {
            params: { email, activityId }
        });
        let taskStatus = statusRes.data.tasks.find(t => t.id === taskId);

        if (taskStatus.isFinished === false) {
            console.log('   SUCCESS: Task is NOT finished after daily limit.');
        } else {
            console.error('   FAILED: Task IS finished after daily limit.');
        }

        // 5. Complete Task Again (Total Limit Reached)
        // Wait, daily limit is 1. We can't complete it again today.
        // We need to simulate next day or just update the limit to allow more for testing?
        // Or better, set Daily Limit 2, Total Limit 2.
        // But user issue was "when daily limit reached".
        // If I set Daily 1, Total 2. After 1 completion, Daily reached. Total not.
        // My check above confirms "isFinished: false". That proves the fix.

        // To prove "isFinished: true" when Total reached, I need to reach total.
        // I can update the task to remove daily limit, then report again.

        console.log('5. Updating Task to remove daily limit...');
        // Need to switch activity to DRAFT to update task?
        // Yes, my constraint says so.
        // But I can just update the DB directly or use a new task.
        // Let's just create another task for Total Limit test.

        console.log('   (Skipping Total Limit test on same task due to constraints)');

        console.log('6. Creating Task 2 (Total: 1, Daily: 0)...');
        const task2Res = await axios.post(`${ADMIN_API_URL}/task`, {
            activityId,
            groupName: 'status-test-2',
            points: 10,
            dailyLimit: 0,
            totalLimit: 1,
            descJson: { en: 'Status Test 2' }
        });
        const taskId2 = task2Res.data.id;

        console.log('7. User completes Task 2...');
        await axios.post(`${API_URL}/task/report`, {
            email,
            activityId,
            taskGroupName: 'status-test-2'
        }, { headers: { 'x-api-key': API_KEY } });

        console.log('8. Checking Status Task 2 (Expect isFinished: true)...');
        statusRes = await axios.get(`${API_URL}/user/status`, {
            params: { email, activityId }
        });
        taskStatus = statusRes.data.tasks.find(t => t.id === taskId2);

        if (taskStatus.isFinished === true) {
            console.log('   SUCCESS: Task IS finished after total limit.');
        } else {
            console.error('   FAILED: Task is NOT finished after total limit.');
        }

        console.log('--- Verification Complete ---');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

run();
