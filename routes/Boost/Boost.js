const express=  require("express");
router = express.Router()
const {Boost} = require("../../models/Boost/Boost");


router.get(`/`, async (req,res)=>{
  
    const productList = await Boost.find().sort({ dateCreated: -1 })
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
 })

router.get(`/count`, async (req,res)=>{
  
    const productList = await Boost.countDocuments()
    if(!productList){
        res.status(500).json({success: false})
    }
    res.json(productList)
 })


  router.delete("/:id",(req, res)=>{
    Boost.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true, message:"the product is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "product not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })


//  exports.userCount= async (req, res) => {
//   try { 
//     const userCount = await User.countDocuments();
//     res.json(userCount);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


 router.post('/', async (req, res) => {
    try {
      const {productname, pagename} = req.body;
  
      const newProduct = new Boost({productname, pagename});
  
      // Save the product to the database
      const savedProduct = await newProduct.save();
  
      res.json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  module.exports = router;