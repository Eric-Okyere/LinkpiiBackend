const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2
require("dotenv/config")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {Services} = require("../models/products/services");




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
  
    const productList = await Services.find().populate("category").sort({ dateCreated: -1 })
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })


// 


 router.get(`/approved`, async (req, res) => {
  try {
    const approvedProducts = await Services.find({ approved: true }).populate("category").sort({boost:-1, dateCreated: -1 });

    res.json(approvedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

 
 router.get(`/:id`, async (req,res)=>{
    const product = await Services.findById(req.params.id).populate("category")
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
 })

 router.get('/user/:id',async(req, res)=>{
    console.log(req.params.id)
    const userItems=await Services.find({author:req.params.id}).populate("category").sort({ dateCreated: -1 })

    // res.send({success:'true',userItems})
    res.send(userItems)
})


router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Services.countDocuments();
    res.json(productCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by region
router.get('/region/accra', async (req, res) => {
  try {
    const accraProducts = await Services.find({ region: 'Accra' }).populate("category").sort({ dateCreated: -1 });

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
    const accraProducts = await Services.find({ region: 'Central' }).populate("category").sort({ dateCreated: -1 });

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
    const accraProducts = await Services.find({ region: 'Kumasi' }).populate("category").sort({ dateCreated: -1 });

    if (!accraProducts) {
      return res.status(404).json({ message: 'No products found with region set to "accra"' });
    }

    res.json(accraProducts);
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
    const product = await Services.findById(productId);

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


// Create a new product with image upload
router.post('/', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'picturesec', maxCount: 1 },
  ]), async (req, res) => {
    try {
      // Extract data from the request
      const {  name,
        phone,
        price,
        whatsapp,
        description,
        location,
        region,
        town,
        category
        } = req.body;
  
      // Check if picture is present in the request
      const picture = req.files['picture'][0].path;
      const picturesec = req.files['picturesec'][0].path;
  
  
  
      // Upload image to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(picture);
      const cloudinaryRe = await cloudinary.uploader.upload(picturesec);
  
      // Create a new product instance
      const newProduct = new Services({
        name,
        phone,
        whatsapp,
        price,
        description,
        location,
        region,
        town,
        category,
        author: req.body.userId,
        picture: cloudinaryResult.secure_url,
        picturesec: cloudinaryRe.secure_url,
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
  ]), async (req, res) => {
    try {
      // Extract data from the request
      const { name, description, region, town, phone, location, whatsapp, price,category } = req.body;
      const carId = req.params.id;
  
      // Check if pictures are present in the request
      const picture = req.files['picture'] ? req.files['picture'][0].path : null;
      const picturesec = req.files['picturesec'] ? req.files['picturesec'][0].path : null;
  
      if (!picture || !picturesec) {
        return res.status(400).json({ error: 'Please upload both pictures' });
      }
  
      // Upload images to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(picture);
      const cloudinaryRe = await cloudinary.uploader.upload(picturesec);
  
      // Find and update the existing car
      const updatedCar = await Services.findByIdAndUpdate(
        carId,
        {
          name,
          description,
          region,
          price,
          whatsapp,
          town,
          phone,
          location,
          category,
          picture: cloudinaryResult.secure_url,
          picturesec: cloudinaryRe.secure_url,
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
    const product = await Services.findByIdAndUpdate(productId, { approved: true }, { new: true });

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
    const product = await Services.findByIdAndUpdate(productId, { boost: true,dateCreated: Date.now() }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch all approved products, sorting by the boost field in descending order
    const allApprovedProducts = await Services.find({ approved: true }).sort({ boost: -1, dateCreated: -1 });

    res.json(allApprovedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Services.findByIdAndUpdate(productId, { approved: false }, { new: true });

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
    Services.findByIdAndRemove(req.params.id).then(product=>{
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