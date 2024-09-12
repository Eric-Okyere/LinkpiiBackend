const express = require("express");
const { Okada } = require("../models/Okada/Okada");
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
    folder: 'upload', 
    format: 'jpg', 
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' }, 
      { quality: 'auto:eco', fetch_format: 'auto' } 
    ]
  },
});

const upload = multer({ storage: storage });



router.get("/", async(req, res)=>{
    const cars = await Okada.find().sort({ dateCreated: -1 });

    if(!cars){
        res.status(500).json({success: false})
    }
    res.send(cars)
})

router.get(`/:id`, async (req,res)=>{
  const product = await Okada.findById(req.params.id)
  if(!product){
      res.status(500).json({success: false})
  }
  res.send(product)
})

router.get('/users/:id',async(req, res)=>{

    
    const userItems = await Okada.find({author:req.params.id}).sort({ dateCreated: -1 });
    res.send(userItems);

})

router.get('/get/countokada', async (req, res) => {
  try {
    const carCount = await Okada.countDocuments();
    res.json(carCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/okadaview/:productId', async (req, res) => {
    const productId = req.params.productId;
  
    try {
      // Find the product by ID
      const product = await Okada.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Increment the view count
      product.view++;
  
      // Save the updated product document
      await product.save();
  
      // Return the product details with the updated view count
      return res.json(product);
    } catch (error) {
      console.error('Error viewing product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });



router.get('/motor/approved', async (req, res) => {
  try {
    const approvedCars = await Okada.find({ approved: true }).sort({ dateCreated: -1 });

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
router.post('/', upload.fields([
  { name: 'carpic', maxCount: 1 },
  { name: 'driverpic', maxCount: 1 },
]), async (req, res) => {
  try {
    // Extract data from the request
    const { name, location, carnum, region, town, phone, card,whatsapp,} = req.body;

    // Check if picture is present in the request
    // const carpic = req.files['carpic'][0].path;
    // const driverpic = req.files['driverpic'][0].path;
    const carpic = req.files['carpic'] ? req.files['carpic'][0].path : null;
    const driverpic = req.files['driverpic'] ? req.files['driverpic'][0].path : null;



    // Upload image to Cloudinary
    // const cloudinaryResult = await cloudinary.uploader.upload(carpic);
    // const cloudinaryRe = await cloudinary.uploader.upload(driverpic);

    // Create a new product instance
    const newProduct = new Okada({
      name,
      location,
      carnum,
      region,
      whatsapp,
      town,
      phone,
      card,
      author: req.body.userId,
      carpic: carpic,
      driverpic: driverpic,
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
    const { name, location, carnum, region, town, phone,whatsapp, card } = req.body;
    const carId = req.params.id;

    // Check if pictures are present in the request
    // const carpic = req.files['carpic'][0].path;
    // const driverpic = req.files['driverpic'][0].path;
    const carpic = req.files['carpic'] ? req.files['carpic'][0].path : null;
    const driverpic = req.files['driverpic'] ? req.files['driverpic'][0].path : null;


    // Upload images to Cloudinary
    // const cloudinaryResult = await cloudinary.uploader.upload(carpic);
    // const cloudinaryRe = await cloudinary.uploader.upload(driverpic);

    // Find and update the existing car
    const updatedCar = await Okada.findByIdAndUpdate(
      carId,
      {
        name,
        location,
        carnum,
        region,
        town,
        whatsapp,
        card,
        phone,
        carpic: carpic,
        driverpic: driverpic,
      },
      { new: true }
    );

    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/:id/approveokada', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Okada.findByIdAndUpdate(productId, { approved: true }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/deactivateokada', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Okada.findByIdAndUpdate(productId, { approved: false }, { new: true });

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
  Okada.findByIdAndRemove(req.params.id).then(user=>{
      if(user){
          return res.status(200).json({success:true, message:"the okada is deleted successfully"})
      } else{
          return res.status(404).json({success: false, message: "okada not found"})
      }
  }).catch(err=>{
      return res.status(400).json({success: false, error: err})
  })
})




module.exports = router;