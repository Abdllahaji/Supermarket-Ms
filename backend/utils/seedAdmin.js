const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@supermarket.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      console.log('Default Admin Created: admin@supermarket.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = { seedAdmin };
