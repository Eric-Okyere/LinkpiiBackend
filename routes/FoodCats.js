const express = require('express');
const router = express.Router();
const FoodCats = require('../models/categories/FoodCats'); 
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
require("dotenv/config");
const { CloudinaryStorage } = require('multer-storage-cloudinary');


router.get('/', async (req, res) => {
  try {
    const productList = await FoodCats.find();
    res.send(productList);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await FoodCats.findById(req.params.id);
    res.send(product);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'upload';

    return {
      folder: folder,
      format: 'jpg',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:eco', fetch_format: 'auto' }
      ]
    };
  },
});

const upload = multer({ storage: storage });




router.post('/', upload.single('picture'), async (req, res) => {
  try {
    const { name } = req.body;
    const picture = req.file ? req.file.path : '';

    const cloudinaryResult = await cloudinary.uploader.upload(picture);

    const newProduct = new FoodCats({
      name,
      picture: cloudinaryResult.secure_url,
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/:id', upload.single('picture'), async (req, res) => {
  try {
    const { name } = req.body;
    let pictureUrl;

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      pictureUrl = uploaded.secure_url;
    }

    const updated = await FoodCats.findByIdAndUpdate(
      req.params.id,
      {
        name,
        ...(pictureUrl && { picture: pictureUrl }),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FoodCats.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
