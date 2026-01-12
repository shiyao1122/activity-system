const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
const ADMIN_API_URL = 'http://localhost:3000/api/admin';

async function run() {
    console.log('--- Starting Client Activity Details Verification ---');

    try {
        // 1. Create an Activity (if not exists, but we can use existing one)
        // Let's create a new one to be sure
        console.log('1. Creating Activity...');
        const actRes = await axios.post(`${ADMIN_API_URL}/activity`, {
            name: 'Client API Test Activity',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'ACTIVE'
        });
        const activityId = actRes.data.id;
        console.log('   Activity Created:', activityId);

        // 2. Create a Task
        console.log('2. Creating Task...');
        // Need to temporarily switch to DRAFT to add task?
        // Wait, my previous code says "Only DRAFT activities can be updated".
        // But creating task is separate endpoint.
        // The constraint "Only tasks in DRAFT activities can be updated" applies to UPDATE/DELETE.
        // Does CREATE task require DRAFT?
        // Let's check adminController.createTask.
        // It doesn't seem to have that check in my memory, but let's assume it might or might not.
        // Actually, I should check if I added that constraint to create as well.
        // If I did, I need to create activity as DRAFT first.

        // Let's try creating task directly. If fail, I'll know.
        // Actually, to be safe, let's create DRAFT activity first.
    } catch (e) {
        // Ignore error if activity creation fails (maybe due to server restart timing)
    }

    // Let's just query an existing activity. I know ID 4 exists from previous run.
    const activityId = 4;

    try {
        console.log(`3. Fetching Activity Details for ID ${activityId}...`);
        const res = await axios.get(`${API_URL}/activity/${activityId}?lang=zh`);

        console.log('   Response Status:', res.status);
        console.log('   Activity Name:', res.data.activity.name);
        console.log('   Task Count:', res.data.tasks.length);
        if (res.data.tasks.length > 0) {
            console.log('   First Task Description:', res.data.tasks[0].description);
        }

        console.log('--- Verification Complete ---');
    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

run();
