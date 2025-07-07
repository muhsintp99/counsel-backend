const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/user');
const {
  requireSignIn,
  isAdmin,
  isLicensee,
  isSelfOrAdmin
} = require('../middlewares/authMiddleware');

// ✅ Use local multer upload
const createUpload = require('../middlewares/upload'); // ✅ Local image upload using multer
// const createUpload = require('../middlewares/cloudinaryUpload'); // ❌ Cloudinary (removed)

// ✅ Create upload middleware for 'users' folder
const uploadUsersImage = createUpload('users');

/**
 * @route POST /users
 * @desc Create a new user (admin can create licensee)
 * @access Public for normal users, Admin for licensee
 */
router.post(
  '/',
  (req, res, next) => {
    uploadUsersImage(req, res, err => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res, next) => {
    try {
      const { userType } = req.body;

      if (userType === 'licensee') {
        return requireSignIn(req, res, (err) => {
          if (err) return next(err);

          if (!req.user) {
            return res.status(401).json({
              success: false,
              message: "Authentication required to create licensee users",
            });
          }

          if (req.user.userType !== 'admin') {
            return res.status(403).json({
              success: false,
              message: "Only admins can create licensee users",
            });
          }

          UserController.CreateUserController(req, res, next);
        });
      } else {
        UserController.CreateUserController(req, res, next);
      }
    } catch (error) {
      next(error);
    }
  }
);

// ✅ Create licensee (admin only)
router.post(
  '/create-licensee',
  requireSignIn,
  isAdmin,
  UserController.CreateUserController
);

// ✅ Login
router.post('/login', UserController.loginController);

// ✅ Forgot password
router.post('/forgot-password', UserController.forgotPasswordController);

// ✅ Current logged-in user
router.get('/current', requireSignIn, UserController.currentUserController);

// ✅ Licensee auth check
router.get('/licensee-auth', requireSignIn, isLicensee, (req, res) => {
  res.status(200).send({
    success: true,
    message: "Licensee authentication successful"
  });
});

// ✅ Admin auth check
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    success: true,
    message: "Admin authentication successful"
  });
});

// ✅ Get all users (admin only)
router.get('/', requireSignIn, isAdmin, UserController.GetAllUsersController);

// ✅ Get single user (self or admin)
router.get('/:id', requireSignIn, isSelfOrAdmin, UserController.GetSingleUserController);

// ✅ Update user (with image)
router.put(
  '/:id',
  (req, res, next) => {
    uploadUsersImage(req, res, err => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  requireSignIn,
  isSelfOrAdmin,
  UserController.UpdateUserController
);

// ✅ Soft delete user (admin only)
router.patch('/:id/delete', requireSignIn, isAdmin, UserController.softDelete);

// ✅ Reactivate soft-deleted user
router.patch('/:id/reactivate', requireSignIn, isAdmin, UserController.reactivateUser);

module.exports = router;
