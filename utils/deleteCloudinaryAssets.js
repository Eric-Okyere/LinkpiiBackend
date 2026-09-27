const cloudinary = require("cloudinary").v2;

// Cloudinary delivery URLs look like:
//   https://res.cloudinary.com/<cloud_name>/image/upload/v1699999999/upload/abc123.jpg
//   https://res.cloudinary.com/<cloud_name>/video/upload/v1699999999/upload/abc123.mp4
// The public_id cloudinary.uploader.destroy() needs is the folder + filename
// with no version segment and no extension, e.g. "upload/abc123".
function extractPublicId(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?([^?]+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

async function destroyIfCloudinaryAsset(url, resourceType) {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Error deleting Cloudinary ${resourceType} asset (${publicId}):`, error);
  }
}

// Default field shape used by most listing schemas (picture, picturesec, video).
const DEFAULT_FIELDS = [
  { field: "picture", resourceType: "image" },
  { field: "picturesec", resourceType: "image" },
  { field: "video", resourceType: "video" },
];

// Deletes a listing document's uploaded media from Cloudinary. `fields` lets
// callers describe their own schema's upload fields (e.g. Cars use carpic /
// driverpic instead of picture / picturesec) - it defaults to the common
// picture / picturesec / video shape used by most listing types. Safe to
// call with any document shape: fields that are missing, blank, or aren't
// Cloudinary URLs are silently skipped, and any Cloudinary error is caught
// and logged per-asset so a failed cleanup never blocks the caller's own
// delete response.
async function deleteListingAssets(doc, fields = DEFAULT_FIELDS) {
  if (!doc) return;
  await Promise.all(
    fields.map(({ field, resourceType }) => destroyIfCloudinaryAsset(doc[field], resourceType))
  );
}

module.exports = { deleteListingAssets, destroyIfCloudinaryAsset, extractPublicId };
