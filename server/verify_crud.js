const axios = require('axios');

const API_URL = 'http://localhost:3000/api/admin';

async function run() {
    console.log('--- Starting CRUD Verification ---');

    let activityId;
    let taskId;

    try {
        // 1. Create DRAFT Activity
        console.log('1. Creating DRAFT Activity...');
        const actRes = await axios.post(`${API_URL}/activity`, {
            name: 'CRUD Test Activity',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'DRAFT'
        });
        activityId = actRes.data.id;
        console.log('   Activity Created:', activityId);

        // 2. Create Task
        console.log('2. Creating Task...');
        const taskRes = await axios.post(`${API_URL}/task`, {
            activityId,
            groupName: 'test-task',
            points: 10,
            dailyLimit: 1,
            totalLimit: 10,
            descJson: { en: 'Test' }
        });
        taskId = taskRes.data.id;
        console.log('   Task Created:', taskId);

        // 3. Update Activity (DRAFT) - Should Success
        console.log('3. Updating DRAFT Activity...');
        await axios.put(`${API_URL}/activity/${activityId}`, {
            name: 'CRUD Test Activity Updated',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'DRAFT'
        });
        console.log('   Update Success');

        // 4. Update Task (DRAFT Activity) - Should Success
        console.log('4. Updating Task (DRAFT Activity)...');
        await axios.put(`${API_URL}/task/${taskId}`, {
            groupName: 'test-task-updated',
            points: 20,
            dailyLimit: 1,
            totalLimit: 10,
            descJson: { en: 'Test Updated' }
        });
        console.log('   Update Success');

        // 5. Change to ACTIVE
        console.log('5. Changing Activity to ACTIVE...');
        await axios.put(`${API_URL}/activity/${activityId}`, {
            name: 'CRUD Test Activity Updated',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'ACTIVE'
        });
        console.log('   Status Changed to ACTIVE');

        // 6. Update Activity (ACTIVE) - Should Fail
        console.log('6. Updating ACTIVE Activity (Should Fail)...');
        try {
            await axios.put(`${API_URL}/activity/${activityId}`, {
                name: 'Should Fail',
                startTime: new Date(),
                endTime: new Date(),
                status: 'ACTIVE'
            });
            console.error('   FAILED: Update should have been rejected');
        } catch (e) {
            console.log('   Success: Update rejected as expected (' + e.response.data.error + ')');
        }

        // 7. Update Task (ACTIVE Activity) - Should Fail
        console.log('7. Updating Task in ACTIVE Activity (Should Fail)...');
        try {
            await axios.put(`${API_URL}/task/${taskId}`, {
                groupName: 'Should Fail',
                points: 30
            });
            console.error('   FAILED: Update should have been rejected');
        } catch (e) {
            console.log('   Success: Update rejected as expected (' + e.response.data.error + ')');
        }

        // 8. Delete Task (ACTIVE Activity) - Should Fail
        console.log('8. Deleting Task in ACTIVE Activity (Should Fail)...');
        try {
            await axios.delete(`${API_URL}/task/${taskId}`);
            console.error('   FAILED: Delete should have been rejected');
        } catch (e) {
            console.log('   Success: Delete rejected as expected (' + e.response.data.error + ')');
        }

        // 9. Delete Activity (ACTIVE) - Should Fail
        console.log('9. Deleting ACTIVE Activity (Should Fail)...');
        try {
            await axios.delete(`${API_URL}/activity/${activityId}`);
            console.error('   FAILED: Delete should have been rejected');
        } catch (e) {
            console.log('   Success: Delete rejected as expected (' + e.response.data.error + ')');
        }

        // 10. Change back to DRAFT (Need to allow this? Wait, if I can't update ACTIVE activity, how can I change it back to DRAFT?
        // Ah, the requirement says "Only DRAFT activities can be updated". This implies once ACTIVE, it's locked?
        // Usually we allow changing status back to DRAFT if we want to edit.
        // But my code says: if (activity.status !== 'DRAFT') return error.
        // So once ACTIVE, it cannot be updated at all! This might be too strict or intended.
        // If intended, I cannot change it back.
        // Let's assume for now this is the behavior.
        // To clean up, I might need to manually delete via DB or just leave it.
        // Or I should allow updating status FROM active TO draft?
        // The prompt said "Only in draft case can operate".
        // If I can't turn it back to draft, then it's a one-way street.
        // Let's verify this behavior.

        console.log('--- Verification Complete ---');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

run();
