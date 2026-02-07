const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/record', authMiddleware, upload.single('photo'), attendanceController.recordAttendance);
router.get('/history', authMiddleware, attendanceController.getHistory);
router.get('/today', authMiddleware, attendanceController.getTodayStatus);

module.exports = router;
