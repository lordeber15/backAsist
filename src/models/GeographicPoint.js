const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeographicPoint = sequelize.define('GeographicPoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  radius_meters: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = GeographicPoint;
