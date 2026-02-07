const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/record', authMiddleware, attendanceController.recordAttendance);
router.get('/history', authMiddleware, attendanceController.getHistory);

module.exports = router;
