-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "groupName" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1,
    "totalLimit" INTEGER NOT NULL DEFAULT 0,
    "descJson" TEXT NOT NULL,
    CONSTRAINT "Task_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "activityId" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userActivityId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskLog_userActivityId_fkey" FOREIGN KEY ("userActivityId") REFERENCES "UserActivity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRelation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inviterEmail" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "activityId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_email_activityId_key" ON "UserActivity"("email", "activityId");
