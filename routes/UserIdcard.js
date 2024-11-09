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
    format: 'jpg',
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:eco', fetch_format: 'auto' }
    ]
  },
});

const upload = multer({ storage: storage });

router.put('/:id/picture', upload.fields([{ name: 'avatar' }, { name: 'picture' }]), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if a valid user ID is provided
    // if (!isValidObjectId(userId)) {
    //   return res.status(400).json({ success: false, message: 'Invalid user ID' });
    // }

    // // Check if files are provided
    // if (!req.files || !req.files.avatar || !req.files.picture) {
    //   return res.status(400).json({ success: false, message: 'Both avatar and picture files must be provided' });
    // }

    // Upload the images to Cloudinary and get the secure URLs
    // const avatarPath = req.files.avatar[0].path;
    // const picturePath = req.files.picture[0].path;

    // const avatarResult = await cloudinary.uploader.upload(avatarPath);
    // const pictureResult = await cloudinary.uploader.upload(picturePath);

    // const avatarUrl = avatarResult.secure_url;
    // const pictureUrl = pictureResult.secure_url;


    const picture = req.files['picture'] ? req.files['picture'][0].path : null;
      const avatar = req.files['avatar'] ? req.files['avatar'][0].path : null;

    // Update the user's avatar and picture in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar, picture, verified: true },
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
