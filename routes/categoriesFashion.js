const express = require('express');
const router = express.Router();
const {Products} = require('../models/categories/fashion')
const multer = require('multer');
const cloudinary = require("cloudinary").v2
// const sharp = require('sharp');
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');

router.get(`/`, async (req,res)=>{
  
    const productList = await Products.find()
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })


 
 router.get(`/:id`, async (req,res)=>{
    const product = await Products.findById(req.params.id)
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
 })


 

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
    const { name } = req.body;

    // Check if picture is present in the request
    const picture = req.file ? req.file.path : '';



    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(picture);

    // Create a new product instance
    const newProduct = new Products({
      name,
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



 

 router.delete("/:id",(req, res)=>{
    Products.findByIdAndRemove(req.params.id).then(user=>{
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