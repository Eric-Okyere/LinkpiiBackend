const mongoose = require("mongoose")
const { collection } = require("../user")

const PdfsSchema = new mongoose.Schema({
    pdf: String,
    title: String
},{ collection:"PdfDetails"})

mongoose.model("PdfDetails", PdfsSchema)