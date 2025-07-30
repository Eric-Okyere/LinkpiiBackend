const express = require('express');
const router = express.Router();
const {Food} = require('../models/Food/Food')
const multer = require('multer');
const cloudinary = require("cloudinary").v2
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const User = require('../models/user');




cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'upload';

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
          { audio_codec: 'aac', audio_frequency: 48000 }, 
          { duration: "10.0" }
        ]
      };
    }

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




router.get("/", async (req, res) => {
  try {
    const productList = await Food.find()
      .populate("category")
      .populate("author")
      .populate("comments")
      .sort({ dateCreated: -1 });

    if (!productList) {
      return res.status(500).json({ success: false, message: "No products found" });
    }

    res.status(200).json(productList);
  } catch (err) {
    console.error("Error fetching product list:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


 router.get("/detail", async (req, res) => {
  try {
      // Find all categories
      const categories = await Food.find();

      // Array to store category with approved products
      const categoriesWithApprovedProducts = [];

      // Iterate through each category
      for (const category of categories) {
          // Find products associated with the category where approved is true
          const products = await Food.find({ category: category._id, approved: true });

          // Add category with approved products to the result array
          categoriesWithApprovedProducts.push({
              // category: category,
              products: products
          });
      }

      res.json(categoriesWithApprovedProducts);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


 router.get(`/approved`, async (req, res) => {
  try {
    const approvedProducts = await Food.find({ approved: true }).populate("category").populate("comments").sort({boost:-1, dateBoost: -1,dateCreated:-1 });

    res.json(approvedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get hot products
 router.get(`/hot`, async (req, res) => {
  try {
    const approvedProducts = await Food.find({ hot: true, approved:true }).populate("category").populate("comments").sort({ dateHot: -1 });

    res.json(approvedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/hot/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Food.findOne({ _id: id, hot: true,approved:true })
      .populate("category")
      .populate("comments");

    if (!product) {
      return res.status(404).json({ error: 'Hot product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:id/hotrelated', async (req, res) => {
  try {
    const productId = req.params.id;
    const currentProduct = await Food.findById(productId).populate('category');
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const relatedProducts = await Food.find({
      category: currentProduct.category._id,
      _id: { $ne: productId },
      approved: true, hot: true
    })
      .populate('category')
      .populate('author')
      .sort({ boost: -1, dateCreated: -1 })
      .limit(5);

    if (!relatedProducts.length) {
      return res.status(404).json({ success: false, message: 'No related products found' });
    }

    res.json(relatedProducts);
  } catch (error) {
    console.error('Error in related products route:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

 
 router.get(`/:id`, async (req,res)=>{
    const product = await Food.findById(req.params.id).populate('category')
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
 })

 router.get('/user/:id',async(req, res)=>{
    console.log(req.params.id)
    const userItems=await Food.find({author:req.params.id}).populate("category").sort({ dateCreated: -1 })

    // res.send({success:'true',userItems})
    res.send(userItems)
})


router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Food.countDocuments();
    res.json(productCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


 // Assuming you have a route to handle viewing a product
router.get('/products/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the product by ID
    const product = await Food.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment the view count
    product.views++;

    // Save the updated product document
    await product.save();

    // Return the product details with the updated view count
    return res.json(product);
  } catch (error) {
    console.error('Error viewing product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/:id/related', async (req, res) => {
  try {
    const productId = req.params.id;
    const currentProduct = await Food.findById(productId).populate('category');
    if (!currentProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const relatedProducts = await Food.find({
      category: currentProduct.category._id,
      _id: { $ne: productId },
      approved: true,
    })
      .populate('category')
      .populate('author')
      .sort({ boost: -1, dateCreated: -1 })
      .limit(5);

    if (!relatedProducts.length) {
      return res.status(404).json({ success: false, message: 'No related products found' });
    }

    res.json(relatedProducts);
  } catch (error) {
    console.error('Error in related products route:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

  
 


router.post('/', upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'picturesec', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), async (req, res) => {
  try {
  const {
  name, foodtypes, region, town, location, phone, category, whatsapp, price, userId, description, openingTime, closingTime
} = req.body;

const latitude = parseFloat(req.body.latitude);
const longitude = parseFloat(req.body.longitude);


    const picture = req.files['picture']?.[0]?.path || null;
    const picturesec = req.files['picturesec']?.[0]?.path || null;
    const video = req.files['video']?.[0]?.path || null;

    const newProduct = new Food({
      name,
      foodtypes,
      region,
      town,
      location,
      phone,
      category,
      whatsapp,
      price,
      author: userId,
      picture,
      picturesec,
      video,
      latitude,
      longitude,
      description, openingTime, closingTime
    });

    const savedProduct = await newProduct.save();

    const users = await User.find({ pushToken: { $ne: null } });

    const messages = users.map(user => ({
      to: user.pushToken,
      sound: 'default',
      title: '🛍 New products on Linkpii',
      body: `${name} is now available! Check it out.`,
      data: { productId: savedProduct._id },
    }));

    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
    }

    res.status(201).json({ message: 'Product posted and users notified!', product: savedProduct });

  } catch (error) {
    console.error('Error posting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
  



 
  
  

router.put('/:id/approve', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Food.findByIdAndUpdate(productId, { approved: true }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/:id/boost', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Food.findByIdAndUpdate(
      productId,
      {
        $set: {
          boost: true,
          dateBoost: Date.now(),
        },
        $inc: {
          numofBoost: 1,
        },
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get all approved products sorted by boost and dateCreated
    const allApprovedProducts = await Food.find({ approved: true }).sort({ boost: -1, dateBoost: -1 });

    res.json(allApprovedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/:id/deactivate', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Food.findByIdAndUpdate(productId, { approved: false }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



 router.delete("/:id",(req, res)=>{
    Food.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true, message:"the product is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "product not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })

 

 
 module.exports = router;