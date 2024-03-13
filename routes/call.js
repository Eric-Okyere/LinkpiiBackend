const express = require('express');
const { Call } = require('../models/call/call');
const router = express.Router();
require("dotenv/config")


router.get("/", async(req, res)=>{
 
    const codeList = await Call.find()
    .sort({ dateCreated: -1 })
    if(!codeList){
        res.status(500).json({success: false})
    }
    res.send(codeList)
});

router.get('/get/count', async (req, res) => {
    try {
      const callCount = await Call.countDocuments();
      res.json(callCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.post('/', async (req, res) => {
    const { name, phone, email, receiverphone, recname } = req.body;

    try {
        // Create a new Airtel record
        const caller = new Call({ name, phone, email, receiverphone, recname });
        
        // Save the Airtel record to the database
        await caller.save();

        return res.status(201).json(caller);
    } catch (error) {
        console.error('Error creating caller record:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete("/:id",(req, res)=>{
    Call.findByIdAndRemove(req.params.id).then(user=>{
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