const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { sendWelcomeEmail } = require("../helpers/sendEmail");

// CREATE USER
exports.CreateUserController = async (req, res) => {
  try {
    const { fname, lname, email, mobile, password, userType } = req.body;
    const image = req.file ? `/public/users/${req.file.filename}` : '/public/default/picture.png';

    if (!fname || !lname || !email || !mobile || !password || !userType) {
      return res.status(400).send({
        success: false,
        message: "All fields (fname, lname, email, mobile, password, userType) are required"
      });
    }

    if (userType === 'licensee' && (!req.user || req.user.userType !== 'admin')) {
      return res.status(403).send({
        success: false,
        message: "Only admins can create licensee users"
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User with this email or mobile already exists"
      });
    }

    // ✅ Store plain password for email before hashing
    const plainPassword = password;
    const hashedPassword = await hashPassword(plainPassword);

    const user = await new User({
      fname,
      lname,
      email,
      mobile,
      password: hashedPassword,
      userType,
      image,
      status: 'new',
      createdBy: req.user ? req.user._id : 'system',
      updatedBy: req.user ? req.user._id : 'system',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).save();

    // ✅ Send welcome email with plain password
    await sendWelcomeEmail(email, fname, plainPassword);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).send({
      success: true,
      message: `Successfully created ${userType} user`,
      user: {
        ...userData,
        image: `${req.protocol}://${req.get('host')}${userData.image}`
      }
    });

  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).send({
      success: false,
      message: "Error in creating user",
      error: error.message
    });
  }
};


// LOGIN
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      return res.status(404).send({
        success: false,
        message: user?.isDeleted ? 'Account is deactivated' : 'Email is not registered'
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: 'Invalid password'
      });
    }

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      ftLogin: false
    });

    const token = JWT.sign(
      {
        _id: user._id,
        userType: user.userType,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).send({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        mobile: user.mobile,
        email: user.email,
        userType: user.userType,
        status: user.status,
        image: `${req.protocol}://${req.get('host')}${user.image}`
      },
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).send({
      success: false,
      message: 'Error in login',
      error: error.message
    });
  }
};

// FORGOT PASSWORD
exports.forgotPasswordController = async (req, res) => {
  try {
    const { email, mobile, newPassword } = req.body;
    if (!email || !mobile || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Email, mobile, and new password are required"
      });
    }

    const user = await User.findOne({ email, mobile });
    if (!user || user.isDeleted) {
      return res.status(404).send({
        success: false,
        message: user?.isDeleted ? 'Account is deactivated' : 'User not found'
      });
    }

    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, {
      password: hashed,
      updatedAt: new Date(),
      updatedBy: 'self'
    });

    res.status(200).send({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).send({
      success: false,
      message: "Error in password reset",
      error: error.message
    });
  }
};

// CURRENT USER
exports.currentUserController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.isDeleted) {
      return res.status(404).send({
        success: false,
        message: user?.isDeleted ? 'Account is deactivated' : 'User not found'
      });
    }

    res.status(200).send({
      success: true,
      message: "Current user details",
      user: {
        ...user.toObject(),
        image: `${req.protocol}://${req.get('host')}${user.image}`
      }
    });

  } catch (error) {
    console.error('Current User Error:', error);
    res.status(500).send({
      success: false,
      message: "Error fetching current user",
      error: error.message
    });
  }
};

// UPDATE USER
exports.UpdateUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).send({
        success: false,
        message: user?.isDeleted ? 'Cannot update deactivated account' : 'User not found'
      });
    }

    // Handle image replacement
    if (req.file && user.image && user.image !== '/public/default/picture.png') {
      const oldImagePath = path.join(__dirname, '../../', user.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user?._id || 'system'
    };

    // Prevent unsafe updates
    delete updateData.password;
    delete updateData.userType;

    if (req.file) {
      updateData.image = `/public/users/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    const userData = updatedUser.toObject();
    delete userData.password;

    res.status(200).send({
      success: true,
      message: 'User updated successfully',
      user: {
        ...userData,
        image: `${req.protocol}://${req.get('host')}${userData.image}`
      }
    });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).send({
      success: false,
      message: 'Error in updating the user',
      error: error.message
    });
  }
};

// GET ALL USERS
exports.GetAllUsersController = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      image: `${req.protocol}://${req.get('host')}${user.image}`
    }));

    res.status(200).send({
      success: true,
      message: "All users retrieved successfully",
      count: formattedUsers.length,
      users: formattedUsers
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).send({
      success: false,
      message: "Error in getting users",
      error: error.message
    });
  }
};

// GET SINGLE USER
exports.GetSingleUserController = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "User retrieved successfully",
      user: {
        ...user.toObject(),
        image: `${req.protocol}://${req.get('host')}${user.image}`
      }
    });

  } catch (error) {
    console.error('Get Single User Error:', error);
    res.status(500).send({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
};

// SOFT DELETE USER
exports.softDelete = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return res.status(400).send({ success: false, message: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).send({ success: false, message: "User not found or already deleted" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      status: 'blocked',
      updatedAt: new Date(),
      updatedBy: req.user._id
    }, { new: true }).select('-password');

    res.status(200).send({
      success: true,
      message: "User deactivated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Soft Delete User Error:', error);
    res.status(500).send({
      success: false,
      message: "Error in soft deleting user",
      error: error.message
    });
  }
};

// HARD DELETE USER
exports.hardDelete = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return res.status(400).send({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    // Delete profile image if not default
    if (user.image && user.image !== '/public/default/picture.png') {
      const imagePath = path.join(__dirname, '../../', user.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await User.findByIdAndDelete(userId);

    res.status(200).send({
      success: true,
      message: "User permanently deleted"
    });

  } catch (error) {
    console.error('Hard Delete User Error:', error);
    res.status(500).send({
      success: false,
      message: "Error in hard deleting user",
      error: error.message
    });
  }
};


// REACTIVATE USER
exports.reactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user || !user.isDeleted) {
      return res.status(404).send({ success: false, message: "User not found or not deleted" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      isDeleted: false,
      status: 'active',
      updatedAt: new Date(),
      updatedBy: req.user._id
    }, { new: true }).select('-password');

    res.status(200).send({
      success: true,
      message: "User reactivated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Reactivate User Error:', error);
    res.status(500).send({
      success: false,
      message: "Error reactivating user",
      error: error.message
    });
  }
};
