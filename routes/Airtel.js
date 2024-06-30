const express = require('express');
const router = express.Router();
require("dotenv/config")
const { Airtel } = require('../models/CodesFolder/AirtelTigo');


router.get("/", async(req, res)=>{
 
    const codeList = await Airtel.find()
    .sort({ dateCreated: -1 })
    if(!codeList){
        res.status(500).json({success: false})
    }
    res.send(codeList)
});




router.post('/', async (req, res) => {
    const { name, code } = req.body;

    try {
        // Create a new Airtel record
        const airtel = new Airtel({ name, code });
        
        // Save the Airtel record to the database
        await airtel.save();

        return res.status(201).json(airtel);
    } catch (error) {
        console.error('Error creating Airtel record:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete("/:id",(req, res)=>{
    Airtel.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:"the code is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "code not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })






module.exports = router;