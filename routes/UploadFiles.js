const multer = require("multer");
const express = require("express");
const { default: mongoose } = require("mongoose");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const router = express.Router();
require("../models/PdfSchema/MyPdfs");
const PdfSchema = mongoose.model("PdfDetails");

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

// Use multer's memory storage to store files in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST route for uploading files
router.post("/uploadfiles", upload.single("file"), async (req, res) => {
  const title = req.body.title;
  const fileBuffer = req.file.buffer; // Get file buffer from multer

  try {
    // Upload file to Cloudinary using a stream
    const cloudinaryUploadStream = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "raw" }, // Use 'raw' for non-image files
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Pipe the buffer to the upload stream
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    };

    // Get the Cloudinary result
    const result = await cloudinaryUploadStream(fileBuffer);

    // Save PDF details to the database
    await PdfSchema.create({ title: title, pdf: result.secure_url });

    res.json({ status: "success", url: result.secure_url });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET route for retrieving PDF details
router.get("/pdfdetails", async (req, res) => {
  try {
    const pdfDetails = await PdfSchema.find(); // Fetch all PDF details from the database
    res.json({ status: "success", data: pdfDetails });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
