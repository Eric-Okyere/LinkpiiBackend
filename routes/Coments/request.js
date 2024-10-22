const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../../models/user');
const { Reqt } = require('../../models/call/request');


router.post('/forgpass', async (req, res) => {
    const { phone, password, usermessage } = req.body;

    try {
        let user;

        // Check if the user exists by phone number
        if (phone) {
            user = await User.findOne({ phone });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Phone number does not exist'
                });
            }
        }

        // Check if the password exists and is correct
        if (password) {
            if (!user) {
                user = await User.findOne({ password });  // If user was not found via phone, check for password
            }
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User with this password does not exist'
                });
            }

            const isPasswordCorrect = await user.comparePassword(password);
            if (!isPasswordCorrect) {
                return res.status(401).json({
                    success: false,
                    message: 'Password is incorrect'
                });
            }
        }

        // At this point, either the phone or the password was validated
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Neither phone number nor password exists in the system'
            });
        }

        // Create a new request
        const newRequest = new Reqt({ phone: user.phone, usermessage });
        await newRequest.save();

        return res.status(200).json({
            success: true,
            message: 'A link will be sent to your WhatsApp account to continue the process.',
            data: newRequest
        });

    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});




router.get('/requests', async (req, res) => {
    const { phone } = req.query; // Optional phone query parameter

    try {
        let requests;

        if (phone) {
            // If phone number is provided, fetch requests for that specific number, sorted by date
            requests = await Reqt.find({ phone }).sort({ dateCreated: -1 });
        } else {
            // Otherwise, fetch all requests, sorted by date
            requests = await Reqt.find().sort({ dateCreated: -1 });
        }

        // Respond with the retrieved and sorted requests
        return res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});




router.delete("/reqt/:id",(req, res)=>{
    Reqt.findByIdAndRemove(req.params.id).then(product=>{
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
