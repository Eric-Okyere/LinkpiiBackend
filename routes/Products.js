const express = require('express');
const router = express.Router();
const { Product } = require('../models/products/products');
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
require("dotenv/config");

// THE FIX: Destructure CloudinaryStorage from the package
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { Car } = require('../models/Car/CarModel');
const { Category } = require('../models/categories/categories');
const User = require('../models/user');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = 'upload';
    
    if (file.mimetype.startsWith('video')) {
      return {
        folder: folder,
        resource_type: 'video', 
        format: 'mp4',
        transformation: [
          { width: 600, height: 300, crop: 'limit' },
          { quality: 'auto:best' },
          { video_codec: 'h264' },
          { bit_rate: '1500k' },
          { audio_codec: 'aac' },
          { duration: "10.0" }
        ]
      };
    }

    return {
      folder: folder,
      format: 'jpg',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:eco', fetch_format: 'auto' }
      ]
    };
  },
});

const upload = multer({ storage: storage });

/* -------------------------------------------------------------------------- */
/* GET ROUTES                                  */
/* -------------------------------------------------------------------------- */

// Get all products
router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate("category").populate("author").sort({ dateCreated: -1 });
  if (!productList) return res.status(500).json({ success: false });
  res.send(productList);
});

// Category Detail (Categories with their approved products)
router.get("/detail", async (req, res) => {
  try {
    const categories = await Category.find();
    const categoriesWithApprovedProducts = [];
    for (const category of categories) {
      const products = await Product.find({ category: category._id, approved: true });
      categoriesWithApprovedProducts.push({ products: products });
    }
    res.json(categoriesWithApprovedProducts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Approved products list
router.get('/approved', async (req, res) => {
  try {
    const productList = await Product.find({ approved: true }).populate("category").sort({ boost: -1, dateCreated: -1 });
    if (!productList) return res.status(500).json({ success: false });
    res.send(productList);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Approved cars
router.get('/car/approved', async (req, res) => {
  try {
    const approvedProducts = await Car.find({ approved: true }).sort({ dateCreated: -1 });
    res.json(approvedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Single product by ID
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return res.status(500).json({ success: false });
  res.send(product);
});

// User-specific products
router.get('/user/:id', async (req, res) => {
  const userItems = await Product.find({ author: req.params.id }).populate("category").sort({ dateCreated: -1 });
  res.send(userItems);
});

// Product View Counter
router.get('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.views++;
    await product.save();
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Total count
router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json(productCount);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Region Filtering
const regions = ['accra', 'central', 'kumasi'];
regions.forEach(region => {
  router.get(`/region/${region}`, async (req, res) => {
    try {
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      const products = await Product.find({ region: formattedRegion }).populate("category").sort({ dateCreated: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

// Related Products
router.get('/:id/related', async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) return res.status(404).json({ success: false, message: 'Product not found' });
    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: req.params.id },
      approved: true,
    }).populate('category').populate('author').sort({ boost: -1, dateCreated: -1 }).limit(5);
    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Hot Products list
router.get(`/agric/hot`, async (req, res) => {
  try {
    const approvedProducts = await Product.find({ hot: true, approved: true }).populate("category").sort({ boost: -1, dateCreated: -1 });
    res.json(approvedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Hot Product Detail
router.get('/hot/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, hot: true, approved: true }).populate("category").populate("commentsec");
    if (!product) return res.status(404).json({ error: 'Hot product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Hot Related Products
router.get('/:id/hotrelated', async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) return res.status(404).json({ success: false, message: 'Product not found' });
    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: req.params.id },
      approved: true, hot: true
    }).populate('category').populate('author').sort({ boost: -1, dateCreated: -1 }).limit(5);
    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/* -------------------------------------------------------------------------- */
/* POST / PUT ROUTES                           */
/* -------------------------------------------------------------------------- */

router.post('/', upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'picturesec', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), async (req, res) => {
  try {
    const { name, phone, price, whatsapp, description, location, region, town, category } = req.body;
    const picture = req.files['picture'] ? req.files['picture'][0].path : null;
    const picturesec = req.files['picturesec'] ? req.files['picturesec'][0].path : null;
    const video = req.files['video'] ? req.files['video'][0].path : null;

    const newProduct = new Product({
      name, phone, whatsapp, description, price, location, region, town, category,
      author: req.body.userId, picture, picturesec, video
    });

    const savedProduct = await newProduct.save();

    // Notification Logic
    const users = await User.find({ pushToken: { $ne: null } });
    const messages = users.map(user => ({
      to: user.pushToken,
      sound: 'default',
      title: '🛍 New products on Linkpii',
      body: `${name} is now available! Check it out.`,
      data: { productId: savedProduct._id },
    }));

    for (let i = 0; i < messages.length; i += 100) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
    }
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'picturesec', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), async (req, res) => {
  try {
    const shopItem = await Product.findById(req.params.id);
    if (!shopItem) return res.status(404).json({ error: 'Shop item not found' });

    Object.assign(shopItem, req.body);
    if (req.files['picture']) shopItem.picture = req.files['picture'][0].path;
    if (req.files['picturesec']) shopItem.picturesec = req.files['picturesec'][0].path;
    if (req.files['video']) shopItem.video = req.files['video'][0].path;

    const updatedShopItem = await shopItem.save();
    res.json(updatedShopItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/boost', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { boost: true, dateCreated: Date.now() });
    const allApprovedProducts = await Product.find({ approved: true }).sort({ boost: -1, dateCreated: -1 });
    res.json(allApprovedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { approved: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/:id/hot", async (req, res) => {
  try {
    const employee = await Product.findByIdAndUpdate(req.params.id, { hot: true }, { new: true });
    if (!employee) return res.status(404).json({ message: 'Products not found' });
    return res.status(200).json({ message: 'Product sent to hot mode successfully', employee });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
});

/* -------------------------------------------------------------------------- */
/* DELETE ROUTES                               */
/* -------------------------------------------------------------------------- */

router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id).then(user => {
    if (user) return res.status(200).json({ success: true, message: "deleted successfully" });
    return res.status(404).json({ success: false, message: "not found" });
  }).catch(err => {
    return res.status(400).json({ success: false, error: err });
  });
});

module.exports = router;