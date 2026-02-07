const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  gps_accuracy: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  calculated_distance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  validation_status: {
    type: DataTypes.ENUM('VALID', 'INVALID'),
    allowNull: false,
  },
  device_model: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo_path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attendance_type: {
    type: DataTypes.ENUM('entry', 'exit'),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false, // Using custom timestamp field
});

// Associations
User.hasMany(Attendance, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Attendance;
