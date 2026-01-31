const prisma = require('../prisma');

// Dashboard Stats
const getStats = async (req, res) => {
    const { activityId } = req.params;
    try {
        const id = parseInt(activityId);
        const totalUsers = await prisma.userActivity.count({ where: { activityId: id } });
        const totalPointsAgg = await prisma.userActivity.aggregate({
            where: { activityId: id },
            _sum: { totalPoints: true },
        });
        const totalPoints = totalPointsAgg._sum.totalPoints || 0;

        // Top 100 Leaderboard
        const leaderboard = await prisma.userActivity.findMany({
            where: { activityId: id },
            orderBy: { totalPoints: 'desc' },
            take: 100,
            select: { email: true, totalPoints: true, updatedAt: true },
        });

        res.json({
            totalUsers,
            totalPoints,
            leaderboard,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Manual Adjustment
const adjustPoints = async (req, res) => {
    const { email, activityId, points, reason } = req.body;
    // reason should be logged, but for now we just adjust.
    // We should create a special Task for "Manual Adjustment" or just add points directly?
    // TDD says "Manual modify user points or task status".
    // Let's add points directly and maybe log it as a special TaskLog if possible, or just update UserActivity.
    // Better to have a trace. Let's assume we create a TaskLog with a null taskId or a special system task.
    // But schema requires taskId.
    // So we might need a "System Adjustment" task in every activity or just update totalPoints directly.
    // Updating totalPoints directly is risky without log.
    // Let's update totalPoints directly for MVP as per TDD "Manual modify...".

    try {
        const userActivity = await prisma.userActivity.findUnique({
            where: { email_activityId: { email, activityId } },
        });

        if (!userActivity) {
            return res.status(404).json({ error: 'User not found in this activity' });
        }

        await prisma.userActivity.update({
            where: { id: userActivity.id },
            data: { totalPoints: { increment: points } },
        });

        // TODO: Log this action in a separate AdminLog table if required.

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export Rank (CSV)
const exportRank = async (req, res) => {
    const { activityId } = req.query;
    try {
        const users = await prisma.userActivity.findMany({
            where: { activityId: parseInt(activityId) },
            orderBy: { totalPoints: 'desc' },
            select: { email: true, totalPoints: true },
        });

        // Convert to CSV
        const csv = ['Email,Points', ...users.map(u => `${u.email},${u.totalPoints}`)].join('\n');
        res.header('Content-Type', 'text/csv');
        res.attachment('rank.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CRUD Activity
const createActivity = async (req, res) => {
    try {
        const { name, startTime, endTime, status } = req.body;
        const activity = await prisma.activity.create({
            data: { name, startTime: new Date(startTime), endTime: new Date(endTime), status },
        });
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActivities = async (req, res) => {
    try {
        const activities = await prisma.activity.findMany();
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const activity = await prisma.activity.findUnique({ where: { id: parseInt(id) } });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startTime, endTime, status } = req.body;

        const activity = await prisma.activity.findUnique({ where: { id: parseInt(id) } });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        if (activity.status !== 'DRAFT') {
            return res.status(400).json({ error: 'Only DRAFT activities can be updated' });
        }

        const updated = await prisma.activity.update({
            where: { id: parseInt(id) },
            data: { name, startTime: new Date(startTime), endTime: new Date(endTime), status },
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const activity = await prisma.activity.findUnique({ where: { id: parseInt(id) } });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        if (activity.status !== 'DRAFT') {
            return res.status(400).json({ error: 'Only DRAFT activities can be deleted' });
        }

        // Delete related tasks first (if any)
        await prisma.task.deleteMany({ where: { activityId: parseInt(id) } });
        // Delete related user activities (if any - though DRAFT shouldn't have many)
        await prisma.userActivity.deleteMany({ where: { activityId: parseInt(id) } });

        await prisma.activity.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CRUD Task
const createTask = async (req, res) => {
    const { activityId, groupName, points, dailyLimit, totalLimit, descJson, targetGroupName } = req.body;
    try {
        // Check activity status
        const activity = await prisma.activity.findUnique({ where: { id: activityId } });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });
        // if (activity.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT activities can be updated' }); 

        const task = await prisma.task.create({
            data: {
                activityId,
                groupName,
                points,
                dailyLimit,
                totalLimit,
                descJson: typeof descJson === 'object' ? JSON.stringify(descJson) : descJson,
                targetGroupName,
            },
        });
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getTasks = async (req, res) => {
    const { activityId } = req.query;
    try {
        const tasks = await prisma.task.findMany({
            where: { activityId: parseInt(activityId) },
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { groupName, points, dailyLimit, totalLimit, descJson, targetGroupName } = req.body;
    try {
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) }, include: { activity: true } });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.activity.status !== 'DRAFT') return res.status(400).json({ error: 'Only tasks in DRAFT activities can be updated' });

        const updated = await prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                groupName,
                points,
                dailyLimit,
                totalLimit,
                descJson: typeof descJson === 'object' ? JSON.stringify(descJson) : descJson,
                targetGroupName,
            },
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) },
            include: { activity: true }
        });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (task.activity.status !== 'DRAFT') {
            return res.status(400).json({ error: 'Only tasks in DRAFT activities can be deleted' });
        }

        await prisma.task.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const cloneActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const sourceActivityId = parseInt(id);

        const sourceActivity = await prisma.activity.findUnique({
            where: { id: sourceActivityId },
            include: { tasks: true } // Fetch tasks as well
        });

        if (!sourceActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Use transaction to ensure both activity and tasks are created
        const newActivity = await prisma.$transaction(async (prisma) => {
            // 1. Create new activity
            const createdActivity = await prisma.activity.create({
                data: {
                    name: `${sourceActivity.name} (Copy)`,
                    startTime: sourceActivity.startTime,
                    endTime: sourceActivity.endTime,
                    status: 'DRAFT', // Default to DRAFT
                },
            });

            // 2. Clone tasks
            if (sourceActivity.tasks && sourceActivity.tasks.length > 0) {
                const tasksToCreate = sourceActivity.tasks.map(task => ({
                    activityId: createdActivity.id,
                    groupName: task.groupName,
                    points: task.points,
                    dailyLimit: task.dailyLimit,
                    totalLimit: task.totalLimit,
                    descJson: task.descJson,
                    targetGroupName: task.targetGroupName,
                }));

                await prisma.task.createMany({
                    data: tasksToCreate,
                });
            }

            return createdActivity;
        });



        res.json(newActivity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const translateText = async (req, res) => {
    const { text, targetLangs } = req.body;
    if (!text || !targetLangs || !targetLangs.length) {
        return res.status(400).json({ error: 'Missing text or targetLanguages' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `Translate the following text: "${text}" into these languages: ${targetLangs.join(', ')}. 
        Return ONLY a JSON object where keys are the language codes (from the list: ${targetLangs.join(', ')}) and values are the translations. 
        Example format: { "zh": "...", "ja": "..." }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Extract JSON from response (in case of markdown blocks)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse translation response');
        }

        const translations = JSON.parse(jsonMatch[0]);
        res.json(translations);
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({ error: 'Translation failed: ' + error.message });
    }
};



module.exports = {
    getStats,
    adjustPoints,
    exportRank,
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    cloneActivity,
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    translateText,
};
