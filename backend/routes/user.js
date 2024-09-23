const express = require('express');
// Removed duplicate imports and included 'verifyEmail' from the same 'userController' import
const { 
  loginUser, 
  signupUser, 
  verifyEmail, 
  updateUserPassword, 
  sendOTP, 
  deleteOTP, 
  forgotPassword, 
  resetPassword, 
  getEmployees, 
  deleteUser, 
  assignAdmin, 
  unassignAdmin
} = require('../controllers/userController')
const requireAuth = require('../middleware/requireAuth'); // Assuming this middleware exists to check for authenticated users
const { getUserById } = require('../controllers/userController');
const { getUserDetails } = require('../controllers/userController');
const { isResetTokenValid } = require('../middleware/user');
const router = express.Router();

// Route for user login
router.post('/login', loginUser);

// Route for user signup
router.post('/signup', signupUser);

// Route for verifying email
router.post('/verify-email', verifyEmail); // Make sure 'verifyEmail' is implemented in your 'userController'

// New route for fetching employees. Protected by requireAuth middleware
router.get('/employees', requireAuth, getEmployees);

// New route for fetching a user by ID. Protected by requireAuth middleware
router.get('/id', requireAuth, getUserById);

router.get('/:id', getUserDetails);

// DELETE a user
router.delete('/delete/', deleteUser)

router.post('/assign-admin', assignAdmin)
router.post('/unassign-admin', unassignAdmin)

router.post('/update-password', updateUserPassword)

router.post('/send-OTP', sendOTP)

router.post('/delete-OTP', deleteOTP)

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/', isResetTokenValid, resetPassword);

router.post('/verify-token', isResetTokenValid, (req,res) => {
    res.json({success: true});
});


module.exports = router;
