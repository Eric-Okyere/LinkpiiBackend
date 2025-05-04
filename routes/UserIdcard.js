const express = require('express');
const router = express.Router();
const { isValidObjectId } = require('mongoose');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_pictures',
    format: 'jpg'
  },
});


const upload = multer({ storage: storage });

router.put('/:id/picture', upload.fields([{ name: 'avatar' }, { name: 'picture' }, { name: 'ghback' }]), async (req, res) => {
  try {
    const userId = req.params.id;


    const picture = req.files['picture'] ? req.files['picture'][0].path : null;
      const avatar = req.files['avatar'] ? req.files['avatar'][0].path : null;
      const ghback = req.files['ghback'] ? req.files['ghback'][0].path : null;

    // Update the user's avatar and picture in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar, picture,ghback, verified: true },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User avatar and picture updated and verified', user: updatedUser });
  } catch (error) {
    console.error('Error updating user avatar and picture:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Route to update only username and phone
router.put('/:id/details', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("User ID:", userId);
    console.log("Request Body:", req.body);

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const { name, phone, lastname, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (lastname) updateData.lastname = lastname;
    if (phone) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User details updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



module.exports = router;
