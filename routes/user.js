const express = require('express');

const router = express.Router();
const {
  createUser,
  userSignIn,
  verifyEmail,
  forgotPassword,
  getUsers,
  deleteUser,
  getUserById,
  userCount,
  Report,
  Rectified,
  EULA,
  EULAPost,
  googleSignin,
  resetPassword
} = require('../controllers/user');

const {
  validateUserSignUp,
  userVlidation,
  validateUserSignIn,
} = require('../middlewares/validation/user');




router.get("/getUsers",getUsers)
router.get("/userbyid/:id",getUserById)
router.get("/getUsers/count", userCount)
router.delete("/deleteUser/:id",deleteUser)
router.put('/:id/report', Report);
router.put('/:id/rectify', Rectified);
router.put('/eula/:id/eula', EULA);
router.put('/eula/:id/eulapost', EULAPost);

router.post('/create-user', 
validateUserSignUp,
 userVlidation,
 createUser
);
router.post('/auth/google', googleSignin);
router.post('/sign-in', userSignIn);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);




module.exports = router;
