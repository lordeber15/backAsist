const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

// User model (simplified)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
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

async function createAdminUser() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync model
    await User.sync({ alter: true });
    console.log('✓ User table synced');

    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('⚠ Admin user already exists');
      console.log(`Username: admin`);
      console.log('Use this account to login');
      process.exit(0);
    }

    // Create admin user
    const password = 'admin123'; // Default password
    const password_hash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username: 'admin',
      password_hash,
      role: 'admin',
      status: 'active',
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('═══════════════════════════════════');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('═══════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
