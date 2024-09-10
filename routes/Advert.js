const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Advert } = require('../models/advert');

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
  

router.get(`/advert`, async (req, res)=>{
  
    const productList = await Advert.find().sort({ dateCreated: -1 })
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })




router.get('/advert/count', async (req, res) => {
  try {
    const productCount = await Advert.countDocuments();
    res.json(productCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
 

 
// Create a new product with image upload
router.post('/advert', upload.single('picture'), async (req, res) => {
  try {
    const {name, phone, whatsapp, author}= req.body;
    const picture = req.file ? req.file.path : null; 

    // const cloudinaryResult = await cloudinary.uploader.upload(picture);

    // Create a new product instance
    const newProduct = new Advert({
      name,
      phone,
      author,
      whatsapp,
      picture: picture,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/advert/:id', upload.single('picture'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, whatsapp, author } = req.body;
    const picture = req.file ? req.file.path : null;

    // Find the advert by ID
    let advert = await Advert.findById(id);
    if (!advert) {
      return res.status(404).json({ error: 'Advert not found' });
    }

    // Update the advert details
    advert.name = name || advert.name;
    advert.phone = phone || advert.phone;
    advert.whatsapp = phone || advert.whatsapp;

    // If a new picture is provided, update the picture field
    if (picture) {
      advert.picture = picture; 
    }

    // Save the updated advert to the database
    const updatedAdvert = await advert.save();

    res.json(updatedAdvert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





 router.delete("/advert/:id",(req, res)=>{
    Advert.findByIdAndRemove(req.params.id).then(user=>{
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