// Watermark applied at DELIVERY time, via the Cloudinary URL itself - not
// at upload time. We first tried baking the watermark into the upload-time
// "incoming" transformation (multer-storage-cloudinary's `transformation`
// option), and it passed every test we ran directly against Cloudinary's
// API - but it silently did not apply on real uploads made through the
// live app, for reasons we could not pin down.
//
// So instead: don't touch how the file is uploaded at all. Just store the
// asset's delivery URL with the watermark transformation segment already
// baked into the URL path. Cloudinary re-applies that transformation every
// single time the URL is fetched - when the app displays it, and equally
// when someone right-clicks "Save image/video as" - so there's no upload
// step that can silently skip it.
const WATERMARK_URL_TRANSFORM = 'co_white,g_south_east,l_text:Arial_30:linkpii.com,o_60,x_10,y_10';

// Turns a plain Cloudinary delivery URL into one with the watermark baked
// in, e.g.
//   https://res.cloudinary.com/<cloud>/image/upload/v169.../upload/abc.jpg
// becomes
//   https://res.cloudinary.com/<cloud>/image/upload/<transform>/v169.../upload/abc.jpg
// Works for both /image/upload/ and /video/upload/ URLs. Safe to call on
// anything - non-Cloudinary values, null/undefined, or a URL that already
// has the watermark - and returns the input unchanged in those cases.
function withWatermark(url) {
  if (!url || typeof url !== 'string') return url;
  if (!/\/(image|video)\/upload\//.test(url)) return url;
  if (url.includes(WATERMARK_URL_TRANSFORM)) return url;
  return url.replace(/\/(image|video)\/upload\//, `/$1/upload/${WATERMARK_URL_TRANSFORM}/`);
}

module.exports = { withWatermark, WATERMARK_URL_TRANSFORM };
