const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();

// Controller to delete a user after verifying their password
router.delete('/deleteaccount/:userId', async (req, res) => {
  try {
    const { userId } = req.params; // The user's ID from the route parameter
    const { password } = req.body; // The password provided by the user in the request body

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Proceed to delete the user if the password is correct
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'User successfully deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

module.exports = router;
