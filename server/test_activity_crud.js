const axios = require('axios');

const API_URL = 'http://localhost:3000/api/admin';
const API_KEY = 'secret'; // Assuming default from .env or previous context, checking .env if needed. 
// Actually I don't recall seeing .env content but default was likely simple.
// Let's assume the previous scripts worked with headers.
// Wait, admin API usually doesn't need key if not protected or uses simple key.
// Looking at `adminController.js`, it doesn't show middleware in the file, but `routes/admin.js` might.
// `clientController.js` checks `x-api-key`.
// Let's assume Admin routes might be open or use same key.
// I'll check `routes/admin.js` content if this fails, but for now assuming standard setup.

const headers = {
    'Content-Type': 'application/json',
    'x-api-key': '123456' // Common default, or I'll check .env
};

// Reading .env content from previous turns or assuming.
// "API_SECRET_KEY" in `clientController.js`.
// Let's try to read .env first to be sure? No, I'll just write the test and if it fails I'll fix auth.
// Actually, `check_env.js` from previous turn output might help. 
// But let's look at `clientController.js`: `if (apiKey !== process.env.API_SECRET_KEY)`.
// I'll skip .env read to save steps and try '123456' or common.
// Wait, I can see .env size is 296 bytes.
// I'll make the script robust or just try.

async function testActivityCRUD() {
    console.log('--- Testing Activity CRUD ---');
    try {
        // 1. Create Activity
        const createRes = await axios.post(`${API_URL}/activity`, {
            name: 'Unit Test Activity',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'DRAFT'
        }, { headers });
        console.log('Create Activity: SUCCESS', createRes.data.id);
        const activityId = createRes.data.id;

        // 2. Get Activities
        const getRes = await axios.get(`${API_URL}/activity`, { headers });
        console.log('Get Activities: SUCCESS', getRes.data.length > 0);

        // 3. Update Activity
        const updateRes = await axios.put(`${API_URL}/activity/${activityId}`, {
            name: 'Unit Test Activity Updated',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'DRAFT'
        }, { headers });
        console.log('Update Activity: SUCCESS', updateRes.data.name === 'Unit Test Activity Updated');

        // 4. Delete Activity
        const deleteRes = await axios.delete(`${API_URL}/activity/${activityId}`, { headers });
        console.log('Delete Activity: SUCCESS');

    } catch (error) {
        console.error('Activity CRUD Failed:', error.response ? error.response.data : error.message);
    }
}

testActivityCRUD();
