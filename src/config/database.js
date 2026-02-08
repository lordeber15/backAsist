const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    timezone: '-05:00', // Lima timezone (UTC-5)
    dialectOptions: {
      timezone: 'America/Lima',
    },
  }
);

module.exports = sequelize;
