const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
const ADMIN_API_URL = 'http://localhost:3000/api/admin';
const API_KEY = 'secret-key-for-dev';

async function run() {
    console.log('--- Starting Generalized Invitation Verification ---');

    try {
        // 1. Create DRAFT Activity
        console.log('1. Creating DRAFT Activity...');
        const actRes = await axios.post(`${ADMIN_API_URL}/activity`, {
            name: 'Invite Test Activity',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'DRAFT'
        });
        const activityId = actRes.data.id;
        console.log('   Activity Created:', activityId);

        // 2. Create Target Task (e.g., "register")
        console.log('2. Creating Target Task (register)...');
        await axios.post(`${ADMIN_API_URL}/task`, {
            activityId,
            groupName: 'register',
            points: 100,
            dailyLimit: 1,
            totalLimit: 1,
            descJson: { en: 'Register' }
        });

        // 3. Create Invitation Task (e.g., "invite-reward") targeting "register"
        console.log('3. Creating Invitation Task (invite-reward) targeting "register"...');
        await axios.post(`${ADMIN_API_URL}/task`, {
            activityId,
            groupName: 'invite-reward',
            points: 50,
            dailyLimit: 0,
            totalLimit: 0,
            descJson: { en: 'Invite Reward' },
            targetGroupName: 'register'
        });

        // 4. Activate Activity
        console.log('4. Activating Activity...');
        await axios.put(`${ADMIN_API_URL}/activity/${activityId}`, {
            name: 'Invite Test Activity',
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: 'ACTIVE'
        });

        // 5. User A (Invitee) completes "register" with Inviter B
        console.log('5. User A completes "register" with Inviter B...');
        const inviteeEmail = `invitee_${Date.now()}@test.com`;
        const inviterEmail = `inviter_${Date.now()}@test.com`;

        const reportRes = await axios.post(`${API_URL}/task/report`, {
            email: inviteeEmail,
            activityId,
            taskGroupName: 'register',
            inviterEmail: inviterEmail
        }, { headers: { 'x-api-key': API_KEY } });

        console.log('   Report Result:', reportRes.data);

        // 6. Check Inviter B's points
        console.log('6. Checking Inviter B points...');
        const statusRes = await axios.get(`${API_URL}/user/status`, {
            params: { email: inviterEmail, activityId }
        });

        console.log('   Inviter Total Points:', statusRes.data.totalPoints);

        // Inviter should have 50 points (from invite-reward)
        if (statusRes.data.totalPoints === 50) {
            console.log('   SUCCESS: Inviter received correct points.');
        } else {
            console.error(`   FAILED: Expected 50 points, got ${statusRes.data.totalPoints}`);
        }

        console.log('--- Verification Complete ---');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

run();
