const express = require("express");
const { Car } = require("../models/Car/CarModel");
const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require("cloudinary").v2


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



router.get("/", async(req, res)=>{
    const cars = await Car.find().populate("author").sort({ dateCreated: -1 });

    if(!cars){
        res.status(500).json({success: false})
    }
    res.send(cars)
})

router.get(`/:id`, async (req,res)=>{
  const product = await Car.findById(req.params.id)
  if(!product){
      res.status(500).json({success: false})
  }
  res.send(product)
})

router.get('/users/:id',async(req, res)=>{

    
    const userItems = await Car.find({author:req.params.id}).sort({ dateCreated: -1 });
    res.send(userItems);

})


router.get('/products/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the product by ID
    const product = await Car.findById(productId);

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



router.get('/get/countcar', async (req, res) => {
  try {
    const carCount = await Car.countDocuments();
    res.json(carCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/approvedcars', async (req, res) => {
  try {
    const approvedCars = await Car.find({ approved: true }).sort({ dateCreated: -1 });

    if (!approvedCars) {
      return res.status(500).json({ success: false });
    }

    return res.send(approvedCars);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Create a new product with image upload
router.post('/createcar', upload.fields([
  { name: 'carpic', maxCount: 1 },
  { name: 'driverpic', maxCount: 1 },
]), async (req, res) => {
  try {
    // Extract data from the request
    const { name, location, carnum, region, town, phone, card,
      // whatsapp,
      size} = req.body;

    // Check if picture is present in the request
    const carpic = req.files['carpic'][0].path;
    const driverpic = req.files['driverpic'][0].path;



    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(carpic);
    const cloudinaryRe = await cloudinary.uploader.upload(driverpic);

    // Create a new product instance
    const newProduct = new Car({
      name,
      location,
      carnum,
      region,
      town,
      phone,
      size,
      card,
      // whatsapp,
      author: req.body.userId,
      carpic: cloudinaryResult.secure_url,
      driverpic: cloudinaryRe.secure_url,
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
  { name: 'carpic', maxCount: 1 },
  { name: 'driverpic', maxCount: 1 },
]), async (req, res) => {
  try {
    // Extract data from the request
    const { name, location, carnum, region, town, phone, card,
      // whatsapp, 
      size } = req.body;
    const carId = req.params.id;

    // Check if pictures are present in the request
    const carpic = req.files['carpic'][0].path;
    const driverpic = req.files['driverpic'][0].path;

    // Upload images to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(carpic);
    const cloudinaryRe = await cloudinary.uploader.upload(driverpic);

    // Find and update the existing car
    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      {
        name,
        location,
        carnum,
        // whatsapp,
        size,
        region,
        card,
        town,
        phone,
        carpic: cloudinaryResult.secure_url,
        driverpic: cloudinaryRe.secure_url,
      },
      { new: true }
    );

    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/:id/approvecar', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Car.findByIdAndUpdate(productId, { approved: true }, { new: true });

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
    const product = await Car.findByIdAndUpdate(productId, { approved: false }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.delete("/:id",(req, res)=>{
  Car.findByIdAndRemove(req.params.id).then(user=>{
      if(user){
          return res.status(200).json({success:true, message:"the car is deleted successfully"})
      } else{
          return res.status(404).json({success: false, message: "car not found"})
      }
  }).catch(err=>{
      return res.status(400).json({success: false, error: err})
  })
})




module.exports = router;