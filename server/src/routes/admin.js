const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/stats/:activityId', adminController.getStats);
router.get('/export/rank', adminController.exportRank);

// Manual Adjustment
router.post('/task/adjust', adminController.adjustPoints);

// Activity
router.post('/activity', adminController.createActivity);
router.post('/activity/:id/clone', adminController.cloneActivity);
router.get('/activity', adminController.getActivities);
router.get('/activity/:id', adminController.getActivity);
router.put('/activity/:id', adminController.updateActivity);
router.delete('/activity/:id', adminController.deleteActivity);

// Task
router.post('/task', adminController.createTask);
router.get('/task', adminController.getTasks);
router.put('/task/:id', adminController.updateTask);
router.delete('/task/:id', adminController.deleteTask);

module.exports = router;
