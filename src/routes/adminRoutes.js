const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware.requireAdmin);

// User management
router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
router.post('/users/:id/reset-password', userController.resetPassword);
router.patch('/users/:id/status', userController.updateUserStatus);

// User attendance history
router.get('/users/:id/attendance', userController.getUserAttendance);

module.exports = router;
