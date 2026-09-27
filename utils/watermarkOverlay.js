// Text watermark applied as an "incoming" Cloudinary transformation at
// upload time (part of the same transformation chain that already resizes
// and compresses every picture/video on upload). Because it's baked into
// the stored asset itself - not a CSS/DOM overlay shown on the page - it
// stays on the file even if someone downloads it or grabs the raw
// Cloudinary URL directly.
const WATERMARK_TRANSFORMATION = {
  overlay: { font_family: "Arial", font_size: 30, text: "linkpii.com" },
  color: "white",
  opacity: 60,
  gravity: "south_east",
  x: 10,
  y: 10,
};

module.exports = { WATERMARK_TRANSFORMATION };
