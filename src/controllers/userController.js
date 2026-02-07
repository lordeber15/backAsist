const User = require('../models/User');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { groupByDay } = require('../utils/dateHelpers');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'status', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      password_hash,
      role: role || 'user',
      status: 'active',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset user password (admin only)
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await user.update({ password_hash });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user attendance history (admin only)
exports.getUserAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'role', 'status'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const whereClause = { user_id: id };

    // Add date filters if provided
    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.timestamp[Op.lte] = new Date(end_date);
      }
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
    });

    // Group by day
    const grouped = groupByDay(attendance);

    res.json({
      user: user,
      total: attendance.length,
      grouped: grouped,
      raw: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ status });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
