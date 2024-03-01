const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {Mechanics} = require("../models/Mechanics/Mechanicsmodel")


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
  
    const productList = await Mechanics.find().sort({ dateCreated: -1 })
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })




 router.get('/approved', async (req, res) => {
  try {
    const approvedProducts = await Mechanics.find({ approved: true }).sort({ dateCreated: -1 })

    res.json(approvedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


 
 router.get(`/:id`, async (req,res)=>{
    const product = await Mechanics.findById(req.params.id)
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
 })

 router.get('/user/:id',async(req, res)=>{
    console.log(req.params.id)
    const userItems=await Mechanics.find({author:req.params.id}).sort({ dateCreated: -1 })

    // res.send({success:'true',userItems})
    res.send(userItems)
})


router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Mechanics.countDocuments();
    res.json(productCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


 


router.post('/', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'servpic', maxCount: 1 },
  ]), async (req, res) => {
    try {
      // Extract data from the request
      const { name, location, services, region, town, phone} = req.body;
  
      // Check if picture is present in the request
      const picture = req.files['picture'][0].path;
      const servpic = req.files['servpic'][0].path;
  
  
  
      // Upload image to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(picture);
      const cloudinaryRe = await cloudinary.uploader.upload(servpic);
  
      // Create a new product instance
      const newProduct = new Mechanics({
        name,
        location,
        services,
        region,
        town,
        phone,
        author: req.body.userId,
        picture: cloudinaryResult.secure_url,
        servpic: cloudinaryRe.secure_url,
      });
  
      // Save the product to the database
      const savedProduct = await newProduct.save();
  
      res.json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  
  // Edit an existing car
  router.put('/:id', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'servpic', maxCount: 1 },
  ]), async (req, res) => {
    try {
      // Extract data from the request
      const { name, location, services, region, town, phone } = req.body;
      const carId = req.params.id;
  
      // Check if pictures are present in the request
      const carpic = req.files['carpic'][0].path;
      const servpic = req.files['servpic'][0].path;
  
      // Upload images to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(carpic);
      const cloudinaryRe = await cloudinary.uploader.upload(servpic);
  
      // Find and update the existing car
      const updatedCar = await Mechanics.findByIdAndUpdate(
        carId,
        {
          name,
          location,
          services,
          region,
          town,
          phone,
          carpic: cloudinaryResult.secure_url,
          servpic: cloudinaryRe.secure_url,
        },
        { new: true }
      );
  
      res.json(updatedCar);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.put('/:id/approve', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Mechanics.findByIdAndUpdate(productId, { approved: true }, { new: true });

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
    Mechanics.findByIdAndRemove(req.params.id).then(user=>{
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