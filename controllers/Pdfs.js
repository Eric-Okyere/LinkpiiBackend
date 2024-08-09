const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Upload file to MongoDB
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Create a write stream
  const writestream = gfs.createWriteStream({
    filename: req.file.originalname,
    content_type: req.file.mimetype,
  });

  // Write the file buffer to GridFS
  writestream.write(req.file.buffer);
  writestream.end();

  writestream.on('close', (file) => {
    res.json({ file });
  });

  writestream.on('error', (err) => {
    res.status(500).json({ error: 'Failed to upload file' });
  });
};

// Retrieve file from MongoDB
const getFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: 'No file exists' });
    }

    // Check if the file is a PDF
    if (file.contentType === 'application/pdf') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ error: 'Not a PDF' });
    }
  });
};

module.exports = { uploadFile, getFile };
