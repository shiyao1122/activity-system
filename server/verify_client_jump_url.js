const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const assert = require('assert');
const clientController = require('./src/controllers/clientController');

async function verify() {
    console.log('--- Starting Client Jump URL Verification (Direct Controller Call) ---');
    const email = 'test_jump_url@example.com';
    let activityId;
    let taskId;

    try {
        // 1. Setup
        console.log('1. Setting up Test Data...');
        const jumpUrl = 'https://example.com/jump';

        const activity = await prisma.activity.create({
            data: {
                name: 'Client JumpUrl Test ' + Date.now(),
                startTime: new Date(),
                endTime: new Date(Date.now() + 86400000),
                status: 'ACTIVE'
            }
        });
        activityId = activity.id;
        console.log('   Created Activity:', activityId);

        const task = await prisma.task.create({
            data: {
                activityId,
                taskName: 'JumpTaskClient_' + Date.now(),
                points: 10,
                jumpUrl: jumpUrl,
                descJson: JSON.stringify({ en: 'Test Description' }),
            }
        });
        taskId = task.id;
        console.log('   Created Task:', taskId);

        // Mock Req/Res
        const mockRes = () => {
            const res = {};
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => { res.data = data; return res; };
            return res;
        };

        // 2. Verify getActivityDetails
        console.log('2. Verifying getActivityDetails...');
        const reqDetails = { params: { id: activityId }, query: { lang: 'en' } };
        const resDetails = mockRes();

        await clientController.getActivityDetails(reqDetails, resDetails);

        if (resDetails.statusCode && resDetails.statusCode !== 200) {
            throw new Error(`getActivityDetails failed with status ${resDetails.statusCode}: ${JSON.stringify(resDetails.data)}`);
        }

        const taskDetails = resDetails.data.tasks.find(t => t.id === taskId);
        console.log('   Response jumpUrl:', taskDetails.jumpUrl);
        assert.strictEqual(taskDetails.jumpUrl, jumpUrl, 'jumpUrl missing or incorrect in getActivityDetails');

        // 3. Verify getUserStatus
        console.log('3. Verifying getUserStatus...');
        const reqStatus = { query: { email, activityId, lang: 'en' } };
        const resStatus = mockRes();

        await clientController.getUserStatus(reqStatus, resStatus);

        if (resStatus.statusCode && resStatus.statusCode !== 200) {
            throw new Error(`getUserStatus failed with status ${resStatus.statusCode}: ${JSON.stringify(resStatus.data)}`);
        }

        const taskStatus = resStatus.data.tasks.find(t => t.id === taskId);
        console.log('   Response jumpUrl:', taskStatus.jumpUrl);
        assert.strictEqual(taskStatus.jumpUrl, jumpUrl, 'jumpUrl missing or incorrect in getUserStatus');

        console.log('--- Verification Success: jumpUrl is returned correctly in Client API ---');

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    } finally {
        if (taskId) await prisma.task.delete({ where: { id: taskId } });
        if (activityId) await prisma.activity.delete({ where: { id: activityId } });
        await prisma.$disconnect();
    }
}

verify();
