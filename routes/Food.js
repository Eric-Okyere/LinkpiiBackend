const express = require('express');
const router = express.Router();
const {Food} = require('../models/Food/Food');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv/config');


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'food-uploads',
      format: file.mimetype.includes('video') ? 'mp4' : 'jpg',
      transformation: file.mimetype.includes('image')
        ? [{ width: 800, height: 600, crop: 'limit' }]
        : [],
    };
  }
});

const upload = multer({ storage });


router.get('/', async (req, res) => {
  try {
    const foods = await Food.find().populate('category').populate('author');
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category').populate('author');
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'picturesec', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name, foodtypes, region, town, location, phone, category, whatsapp, price, author } = req.body;

    const picture = req.files.picture ? req.files.picture[0].path : '';
    const picturesec = req.files.picturesec ? req.files.picturesec[0].path : '';
    const video = req.files.video ? req.files.video[0].path : '';

    const newFood = new Food({
      name,
      foodtypes,
      region,
      town,
      location,
      phone,
      category,
      whatsapp,
      price,
      author,
      picture,
      picturesec,
      video
    });

    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


router.put('/:id', upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'picturesec', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files.picture) {
      updateData.picture = req.files.picture[0].path;
    }

    if (req.files.picturesec) {
      updateData.picturesec = req.files.picturesec[0].path;
    }

    if (req.files.video) {
      updateData.video = req.files.video[0].path;
    }

    const updated = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Food not found' });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Food.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Food not found' });
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
