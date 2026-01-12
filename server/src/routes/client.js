const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/task/report', clientController.reportTask);
router.get('/user/status', clientController.getUserStatus);
router.get('/activity/:id', clientController.getActivityDetails);

module.exports = router;
