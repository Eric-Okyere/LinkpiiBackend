const express = require('express');
const { Whatsapp } = require('../models/call/whatsapp');
const router = express.Router();
require("dotenv/config")


router.get("/", async(req, res)=>{
 
    const codeList = await Whatsapp.find()
    .sort({ dateCreated: -1 })
    if(!codeList){
        res.status(500).json({success: false})
    }
    res.send(codeList)
});

router.get('/get/count', async (req, res) => {
    try {
      const WhatsappCount = await Whatsapp.countDocuments();
      res.json(WhatsappCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.post('/', async (req, res) => {
    const { name, phone, email, receiverphone, recname, pagename } = req.body;

    try {
        // Create a new Airtel record
        const Whatsapper = new Whatsapp({ name, phone, email, receiverphone, recname, pagename });
        
        // Save the Airtel record to the database
        await Whatsapper.save();

        return res.status(201).json(Whatsapper);
    } catch (error) {
        console.error('Error creating Whatsapper record:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete("/:id",(req, res)=>{
    Whatsapp.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:"the Whatsapp is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "Whatsapp not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })






module.exports = router;