
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'pangzi@tenorshare.cn';
    const activityId = 5;

    console.log(`Investigating for ${email} in activity ${activityId}...`);

    // 1. Get UserActivity
    const userActivity = await prisma.userActivity.findUnique({
        where: { email_activityId: { email, activityId } },
        include: { logs: true },
    });

    if (!userActivity) {
        console.log('UserActivity not found.');
        return;
    }

    console.log('UserActivity:', {
        id: userActivity.id,
        totalPoints: userActivity.totalPoints,
        updatedAt: userActivity.updatedAt
    });

    // 2. Analyze Logs
    console.log('\nTask Logs:');

    if (userActivity.logs.length === 0) {
        console.log('No logs found.');
    } else {
        for (const log of userActivity.logs) {
            const task = await prisma.task.findUnique({ where: { id: log.taskId } });
            console.log(`- Log ID: ${log.id}, Task ID: ${log.taskId} (${task ? task.taskName : 'Unknown'}), ActivityId: ${task ? task.activityId : 'N/A'}, Points: ${log.pointsEarned}, CreatedAt: ${log.createdAt}`);
        }
    }

    // 3. Calc Sum from logs
    const sumPoints = userActivity.logs.reduce((acc, log) => acc + log.pointsEarned, 0);
    console.log(`\nSum of points from logs: ${sumPoints}`);
    console.log(`Difference (Total - Sum): ${userActivity.totalPoints - sumPoints}`);

    // 4. Check all tasks in activity
    const tasks = await prisma.task.findMany({
        where: { activityId },
    });
    console.log(`\nTotal Tasks in Activity ${activityId}: ${tasks.length}`);
    const task40 = tasks.find(t => t.id === 40);
    if (task40) {
        console.log('Task 40 found in list:', task40);
    } else {
        console.log('Task 40 NOT found in findMany query!');
    }


}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
