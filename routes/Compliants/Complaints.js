const express = require('express');
const { Complaints } = require('../../models/compliants/compliants');
const router = express.Router();
require("dotenv/config")
const bodyParser = require('body-parser');

// Middleware to parse JSON and form data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));



router.get("/", async(req, res)=>{
 
    const codeList = await Complaints.find()
    .sort({ dateCreated: -1 })
    if(!codeList){
        res.status(500).json({success: false})
    }
    res.send(codeList)
});

router.get('/get/count', async (req, res) => {
    try {
      const callCount = await Complaints.countDocuments();
      res.json(callCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post('/', async (req, res) => {
    const { sendername, senderphone, product, productphone, complaint } = req.body;
  
    // if (!sendername || !senderphone || !product || !productphone || !complaint) {
    //   return res.status(400).json({ message: "All fields are required" });
    // }
  
    const newComplaint = new Complaints({
      sendername,
      senderphone,
      product,
      productphone,
      complaint,
    });
  
    try {
      const savedComplaint = await newComplaint.save();
      res.status(201).json(savedComplaint);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


router.delete("/:id",(req, res)=>{
    Complaints.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:"the call is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "call not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })






module.exports = router;