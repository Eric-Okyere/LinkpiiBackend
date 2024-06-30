const mongoose = require("mongoose");

const ComplianSchema = mongoose.Schema({

   
    sendername:{
       type: String,
        require:true
    },
    senderphone:{
       type: String,
        require:true
    },
    product:{
       type: String,
        require:true
    },

    productphone:{
        type: String,
        require:true
    },
    complaint:{
        type: String,
        require:true
    },
    dateCreated:{
        type:Date, 
        default: Date.now 
      },
})

exports.Complaints = mongoose.model("Complaints", ComplianSchema)
