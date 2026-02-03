const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const assert = require('assert');

async function verify() {
    try {
        console.log('Verifying jumpUrl field...');

        // 1. Create a dummy activity
        const activity = await prisma.activity.create({
            data: {
                name: 'Test Activity for JumpUrl ' + Date.now(),
                startTime: new Date(),
                endTime: new Date(Date.now() + 86400000),
                status: 'DRAFT'
            }
        });
        console.log('Created Activity:', activity.id);

        // 2. Create a task with jumpUrl
        const jumpUrl = 'https://www.google.com';
        const task = await prisma.task.create({
            data: {
                activityId: activity.id,
                taskName: 'JumpTask_' + Date.now(),
                points: 10,
                jumpUrl: jumpUrl,
                descJson: '{}'
            }
        });
        console.log('Created Task:', task.id);

        // 3. Verify jumpUrl
        assert.strictEqual(task.jumpUrl, jumpUrl, 'jumpUrl mismatch in created task');

        // 4. Update task
        const newJumpUrl = 'https://www.youtube.com';
        const updatedTask = await prisma.task.update({
            where: { id: task.id },
            data: { jumpUrl: newJumpUrl }
        });
        console.log('Updated Task:', updatedTask.id);
        assert.strictEqual(updatedTask.jumpUrl, newJumpUrl, 'jumpUrl mismatch in updated task');

        // Clean up
        await prisma.task.delete({ where: { id: task.id } });
        await prisma.activity.delete({ where: { id: activity.id } });
        console.log('Verification Success: jumpUrl field is working correctly.');

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
