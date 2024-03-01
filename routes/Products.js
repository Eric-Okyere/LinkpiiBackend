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
    const approvedProducts = await Product.find({ approved: true }).populate("category").sort({ dateCreated: -1 })

    res.json(approvedProducts);
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


router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json(productCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


 

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

// Create a new product with image upload
router.post('/', upload.single('picture'), async (req, res) => {
  try {
    // Extract data from the request
    const { name, description, region, town, location, category, phone, price } = req.body;

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



 
router.put("/:id", upload.single('picture'), async (req, res) => {
  try {
      // Retrieve other fields from the request body
      const {  name,
        phone,
        price,
        description,
        picture,
        location,
        region,
        town,
        category } = req.body;

      // Construct the update object
      const updateObject = {
          name,
          phone,
          price,
          description,
          picture,
          location,
          region,
          town,
          category
      };
     
      // Check if a file was uploaded
      if (req.file) {
          // Assuming 'picture' is the name attribute of your file input
          updateObject.picture = req.file.path; // Store the file path in the 'picture' field
         
      }

      // Update the product
      const product = await Product.findByIdAndUpdate(
          req.params.id,
          updateObject,
          { new: true }
      );

      if (!product)
          return res.status(500).send("The product cannot be updated");

      res.send(product);
  } catch (error) {
      res.status(500).json({ message: error.message });
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