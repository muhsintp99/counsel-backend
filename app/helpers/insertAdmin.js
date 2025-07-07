const mongoose = require('mongoose');
const User = require('../models/user');
const { hashPassword } = require('./authHelper');
const { sendWelcomeEmail } = require('./sendEmail');
const path = require('path');
const fs = require('fs').promises;

const insertDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'muhsintp.develop@gmail.com' });
    if (existingAdmin) {
      console.log(`👤 Admin user already exists: ${existingAdmin?.email}`);
      return;
    }

    const imagePath = path.join(__dirname, '../../public/defult/AdminUser.png');

    try {
      await fs.access(imagePath);
    } catch (error) {
      console.error('❌ Default image not found at:', imagePath);
      throw new Error('Default Admin image file is missing');
    }

    const imageUrl = '/public/defult/AdminUser.png';
    const plainPassword = '123456';
    const hashedPassword = await hashPassword(plainPassword);

    const adminUser = new User({
      fname: 'muhsin',
      lname: 'admin',
      email: 'muhsintp.develop@gmail.com',
      mobile: '8593856881',
      password: hashedPassword,
      image: imageUrl,
      userType: 'admin',
      status: 'active',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system'
    });

    await adminUser.save();

    await sendWelcomeEmail(adminUser.email, `${adminUser.fname} ${adminUser.lname}`, plainPassword);

    console.log('👤 Default admin user created successfully with image and email sent');
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    throw error;
  }
};

module.exports = { insertDefaultAdmin };
