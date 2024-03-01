const express = require('express');
const router = express.Router();
const {Member} = require('../models/members/postMem')
const Category = require("../models/categories/categories")


router.get(`/`, async (req,res)=>{
    const MemberList = await Member.find().populate("category")
    if(!MemberList){
        res.status(500).json({success: false})
    }
    res.send(MemberList)
 })
 
 router.get(`/:id`, async (req,res)=>{
    const member = await Member.findById(req.params.id).populate('category')
    if(!member){
        res.status(500).json({success: false})
    }
    res.send(member)
 })
 

 
 router.post(`/`, async(req, res)=>{

 
    const member = await new Member({
       name:req.body.name,
       birthday:req.body.birthday,
       phone:req.body.phone,
        digitalAddress:req.body.digitalAddress,
       place:req.body.place,
       hometown:req.body.hometown,
       region:req.body.region,
        district:req.body. district,
        marital:req.body.marital,
        spouse:req.body.spouse,
        spouseNumber:req.body.spouseNumber,
       father:req.body.father,
       emergency:req.body.emergency,
       alive:req.body.alive,
       join:req.body.join,
       baptize:req.body.baptize,
       dayBorn:req.body.dayBorn,
       profession:req.body.profession,
       emplymentStatus:req.body.emplymentStatus,
       profInterest:req.body.profInterest,
       education:req.body.education,
        talent:req.body. talent,
      
       category:req.body.category
 
    })
        member.save();
    if(!member)
    return res.status(500).send('The Member cannot be created')
   
    res.send(member)
 })
 
 
 
 
 
 router.delete("/:id",(req, res)=>{
    Member.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:"the users is deleted successfully"})
        } else{
            return res.status(404).json({success: false, message: "users not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
 })
 
 module.exports = router;






 const mongoose = require("mongoose");

const Member = mongoose.Schema({
    name:{
       type: String,
        require:true
    },
    birthday:{
        type: String,
        require:true
    }, 
    phone:{
        type: Number,
        default:0
    }, 
    digitalAddress:{
        type: String,
        require:true
    }, 

    place:{
        type: String,
        require:true
    }, 

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required: true
    },

    hometown:{
        type:String,
        require:true
    },

    region:{
        type:String,
        default:""
    },
    district:{
        type:String,
        default:""
    },
    marital:{
        type:String,
        default:""
    },
    spouse:{
        type:String,
        default:""
    },
    spouseNumber:{
        type:Number,
        default:0
    },
    father:{
        type:String,
        default:""
    },
    emergency:{
        type:Number,
        default:0
    },
    alive:{
        type:String,
        default:""
    },
    join:{
        type:Number,
        default:0
    },
    baptize:{
        type:String,
        default:""
    },
   
    dayBorn:{
        type:String,
        default:""
    },
    profession:{
        type:String,
        default:""
    },
    emplymentStatus:{
        type:String,
        default:""
    },
    profInterest:{
        type:String,
        default:""
    },
    education:{
        type:String,
        default:""
    },
    talent:{
        type:String,
        default:""
    },
   
   
   
    dateCreated:{
        type:Date, 
        default: Date.now 
    },
})

Member.virtual('id').get(function(){
    return this._id.toHexString();
})

Member.set('toJSON', {
    virtuals: true
})


exports.Product = mongoose.model("members", Member)
