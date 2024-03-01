const express = require('express');
const { Vodafone } = require('../models/CodesFolder/Vodafone');
const router = express.Router();
require("dotenv/config")



router.get("/", async(req, res)=>{
 
    const codeList = await Vodafone.find()
    .sort({ dateCreated: -1 })
    if(!codeList){
        res.status(500).json({success: false})
    }
    res.send(codeList)
});




router.post('/', async (req, res) => {
    const { name, code } = req.body;

    try {
        // Create a new MTN record
        const voda = new Vodafone({ name, code });
        
        // Save the MTN record to the database
        await voda.save();

        return res.status(201).json(voda);
    } catch (error) {
        console.error('Error creating Vodafone record:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete("/:id",(req, res)=>{
    Vodafone.findByIdAndRemove(req.params.id).then(user=>{
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