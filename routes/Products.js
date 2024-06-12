const express = require('express');
const router = express.Router();
const {Product} = require('../models/products/products')
const multer = require('multer');
const cloudinary = require("cloudinary").v2
// const sharp = require('sharp');
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Car } = require('../models/Car/CarModel');
const { Category } = require('../models/categories/categories');



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'upload', // Specify the folder in Cloudinary where the images will be stored
    format: 'jpg', // Specify the format of the uploaded file
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' }, // Resize and crop the image
      { quality: 'auto:eco', fetch_format: 'auto' } // Optimize image quality and format
    ]
  },
});

const upload = multer({ storage: storage });





router.get(`/`, async (req,res)=>{
  
    const productList = await Product.find().populate("category").sort({ dateCreated: -1 })
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })


 router.get("/detail", async (req, res) => {
  try {
      // Find all categories
      const categories = await Category.find();

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


router.get('/approved', async (req, res) => {
  try {
    // Find all products, populating the category field, and sorting by the boost field first in descending order,
    // then by the dateCreated field in descending order
    const productList = await Product.find({ approved: true }).populate("category").sort({boost:-1, dateCreated: -1 });

    if (!productList) {
      return res.status(500).json({ success: false });
    }

    res.send(productList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/car/approved', async (req, res) => {
  try {
    const approvedProducts = await Car.find({ approved: true }).sort({ dateCreated: -1 })

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




router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json(productCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by region
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

router.get('/region/kumasi', async (req, res) => {
  try {
    const accraProducts = await Product.find({ region: 'Kumasi' }).populate("category").sort({ dateCreated: -1 });

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
router.post('/', upload.single('picture'), async (req, res) => {
  try {
    // Extract data from the request
    const { name, description, region, whatsapp, town, location, category, phone, price } = req.body;

    // Check if picture is present in the request
    const picture = req.file ? req.file.path : '';



    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(picture);

    // Create a new product instance
    const newProduct = new Product({
      name,
      description,
      region,
      town,
      location,
      whatsapp,
      category,
      phone,
      price,
      author: req.body.userId,
      picture: cloudinaryResult.secure_url,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/:id', upload.single('picture'), async (req, res) => {
  try {
    // Extract data from the request
    const { name, description, whatsapp, region, town, location, category, phone, price } = req.body;
    
    // Check if a file was provided with the request
    let pictureUrl = '';
    if (req.file) {
      // Upload image to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
      pictureUrl = cloudinaryResult.secure_url;
    }

    // Find the product by ID and update its fields
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      name,
      description,
      region,
      whatsapp,
      town,
      location,
      category,
      phone,
      price,
      whatsapp,
      picture: pictureUrl // Assign the Cloudinary URL to the picture field
    }, { new: true });

    // Return the updated product
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/:id/boost', async (req, res) => {
  const productId = req.params.id;

  try {
    // Find the product by ID and update its boost field to true
    const product = await Product.findByIdAndUpdate(productId, { boost: true ,dateCreated: Date.now()}, { new: true });

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




router.put('/:id/approve', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByIdAndUpdate(productId, { approved: true, }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
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
    Product.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:"the users is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "users not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })

 

 
 module.exports = router;