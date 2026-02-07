const User = require('./User');
const GeographicPoint = require('./GeographicPoint');
const Attendance = require('./Attendance');
const sequelize = require('../config/database');

// Ensure associations are loaded
const models = {
  User,
  GeographicPoint,
  Attendance,
};

module.exports = models;
