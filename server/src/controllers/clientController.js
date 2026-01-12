const prisma = require('../prisma');

const reportTask = async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { email, activityId, taskGroupName, inviterEmail } = req.body;

    if (!email || !activityId || !taskGroupName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check Activity
            const activity = await tx.activity.findUnique({ where: { id: activityId } });
            if (!activity || activity.status !== 'ACTIVE') {
                throw new Error('Activity not active');
            }
            const now = new Date();
            if (now < activity.startTime || now > activity.endTime) {
                throw new Error('Activity not in progress');
            }

            // 2. Find Task
            // Assuming groupName is unique per activity for simplicity, or we take the first one.
            // In reality, might need more specific selector.
            const task = await tx.task.findFirst({
                where: { activityId, groupName: taskGroupName },
            });

            if (!task) {
                throw new Error('Task not found');
            }

            // 3. Get or Create UserActivity
            let userActivity = await tx.userActivity.findUnique({
                where: { email_activityId: { email, activityId } },
            });

            if (!userActivity) {
                userActivity = await tx.userActivity.create({
                    data: { email, activityId },
                });
            }

            // 4. Check Limits
            // Total Limit
            const totalLogs = await tx.taskLog.count({
                where: { userActivityId: userActivity.id, taskId: task.id },
            });
            if (task.totalLimit > 0 && totalLogs >= task.totalLimit) {
                return { success: true, points: 0, message: 'Total limit reached' };
            }

            // Daily Limit
            if (task.dailyLimit > 0) {
                const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                const dailyLogs = await tx.taskLog.count({
                    where: {
                        userActivityId: userActivity.id,
                        taskId: task.id,
                        createdAt: { gte: startOfDay },
                    },
                });
                if (dailyLogs >= task.dailyLimit) {
                    return { success: true, points: 0, message: 'Daily limit reached' };
                }
            }

            // 5. Record Task
            const log = await tx.taskLog.create({
                data: {
                    userActivityId: userActivity.id,
                    taskId: task.id,
                    pointsEarned: task.points,
                },
            });

            // 6. Update User Points
            await tx.userActivity.update({
                where: { id: userActivity.id },
                data: { totalPoints: { increment: task.points } },
            });

            // 7. Handle Invite (Dynamic)
            // Check if this task is a target for any invitation task
            if (inviterEmail && inviterEmail !== email) {
                // Check if invite relation exists
                let relation = await tx.userRelation.findFirst({
                    where: { inviterEmail, inviteeEmail: email, activityId },
                });

                if (!relation) {
                    // Create relation if not exists (first time interaction in this activity)
                    relation = await tx.userRelation.create({
                        data: { inviterEmail, inviteeEmail: email, activityId },
                    });
                }

                // Find all tasks in this activity that target this task's groupName
                const inviteTasks = await tx.task.findMany({
                    where: {
                        activityId,
                        targetGroupName: taskGroupName, // The task just completed by invitee
                    },
                });

                for (const inviteTask of inviteTasks) {
                    // Award points to Inviter
                    // Get/Create Inviter UserActivity
                    let inviterActivity = await tx.userActivity.findUnique({
                        where: { email_activityId: { email: inviterEmail, activityId } },
                    });
                    if (!inviterActivity) {
                        inviterActivity = await tx.userActivity.create({
                            data: { email: inviterEmail, activityId },
                        });
                    }

                    // Check Inviter Limits for this invite task
                    // Total Limit
                    const totalLogs = await tx.taskLog.count({
                        where: { userActivityId: inviterActivity.id, taskId: inviteTask.id },
                    });
                    if (inviteTask.totalLimit > 0 && totalLogs >= inviteTask.totalLimit) {
                        continue; // Skip if limit reached
                    }

                    // Daily Limit
                    if (inviteTask.dailyLimit > 0) {
                        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                        const dailyLogs = await tx.taskLog.count({
                            where: {
                                userActivityId: inviterActivity.id,
                                taskId: inviteTask.id,
                                createdAt: { gte: startOfDay },
                            },
                        });
                        if (dailyLogs >= inviteTask.dailyLimit) {
                            continue; // Skip if limit reached
                        }
                    }

                    // Record Inviter Log
                    await tx.taskLog.create({
                        data: {
                            userActivityId: inviterActivity.id,
                            taskId: inviteTask.id,
                            pointsEarned: inviteTask.points,
                        },
                    });

                    // Update Inviter Points
                    await tx.userActivity.update({
                        where: { id: inviterActivity.id },
                        data: { totalPoints: { increment: inviteTask.points } },
                    });
                }
            }

            return { success: true, points: task.points };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getUserStatus = async (req, res) => {
    const { email, activityId, lang = 'en' } = req.query;

    if (!email || !activityId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const activity = await prisma.activity.findUnique({ where: { id: parseInt(activityId) } });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        const userActivity = await prisma.userActivity.findUnique({
            where: { email_activityId: { email, activityId: parseInt(activityId) } },
            include: { logs: true },
        });

        const tasks = await prisma.task.findMany({
            where: { activityId: parseInt(activityId) },
        });

        // Format response
        const taskStatus = tasks.map(task => {
            let desc = {};
            try {
                desc = JSON.parse(task.descJson);
            } catch (e) {
                desc = { en: task.descJson };
            }

            const userLogs = userActivity ? userActivity.logs.filter(l => l.taskId === task.id) : [];
            const totalCompleted = userLogs.length;

            // Calculate daily completed
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            const dailyCompleted = userLogs.filter(l => new Date(l.createdAt) >= startOfDay).length;

            return {
                id: task.id,
                groupName: task.groupName,
                description: desc[lang] || desc['en'] || 'Task',
                points: task.points,
                completed: {
                    total: totalCompleted,
                    daily: dailyCompleted,
                },
                limits: {
                    total: task.totalLimit,
                    daily: task.dailyLimit,
                },
                isFinished: (task.totalLimit > 0 && totalCompleted >= task.totalLimit)
            };
        });

        res.json({
            totalPoints: userActivity ? userActivity.totalPoints : 0,
            tasks: taskStatus,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getActivityDetails = async (req, res) => {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    try {
        const activity = await prisma.activity.findUnique({
            where: { id: parseInt(id) },
        });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const tasks = await prisma.task.findMany({
            where: { activityId: parseInt(id) },
        });

        const formattedTasks = tasks.map(task => {
            let desc = {};
            try {
                desc = JSON.parse(task.descJson);
            } catch (e) {
                desc = { en: task.descJson };
            }

            return {
                id: task.id,
                groupName: task.groupName,
                description: desc[lang] || desc['en'] || 'Task',
                points: task.points,
                limits: {
                    total: task.totalLimit,
                    daily: task.dailyLimit,
                },
            };
        });

        res.json({
            activity: {
                id: activity.id,
                name: activity.name,
                startTime: activity.startTime,
                endTime: activity.endTime,
                status: activity.status,
            },
            tasks: formattedTasks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    reportTask,
    getUserStatus,
    getActivityDetails,
};
