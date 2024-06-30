const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Buildingcats } = require('../models/categories/buildingCats');



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  
  const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'upload', 
        format: 'jpg', 
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'auto' }, 
          { quality: 'auto:eco', fetch_format: 'auto' } 
        ]
      },
    });
  
  const upload = multer({ storage: storage });



router.get(`/`, async (req,res)=>{
  
    const productList = await Buildingcats.find()
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })


 
 router.get(`/:id`, async (req,res)=>{
    const product = await Buildingcats.findById(req.params.id)
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
 })


 



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
    const newProduct = new Buildingcats({
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
    Buildingcats.findByIdAndRemove(req.params.id).then(user=>{
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