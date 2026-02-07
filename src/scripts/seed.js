const sequelize = require('../config/database');
const User = require('../models/User');
const GeographicPoint = require('../models/GeographicPoint');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Reset DB for seeding

    // Create Admin User
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.create({
      username: 'admin',
      password_hash: hashedPassword,
      status: 'active',
    });
    console.log('User "admin" created with password "123456"');

    // Create Geographic Point (Example: Plaza Mayor de Lima, just as a placeholder)
    // -12.046374, -77.042763
    await GeographicPoint.create({
      latitude: -12.046374,
      longitude: -77.042763,
      radius_meters: 50,
      status: 'active',
    });
    console.log('Default Geographic Point created');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
