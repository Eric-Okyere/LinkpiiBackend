const express = require('express');
const router = express.Router();
const {Product} = require('../models/products/Fashion')
const multer = require('multer');
const cloudinary = require("cloudinary").v2
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Products } = require('../models/categories/fashion');




cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
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
          { width: 600, height: 300, crop: 'limit' }, // Limit to 640x360 resolution
          { quality: 'auto:best' }, // Set lower quality for compression
          { video_codec: 'h264' }, // Use H.264 codec for better compression
          { bit_rate: '1500k' }, // Limit the bitrate to 500 kbps
          { audio_codec: 'aac', audio_frequency: 48000 }, // Compress audio as well
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




router.get(`/`, async (req,res)=>{
  
    const productList = await Product.find().populate("category").populate("author").populate("commentsec").sort({ dateCreated: -1 })
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })


 router.get("/detail", async (req, res) => {
  try {
      // Find all categories
      const categories = await Products.find();

      // Array to store category with approved products
      const categoriesWithApprovedProducts = [];

      // Iterate through each category
      for (const category of categories) {
          // Find products associated with the category where approved is true
          const products = await Product.find({ category: category._id, approved: true });

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
    const approvedProducts = await Product.find({ approved: true }).populate("category").populate("commentsec").sort({boost:-1, dateCreated: -1 });

    res.json(approvedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



 
 router.get(`/:id`, async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category')
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
 })

 router.get('/user/:id',async(req, res)=>{
    console.log(req.params.id)
    const userItems=await Product.find({author:req.params.id}).populate("category").sort({ dateCreated: -1 })

    // res.send({success:'true',userItems})
    res.send(userItems)
})


router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
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
    const product = await Product.findById(productId);

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

router.get('/region/central', async (req, res) => {
  try {
    const accraProducts = await Product.find({ region: 'Central' }).populate("category").sort({ dateCreated: -1 });

    if (!accraProducts) {
      return res.status(404).json({ message: 'No products found with region set to "accra"' });
    }

    res.json(accraProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/region/accra', async (req, res) => {
  try {
    const accraProducts = await Product.find({ region: 'Accra' }).populate("category").sort({ dateCreated: -1 });

    if (!accraProducts) {
      return res.status(404).json({ message: 'No products found with region set to "accra"' });
    }

    res.json(accraProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new product with image upload
// router.post('/', upload.fields([
//     { name: 'picture', maxCount: 1 },
//     { name: 'picturesec', maxCount: 1 },
//   ]), async (req, res) => {
//     try {
//       // Extract data from the request
//       const {  name,
//         phone,
//         price,
//         description,
//         condition,
//         location,
//         whatsapp,
//         region,
//         town,
//         category} = req.body;
  
//       // Check if picture is present in the request
//       const picture = req.files['picture'][0].path;
//       const picturesec = req.files['picturesec'][0].path;
  
  
  
//       // Upload image to Cloudinary
//       const cloudinaryResult = await cloudinary.uploader.upload(picture);
//       const cloudinaryRe = await cloudinary.uploader.upload(picturesec);
  
//       // Create a new product instance
//       const newProduct = new Product({
//         name,
//         phone,
//         condition,
//         price,
//         whatsapp,
//         description,
//         location,
//         region,
//         town,
//         category,
//         author: req.body.userId,
//         picture: cloudinaryResult.secure_url,
//         picturesec: cloudinaryRe.secure_url,
//       });
  
//       // Save the product to the database
//       const savedProduct = await newProduct.save();
  
//       res.json(savedProduct);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
  router.post('/', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'picturesec', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]), async (req, res) => {
    try {
      // Extract data from the request
      const { name, phone,price, whatsapp, description, location, region, town, category, condition, discount } = req.body;
  
      // Check if files are present in the request
      const picture = req.files['picture'] ? req.files['picture'][0].path : null;
      const picturesec = req.files['picturesec'] ? req.files['picturesec'][0].path : null;
      const video = req.files['video'] ? req.files['video'][0].path : null;
  
      // Create a new product instance
      const newProduct = new Product({
        name,
        discount,
        phone,
        whatsapp,
        description,
        price,
        location,
        condition,
        region,
        town,
        category,
        author: req.body.userId,
        picture: picture, // Use the path provided by multer
        picturesec: picturesec, // Use the path provided by multer
        video: video, // Use the path provided by multer
      });
  
      // Save the product to the database
      const savedProduct = await newProduct.save();
  
      res.json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
 
  router.put('/:id', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'picturesec', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone,price, whatsapp, description, location, region, town, category, condition, discount } = req.body;
  
      // Find the shop item by ID
      const shopItem = await Product.findById(id);
      if (!shopItem) {
        return res.status(404).json({ error: 'Shop item not found' });
      }
  
      // Update fields
      shopItem.name = name || shopItem.name;
      shopItem.name = discount || shopItem.discount;
      shopItem.price = price || shopItem.price;
      shopItem.condition = condition || shopItem.condition;
      shopItem.phone = phone || shopItem.phone;
      shopItem.whatsapp = whatsapp || shopItem.whatsapp;
      shopItem.description = description || shopItem.description;
      shopItem.location = location || shopItem.location;
      shopItem.region = region || shopItem.region;
      shopItem.town = town || shopItem.town;
      shopItem.category = category || shopItem.category;
      shopItem.author = req.body.userId || shopItem.author;
  
      // Update files if new ones are uploaded
      if (req.files['picture']) {
        shopItem.picture = req.files['picture'][0].path;
      }
      if (req.files['picturesec']) {
        shopItem.picturesec = req.files['picturesec'][0].path;
      }
      if (req.files['video']) {
        shopItem.video = req.files['video'][0].path;
      }
  
      // Save the updated shop item
      const updatedShopItem = await shopItem.save();
  
      res.json(updatedShopItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

router.put('/:id/approve', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByIdAndUpdate(productId, { approved: true }, { new: true });

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
    // Find the product by ID and update its boost field to true
    const product = await Product.findByIdAndUpdate(productId, { boost: true, dateCreated: Date.now() }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch all approved products, sorting by the boost field in descending order
    const allApprovedProducts = await Product.find({ approved: true }).sort({ boost: -1, dateCreated: -1 });

    res.json(allApprovedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByIdAndUpdate(productId, { approved: false }, { new: true });

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
    Product.findByIdAndRemove(req.params.id).then(product=>{
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