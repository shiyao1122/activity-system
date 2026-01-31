const axios = require('axios');

const API_URL = 'http://localhost:3000/api/admin';
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': '123456'
};

async function testTaskCRUD() {
    console.log('--- Testing Task CRUD ---');
    try {
        // Setup: Create an activity first
        const actRes = await axios.post(`${API_URL}/activity`, {
            name: 'Task Test Activity',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'DRAFT'
        }, { headers });
        const activityId = actRes.data.id;
        console.log('Setup: Activity Created', activityId);

        // 1. Create Task - Success
        const taskData = {
            activityId,
            taskName: 'register-test',
            targetTaskName: null,
            platform: 'mobile',
            points: 10,
            dailyLimit: 1,
            totalLimit: 1,
            descJson: { en: "Test Task" }
        };
        const createRes = await axios.post(`${API_URL}/task`, taskData, { headers });
        console.log('Create Task: SUCCESS', createRes.data.taskName === 'register-test');
        const taskId = createRes.data.id;

        // 2. Create Task - Fail (Duplicate Name)
        try {
            await axios.post(`${API_URL}/task`, taskData, { headers });
            console.error('Create Duplicate Task: FAILED (Should have thrown error)');
        } catch (e) {
            console.log('Create Duplicate Task: SUCCESS (Captured expected error):', e.response.data.error);
        }

        // 3. Create Task - Fail (Invalid Name Format)
        try {
            await axios.post(`${API_URL}/task`, { ...taskData, taskName: 'Invalid Name' }, { headers }); // Has space
            console.error('Create Invalid Name Task: FAILED (Should have thrown error)');
        } catch (e) {
            console.log('Create Invalid Name Task: SUCCESS (Captured expected error):', e.response.data.error);
        }

        // 4. Update Task
        const updateRes = await axios.put(`${API_URL}/task/${taskId}`, {
            ...taskData,
            points: 20
        }, { headers });
        console.log('Update Task: SUCCESS', updateRes.data.points === 20);

        // 5. Delete Task
        await axios.delete(`${API_URL}/task/${taskId}`, { headers });
        console.log('Delete Task: SUCCESS');

        // Cleanup
        await axios.delete(`${API_URL}/activity/${activityId}`, { headers });
        console.log('Cleanup: Activity Deleted');

    } catch (error) {
        console.error('Task CRUD Failed:', error.response ? error.response.data : error.message);
    }
}

testTaskCRUD();
